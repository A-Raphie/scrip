// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {WeftIndex, IERC20, IB20, IFeed, ICLPool} from "../src/WeftIndex.sol";

/// Real-chain tests: real pools, real feeds, real B20 precompiles.
interface TestIERC20 {
    function approve(address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
}

contract WeftForkTest is Test {
    WeftIndex internal index;
    address internal usdc = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");

    address[] tokens;
    uint256[] weights;
    address[] pools;
    address[] feeds;

    address constant AAPLc = 0xb200000000000000000000C2e324d24d7eEcd1fb;
    address constant NVDAc = 0xb20000000000000000000078ee7ce2fE4908108C;
    address constant TSLAc = 0xb2000000000000000000001e800a7f5189430cD0;
    address constant MSFTc = 0xB200000000000000000000Ab99cFa739E253872B;

    function setUp() public {
        vm.skip(true); // B20 precompiles are not executable in-process
        vm.createSelectFork(vm.envOr("BASE_RPC_URL", string("https://mainnet.base.org")));

        tokens = [AAPLc, NVDAc, MSFTc, TSLAc];
        weights = [3_500, 3_500, 1_500, 1_500];
        pools = [
            0xA3b1E3f9747065e2073722Ff4c9027d3eA4994F0,
            0x853F5f1B92b16714Fe6CDA67CAad0856B83C7ab9,
            0x7103eB3c9590d1281f7dc03b2A9EE27C39dF5D54,
            0x469337fDcc5E8f38e2E4B670B04F57865D13a7BB
        ];
        feeds = [
            0x787f13dEa48Db0897CbCDD985de77809D837F988,
            0x04689a41629776563E6822F76f2e57D148d28513,
            0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c,
            0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4
        ];
        index = new WeftIndex(
            "Weft Tech Basket",
            "wTECH",
            usdc,
            tokens,
            weights,
            pools,
            feeds
        );
        deal(usdc, alice, 10_000e6);
        deal(usdc, bob, 10_000e6);
    }

    function test_deposit_weaves_the_whole_basket() public {
        vm.startPrank(alice);
        TestIERC20(usdc).approve(address(index), type(uint256).max);
        uint256 shares = index.deposit(1_000e6, 0);
        vm.stopPrank();

        assertGt(shares, 900e18, "should mint roughly $1k of shares");
        for (uint256 i; i < 4; i++) {
            assertGt(IERC20(tokens[i]).balanceOf(address(index)), 0, "leg empty");
        }
        assertApproxEqRel(index.totalValueUsd(), 1_000e18, 0.05e18, "value ~= deposited");
    }

    function test_second_depositor_is_pro_rata() public {
        vm.startPrank(alice);
        TestIERC20(usdc).approve(address(index), type(uint256).max);
        index.deposit(1_000e6, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        TestIERC20(usdc).approve(address(index), type(uint256).max);
        uint256 bobShares = index.deposit(500e6, 0);
        vm.stopPrank();

        // bob paid half of alice's deposit, so he holds ~half the (now larger) supply
        assertApproxEqRel(bobShares * 2, index.totalSupply() - 1e15, 0.03e18, "pro rata");
    }

    function test_redeem_roundtrip_returns_most_usdc() public {
        vm.startPrank(alice);
        TestIERC20(usdc).approve(address(index), type(uint256).max);
        uint256 shares = index.deposit(1_000e6, 0);
        uint256 before = IERC20(usdc).balanceOf(alice);
        uint256 out = index.redeem(shares, 900e6, 300);
        vm.stopPrank();

        assertEq(out, before - IERC20(usdc).balanceOf(alice), "received");
        assertGt(out, 950e6, "roundtrip keeps most of the $1000 (fees+slip only)");
        assertEq(index.totalSupply(), 1e15, "only dead shares left");
    }

    function test_min_shards_guard_reverts_on_greed() public {
        vm.prank(alice);
        TestIERC20(usdc).approve(address(index), type(uint256).max);
        vm.prank(alice);
        vm.expectRevert("slippage");
        index.deposit(1_000e6, type(uint256).max);
    }

    function test_price_feed_sanity() public view {
        (, int256 answer, , uint256 updatedAt, ) = IFeed(feeds[0]).latestRoundData();
        assertGt(answer, 50e8, "AAPL total-return price sane");
        assertLt(block.timestamp - updatedAt, 10 days, "feed fresh enough");
    }
}
