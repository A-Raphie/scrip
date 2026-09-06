// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WeftIndex: one token, woven from Coinbase Tokenized Stocks on Base.
/// @notice Deposit USDC, receive index shares backed by a weighted basket of
///         B20 stock tokens. Redemption unwinds pro-rata back to USDC.
///         Valuation is multiplier-aware: B20 scaledBalanceOf is used so that
///         corporate actions (dividends/splits that rebase the multiplier)
///         accrue to share holders without breaking basket weights.
///         No owner. No upgrades. Deliberately minimal. Unaudited.
contract WeftIndex {
    //////////////////////////////////////////////////////////////
    // Reentrancy
    //////////////////////////////////////////////////////////////

    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "reentry");
        _locked = 2;
        _;
        _locked = 1;
    }

    //////////////////////////////////////////////////////////////
    // ERC20 (minimal, self-contained)
    //////////////////////////////////////////////////////////////

    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        if (a != type(uint256).max) allowance[from][msg.sender] = a - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    //////////////////////////////////////////////////////////////
    // Basket
    //////////////////////////////////////////////////////////////

    address public immutable usdc;
    address[] public tokens;
    uint256[] public weightsBps;
    address[] public pools;
    address[] public feeds;

    uint256 public constant BPS = 10_000;
    uint256 public constant MAX_STALENESS = 10 days;
    uint256 public constant MIN_FIRST_DEPOSIT = 5e6; // $5
    uint256 public constant DEAD_SHARES = 1e15;
    uint160 private constant MIN_SQRT = 4295128741;
    uint160 private constant MAX_SQRT =
        1461446703485210103287273052203988822378723970341;

    event Woven(address indexed user, uint256 usdcIn, uint256 sharesMinted);
    event Unwoven(address indexed user, uint256 sharesBurned, uint256 usdcOut);

    constructor(
        string memory name_,
        string memory symbol_,
        address usdc_,
        address[] memory tokens_,
        uint256[] memory weightsBps_,
        address[] memory pools_,
        address[] memory feeds_
    ) {
        require(
            tokens_.length == weightsBps_.length &&
                tokens_.length == pools_.length &&
                tokens_.length == feeds_.length,
            "len"
        );
        require(tokens_.length > 0 && tokens_.length <= 8, "count");
        uint256 sum;
        for (uint256 i; i < weightsBps_.length; i++) sum += weightsBps_[i];
        require(sum == BPS, "weights");
        require(usdc_ != address(0), "usdc");
        name = name_;
        symbol = symbol_;
        usdc = usdc_;
        tokens = tokens_;
        weightsBps = weightsBps_;
        pools = pools_;
        feeds = feeds_;
    }

    function basketLength() external view returns (uint256) {
        return tokens.length;
    }

    //////////////////////////////////////////////////////////////
    // Valuation (multiplier-aware, all figures in $1e18)
    //////////////////////////////////////////////////////////////

    function _tokenValue18(uint256 i) internal view returns (uint256) {
        (, int256 answer, , uint256 updatedAt, ) = IFeed(feeds[i])
            .latestRoundData();
        require(answer > 0, "feed");
        require(block.timestamp - updatedAt <= MAX_STALENESS, "stale feed");
        uint256 scaled = IB20(tokens[i]).scaledBalanceOf(address(this));
        uint256 dec = IB20(tokens[i]).decimals();
        // dollars = scaled / 10^dec * answer / 1e8; express in 1e18
        return (scaled * uint256(answer) * 1e18) / (10 ** dec * 1e8);
    }

    /// @notice Basket value in USD (1e18). Includes idle USDC dust.
    function totalValueUsd() public view returns (uint256 total) {
        total = IERC20(usdc).balanceOf(address(this)) * 1e12;
        for (uint256 i; i < tokens.length; i++) {
            total += _tokenValue18(i);
        }
    }

    function previewDeposit(uint256 usdcIn) external view returns (uint256 shares) {
        uint256 supply = totalSupply;
        if (supply == 0) return usdcIn * 1e12;
        // value excluding the not-yet-transferred deposit
        return (usdcIn * 1e12 * supply) / totalValueUsd();
    }

    //////////////////////////////////////////////////////////////
    // Actions
    //////////////////////////////////////////////////////////////

    /// @notice Weave USDC into the basket. Slippage guarded by minShares.
    function deposit(uint256 usdcIn, uint256 minShares) external nonReentrant returns (uint256 shares) {
        require(usdcIn >= (totalSupply == 0 ? MIN_FIRST_DEPOSIT : 1e6), "dust");
        uint256 valueBefore = totalValueUsd();
        uint256 supplyBefore = totalSupply;
        SafeERC20.safeTransferFrom(IERC20(usdc), msg.sender, address(this), usdcIn);

        // swap each weighted leg straight into its stock token
        uint256 spent;
        for (uint256 i; i < tokens.length; i++) {
            uint256 leg = i == tokens.length - 1
                ? usdcIn - spent
                : (usdcIn * weightsBps[i]) / BPS;
            spent += leg;
            if (leg > 0) _swap(pools[i], true, leg);
        }

        if (supplyBefore == 0) {
            // dead shares poison first-depositor donation inflation
            _mint(address(0), DEAD_SHARES);
            shares = usdcIn * 1e12;
        } else {
            shares = (usdcIn * 1e12 * supplyBefore) / valueBefore;
        }
        require(shares >= minShares, "slippage");
        _mint(msg.sender, shares);
        emit Woven(msg.sender, usdcIn, shares);
    }

    /// @notice Unwind shares back to USDC, pro-rata across the basket.
    function redeem(
        uint256 shares,
        uint256 minUsdcOut,
        uint256 slippageBps
    ) external nonReentrant returns (uint256 usdcOut) {
        require(slippageBps <= 500, "slip");
        uint256 supply = totalSupply;
        require(shares > 0 && shares <= balanceOf[msg.sender], "shares");

        uint256 usdcBefore = IERC20(usdc).balanceOf(address(this));
        for (uint256 i; i < tokens.length; i++) {
            uint256 rawOut = (IERC20(tokens[i]).balanceOf(address(this)) * shares) / supply;
            if (rawOut == 0) continue;
            uint256 before = IERC20(usdc).balanceOf(address(this));
            _swap(pools[i], false, rawOut);
            uint256 got = IERC20(usdc).balanceOf(address(this)) - before;
            uint256 minOut = _expectedUsdc(tokens[i], feeds[i], rawOut);
            minOut = (minOut * (BPS - slippageBps)) / BPS;
            require(got >= minOut, "leg slippage");
        }
        usdcOut = IERC20(usdc).balanceOf(address(this)) - usdcBefore;
        require(usdcOut >= minUsdcOut, "slippage");
        _burn(msg.sender, shares);
        SafeERC20.safeTransfer(IERC20(usdc), msg.sender, usdcOut);
        emit Unwoven(msg.sender, shares, usdcOut);
    }

    function _expectedUsdc(address token, address feed, uint256 rawOut) internal view returns (uint256) {
        (, int256 answer, , , ) = IFeed(feed).latestRoundData();
        require(answer > 0, "feed");
        uint256 dec = IB20(token).decimals();
        // usd6 = rawOut / 10^dec * answer / 1e8 * 1e6
        return (rawOut * uint256(answer) * 1e6) / (10 ** dec * 1e8);
    }

    //////////////////////////////////////////////////////////////
    // Slipstream (UniV3-forked) pool interaction
    //////////////////////////////////////////////////////////////

    function _swap(address pool, bool zeroForOne, uint256 amountIn) internal {
        ICLPool(pool).swap(
            address(this),
            zeroForOne,
            int256(amountIn),
            zeroForOne ? MIN_SQRT : MAX_SQRT,
            abi.encode(pool)
        );
    }

    function uniswapV3SwapCallback(
        int256 amount0Delta,
        int256 amount1Delta,
        bytes calldata data
    ) external {
        address pool = abi.decode(data, (address));
        require(msg.sender == pool, "cb: pool");
        require(amount0Delta > 0 || amount1Delta > 0, "cb: nothing owed");
        if (amount0Delta > 0) {
            SafeERC20.safeTransfer(IERC20(ICLPool(pool).token0()), pool, uint256(amount0Delta));
        }
        if (amount1Delta > 0) {
            SafeERC20.safeTransfer(IERC20(ICLPool(pool).token1()), pool, uint256(amount1Delta));
        }
    }
}

interface IERC20 {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
    function transferFrom(address, address, uint256) external returns (bool);
}

interface IB20 {
    function scaledBalanceOf(address) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IFeed {
    function latestRoundData()
        external
        view
        returns (uint80, int256, uint256, uint256, uint80);
}

interface ICLPool {
    function token0() external view returns (address);
    function token1() external view returns (address);
    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160 sqrtPriceLimitX96,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1);
}

library SafeERC20 {
    function safeTransfer(IERC20 token, address to, uint256 amount) internal {
        (bool ok, bytes memory ret) = address(token).call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && (ret.length == 0 || abi.decode(ret, (bool))), "transfer");
    }

    function safeTransferFrom(IERC20 token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory ret) = address(token).call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && (ret.length == 0 || abi.decode(ret, (bool))), "transferFrom");
    }
}

