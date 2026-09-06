// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {WeftIndex} from "../src/WeftIndex.sol";
import {TMockUSDC, TMockFeed, TMockPool} from "../src/testnet/Fixtures.sol";
import {IB20Asset} from "./interfaces/IB20Asset.sol";
import {IB20Factory} from "./interfaces/IB20Factory.sol";

/// @notice Vibenet setup: creates two B20 stock tokens through the real
///         factory precompile, deploys disclosed test fixtures (tUSDC, fixed
///         pools, mock feeds), and deploys WeftIndex UNMODIFIED against them.
contract VibenetSetup is Script {
    IB20Factory constant FACTORY = IB20Factory(0xB20f000000000000000000000000000000000000);

    function run() external returns (WeftIndex index) {
        uint256 key = vm.envUint("VIBENET_KEY");
        vm.startBroadcast(key);
        address deployer = vm.addr(key);

        // ---- fixture currencies and feeds ----
        TMockUSDC usdc = new TMockUSDC();
        TMockFeed feedA = new TMockFeed(200e8); // $200 per wAAPL
        TMockFeed feedB = new TMockFeed(100e8); // $100 per wNVDA

        // ---- real B20 stock tokens through the factory precompile ----
        address wAaplAddr =
            FACTORY.createB20(
                IB20Factory.B20Variant.ASSET,
                keccak256("weft-wAAPL-1"),
                abi.encode(
                    IB20Factory.B20AssetCreateParams({
                        version: 1,
                        name: "Weft Test Apple Corp",
                        symbol: "wAAPL",
                        initialAdmin: deployer,
                        decimals: 8
                    })
                ),
                new bytes[](0)
        );
        address wNvdaAddr =
            FACTORY.createB20(
                IB20Factory.B20Variant.ASSET,
                keccak256("weft-wNVDA-1"),
                abi.encode(
                    IB20Factory.B20AssetCreateParams({
                        version: 1,
                        name: "Weft Test NVIDIA Corp",
                        symbol: "wNVDA",
                        initialAdmin: deployer,
                        decimals: 8
                    })
                ),
                new bytes[](0)
        );
        IB20Asset wAapl = IB20Asset(wAaplAddr);
        IB20Asset wNvda = IB20Asset(wNvdaAddr);

        // deployer (initialAdmin) grants itself the operational roles
        wAapl.grantRole(wAapl.MINT_ROLE(), deployer);
        wAapl.grantRole(wAapl.OPERATOR_ROLE(), deployer);
        wNvda.grantRole(wNvda.MINT_ROLE(), deployer);
        wNvda.grantRole(wNvda.OPERATOR_ROLE(), deployer);

        // ---- fixed-price pools (disclosed fixtures) ----
        TMockPool poolA = new TMockPool(address(usdc), address(wAapl), 200e6);
        TMockPool poolB = new TMockPool(address(usdc), address(wNvda), 100e6);

        // issuer mints stock inventory into the pools (AP-style provisioning)
        wAapl.mint(address(poolA), 200_000e8); // ~$40M book
        wNvda.mint(address(poolB), 400_000e8); // ~$40M book
        // seed the pools with USDC so unwinds never starve
        usdc.mint(address(poolA), 50_000e6);
        usdc.mint(address(poolB), 50_000e6);

        // ---- the index, identical code to the mainnet target ----
        address[] memory tokens = new address[](2);
        tokens[0] = address(wAapl);
        tokens[1] = address(wNvda);
        uint256[] memory weights = new uint256[](2);
        weights[0] = 5_000;
        weights[1] = 5_000;
        address[] memory pools = new address[](2);
        pools[0] = address(poolA);
        pools[1] = address(poolB);
        address[] memory feeds = new address[](2);
        feeds[0] = address(feedA);
        feeds[1] = address(feedB);

        index = new WeftIndex(
            "Weft Proof Basket",
            "wPROOF",
            address(usdc),
            tokens,
            weights,
            pools,
            feeds
        );

        // demo user funds
        usdc.mint(deployer, 2_000e6);

        vm.stopBroadcast();

        console2.log("TUSDC", address(usdc));
        console2.log("WAAPL", wAaplAddr);
        console2.log("WNVDA", wNvdaAddr);
        console2.log("POOLA", address(poolA));
        console2.log("POOLB", address(poolB));
        console2.log("FEEDA", address(feedA));
        console2.log("FEEDB", address(feedB));
        console2.log("WEFT_INDEX", address(index));
    }
}
