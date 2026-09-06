// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WeftIndex} from "../src/WeftIndex.sol";

/// Mock B20 token: plain ERC20 whose scaledBalanceOf applies a mutable
/// multiplier, exactly how B20 corporate actions behave.
contract MockScaledToken {
    string public name = "Mock Stock";
    string public symbol = "MSTK";
    uint8 public decimals = 8;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    uint256 public multiplierWad = 1e18;

    function setMultiplier(uint256 wad) external {
        multiplierWad = wad;
    }

    function mint(address to, uint256 amount) external {
        totalSupply += amount;
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function scaledBalanceOf(address who) external view returns (uint256) {
        return (balanceOf[who] * multiplierWad) / 1e18;
    }
}

contract MockFeed {
    int256 public answer;
    uint256 public updatedAt;

    constructor(int256 price) {
        answer = price;
        updatedAt = block.timestamp;
    }

    function setStale() external {
        updatedAt = block.timestamp - 11 days;
    }

    function latestRoundData() external view returns (uint80, int256, uint256, uint256, uint80) {
        return (1, answer, 0, updatedAt, 1);
    }
}

/// Mock Slipstream pool: fixed-rate exchange, pulls payment through the
/// same callback contract the real pool uses.
contract MockPool {
    address public immutable token0;
    address public immutable token1;
    uint256 public immutable price; // token price in USDC raw units (6 dec)

    constructor(address t0, address t1, uint256 p) {
        token0 = t0;
        token1 = t1;
        price = p;
    }

    function swap(
        address recipient,
        bool zeroForOne,
        int256 amountSpecified,
        uint160,
        bytes calldata data
    ) external returns (int256 amount0, int256 amount1) {
        uint256 inAmount = uint256(amountSpecified);
        // zeroForOne: USDC(6dec) -> token(8dec): out = in * 1e8 / price
        // otherwise: token(8dec) -> USDC: out = in * price / 1e8
        uint256 outAmount = zeroForOne ? (inAmount * 1e8) / price : (inAmount * price) / 1e8;
        if (zeroForOne) {
            amount0 = int256(inAmount);
            amount1 = -int256(outAmount);
        } else {
            amount1 = int256(inAmount);
            amount0 = -int256(outAmount);
        }
        WeftIndex(msg.sender).uniswapV3SwapCallback(
            zeroForOne ? int256(inAmount) : -int256(outAmount),
            zeroForOne ? -int256(outAmount) : int256(inAmount),
            abi.encode(address(this))
        );
        // hand over the output tokens
        MockScaledToken(zeroForOne ? token1 : token0).mint(recipient, outAmount);
    }
}

contract MockUSDC {
    string public name = "USDC";
    uint8 public decimals = 6;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    function mint(address to, uint256 a) external { balanceOf[to] += a; }
    function approve(address s, uint256 a) external { allowance[msg.sender][s] = a; }
    function transfer(address to, uint256 a) external returns (bool) {
        balanceOf[msg.sender] -= a; balanceOf[to] += a; return true;
    }
    function transferFrom(address f, address t, uint256 a) external returns (bool) {
        allowance[f][msg.sender] -= a; balanceOf[f] -= a; balanceOf[t] += a; return true;
    }
}

contract WeftUnitTest is Test {
    MockUSDC internal usdc;
    MockScaledToken internal a;
    MockScaledToken internal b;
    MockFeed internal feedA;
    MockFeed internal feedB;
    MockPool internal poolA;
    MockPool internal poolB;
    WeftIndex internal index;

    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    function setUp() public {
        usdc = new MockUSDC();
        a = new MockScaledToken();
        b = new MockScaledToken();
        feedA = new MockFeed(200e8); // $200
        feedB = new MockFeed(100e8); // $100
        // mock pools: 1 USDC buys 1/price tokens (8 dec): rateD = price, rateN = 1e8
        poolA = new MockPool(address(usdc), address(a), 200e6);
        poolB = new MockPool(address(usdc), address(b), 100e6);

        address[] memory tokens = new address[](2);
        tokens[0] = address(a);
        tokens[1] = address(b);
        uint256[] memory weights = new uint256[](2);
        weights[0] = 5_000;
        weights[1] = 5_000;
        address[] memory pools = new address[](2);
        pools[0] = address(poolA);
        pools[1] = address(poolB);
        address[] memory feeds = new address[](2);
        feeds[0] = address(feedA);
        feeds[1] = address(feedB);
        index = new WeftIndex("Weft Test", "wT", address(usdc), tokens, weights, pools, feeds);

        usdc.mint(alice, 10_000e6);
        usdc.mint(bob, 10_000e6);
        // seed pools with output tokens to hand out
        a.mint(address(poolA), 10_000e8);
        b.mint(address(poolB), 10_000e8);
    }

    function test_deposit_mints_and_holds() public {
        vm.startPrank(alice);
        usdc.approve(address(index), type(uint256).max);
        uint256 shares = index.deposit(1_000e6, 0);
        vm.stopPrank();
        // $500 into A at $200 => 2.5 tokens; $500 into B at $100 => 5 tokens
        assertApproxEqRel(a.balanceOf(address(index)), 2.5e8, 0.01e18);
        assertApproxEqRel(b.balanceOf(address(index)), 5e8, 0.01e18);
        assertApproxEqRel(shares, 1_000e18, 0.01e18, "$1 = 1e18 shares");
        assertApproxEqRel(index.totalValueUsd(), 1_000e18, 0.01e18);
    }

    function test_multiplier_bump_accrues_to_holders() public {
        vm.prank(alice);
        usdc.approve(address(index), type(uint256).max);
        vm.prank(alice);
        index.deposit(1_000e6, 0);
        uint256 valueBefore = index.totalValueUsd();

        // the issuer runs a 2% dividend: multiplier 1.0 -> 1.02
        a.setMultiplier(1.02e18);
        b.setMultiplier(1.02e18);

        // balances (raw) unchanged, value up 2%, share price up 2%
        assertEq(a.balanceOf(address(index)), 2.5e8, "raw balance untouched");
        assertApproxEqRel(index.totalValueUsd(), (valueBefore * 1.02e18) / 1e18, 0.001e18);

        // a new depositor now gets fewer shares per dollar
        vm.startPrank(bob);
        usdc.approve(address(index), type(uint256).max);
        uint256 bobShares = index.deposit(1_000e6, 0);
        vm.stopPrank();
        assertLt(bobShares, 1_000e18, "later depositor gets fewer shares after dividend");
    }

    function test_redeem_roundtrip() public {
        vm.startPrank(alice);
        usdc.approve(address(index), type(uint256).max);
        uint256 shares = index.deposit(1_000e6, 0);
        uint256 before = usdc.balanceOf(alice);
        uint256 out = index.redeem(shares, 990e6, 100);
        vm.stopPrank();
        // mock pools are frictionless: roundtrip should be near-perfect
        assertApproxEqRel(out, 1_000e6, 0.001e18);
        assertEq(usdc.balanceOf(alice) - before, out);
        assertEq(index.balanceOf(alice), 0);
    }

    function test_redeem_slippage_guard() public {
        vm.startPrank(alice);
        usdc.approve(address(index), type(uint256).max);
        uint256 shares = index.deposit(1_000e6, 0);
        // demand 2x the value: must revert
        vm.expectRevert("slippage");
        index.redeem(shares, 2_000e6, 100);
        vm.stopPrank();
    }

    function test_stale_feed_blocks_valuation() public {
        vm.warp(block.timestamp + 12 days); // forge starts at t=1; give setStale headroom
        feedA.setStale();
        vm.prank(alice);
        usdc.approve(address(index), type(uint256).max);
        vm.expectRevert("stale feed");
        index.deposit(1_000e6, 0);
    }

    function test_weights_must_sum_to_10k() public {
        address[] memory tokens = new address[](1);
        tokens[0] = address(a);
        uint256[] memory weights = new uint256[](1);
        weights[0] = 9_999;
        address[] memory pools = new address[](1);
        pools[0] = address(poolA);
        address[] memory feeds = new address[](1);
        feeds[0] = address(feedA);
        vm.expectRevert("weights");
        new WeftIndex("x", "x", address(usdc), tokens, weights, pools, feeds);
    }
}
