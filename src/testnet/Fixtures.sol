// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Vibenet testnet fixtures. Mocks are disclosed as mocks everywhere:
/// the app's proof page labels them "testnet fixture" next to each address.
/// WeftIndex itself runs UNMODIFIED: same bytecode as the mainnet target.

interface IERC20Minimal {
    function balanceOf(address) external view returns (uint256);
    function transfer(address, uint256) external returns (bool);
}

/// @dev Open-mint ERC-20 standing in for USDC (6 decimals).
contract TMockUSDC {
    string public name = "Test USDC (Weft fixture)";
    string public symbol = "tUSDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
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
}

/// @dev Chainlink-style aggregator returning a fixed price with a fresh
///      timestamp. The Coinbase total-return feeds do not run on Vibenet.
contract TMockFeed {
    uint80 public constant version = 1;
    int256 public immutable price;
    uint256 public immutable setAt;

    constructor(int256 price_) {
        price = price_;
        setAt = block.timestamp;
    }

    function latestRoundData()
        external
        view
        returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)
    {
        return (1, price, setAt, setAt, 1);
    }
}

/// @dev Fixed-price pool exposing the exact Slipstream ICLPool.swap surface
///      (recipient, zeroForOne, exactInput, sqrtLimit, data) and the
///      uniswapV3SwapCallback payment convention, so WeftIndex trades it
///      unmodified. token0 = tUSDC (6 dec), token1 = stock token (8 dec).
contract TMockPool {
    address public immutable token0;
    address public immutable token1;
    uint256 public immutable priceUsdc; // USDC-raw per 1 whole stock token

    constructor(address usdc_, address stock_, uint256 priceUsdc_) {
        token0 = usdc_;
        token1 = stock_;
        priceUsdc = priceUsdc_;
    }

    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160, // sqrtPriceLimitX96 unused at fixed price
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1) {
        require(amountSpecified > 0, "exactInput only");
        uint256 inAmount = uint256(amountSpecified);
        uint256 outAmount = zeroForOne
            ? (inAmount * 1e8) / priceUsdc // USDC -> stock
            : (inAmount * priceUsdc) / 1e8; // stock -> USDC

        if (zeroForOne) {
            amount0 = int256(inAmount);
            amount1 = -int256(outAmount);
        } else {
            amount1 = int256(inAmount);
            amount0 = -int256(outAmount);
        }

        // ask the swapper (WeftIndex) to pay its side first
        (bool ok, ) = msg.sender.call(
            abi.encodeWithSignature(
                "uniswapV3SwapCallback(int256,int256,bytes)",
                amount0,
                amount1,
                abi.encode(address(this))
            )
        );
        require(ok, "callback failed");

        // deliver the output side from pool inventory
        if (zeroForOne) {
            require(IERC20Minimal(token1).transfer(recipient, outAmount), "stock out");
        } else {
            require(IERC20Minimal(token0).transfer(recipient, outAmount), "usdc out");
        }
    }
}
