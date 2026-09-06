// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {WeftIndex} from "../src/WeftIndex.sol";

contract Deploy is Script {
    address constant USDC = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;

    // deepest-liquidity USDC pools on Aerodrome Slipstream, measured Sep 6 2026
    address constant AAPL_POOL = 0xA3b1E3f9747065e2073722Ff4c9027d3eA4994F0;
    address constant NVDA_POOL = 0x853F5f1B92b16714Fe6CDA67CAad0856B83C7ab9;
    address constant MSFT_POOL = 0x7103eB3c9590d1281f7dc03b2A9EE27C39dF5D54;
    address constant TSLA_POOL = 0x469337fDcc5E8f38e2E4B670B04F57865D13a7BB;

    // Coinbase total-return feeds
    address constant AAPL_FEED = 0x787f13dEa48Db0897CbCDD985de77809D837F988;
    address constant NVDA_FEED = 0x04689a41629776563E6822F76f2e57D148d28513;
    address constant MSFT_FEED = 0xeB10A6c9aa7E537aEd766C08c35Dae35B321b18c;
    address constant TSLA_FEED = 0xFaf869185383a24F8cb00e27BdA6b63B9905DCb4;

    function run() external returns (WeftIndex index) {
        address[] memory tokens = new address[](4);
        tokens[0] = 0xb200000000000000000000C2e324d24d7eEcd1fb; // AAPLc
        tokens[1] = 0xb20000000000000000000078ee7ce2fE4908108C; // NVDAc
        tokens[2] = 0xB200000000000000000000Ab99cFa739E253872B; // MSFTc
        tokens[3] = 0xb2000000000000000000001e800a7f5189430cD0; // TSLAc

        uint256[] memory weights = new uint256[](4);
        weights[0] = 3_500;
        weights[1] = 3_500;
        weights[2] = 1_500;
        weights[3] = 1_500;

        address[] memory pools = new address[](4);
        pools[0] = AAPL_POOL;
        pools[1] = NVDA_POOL;
        pools[2] = MSFT_POOL;
        pools[3] = TSLA_POOL;

        address[] memory feeds = new address[](4);
        feeds[0] = AAPL_FEED;
        feeds[1] = NVDA_FEED;
        feeds[2] = MSFT_FEED;
        feeds[3] = TSLA_FEED;

        uint256 key = vm.envUint("DEPLOYER_KEY");
        vm.startBroadcast(key);
        index = new WeftIndex(
            "Weft Tech Basket",
            "wTECH",
            USDC,
            tokens,
            weights,
            pools,
            feeds
        );
        vm.stopBroadcast();
    }
}
