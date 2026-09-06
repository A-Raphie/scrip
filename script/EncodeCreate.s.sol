// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {IB20Factory} from "./interfaces/IB20Factory.sol";

/// @dev Pure encoder: prints the exact calldata for createB20 so it can be
///      sent raw (the factory precompile cannot run inside forge's simulator).
contract EncodeCreate is Script {
    function run(string memory name, string memory symbol, string memory saltStr) external view {
        uint256 key = vm.envUint("VIBENET_KEY");
        address deployer = vm.addr(key);
        bytes32 salt = keccak256(abi.encodePacked(saltStr));
        bytes memory params = abi.encode(
            IB20Factory.B20AssetCreateParams({version: 1, name: name, symbol: symbol, initialAdmin: deployer, decimals: 8})
        );
        bytes memory cd = abi.encodeWithSelector(
            IB20Factory.createB20.selector,
            IB20Factory.B20Variant.ASSET,
            salt,
            params,
            new bytes[](0)
        );
        console2.logBytes(cd);
    }
}