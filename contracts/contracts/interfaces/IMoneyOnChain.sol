// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IMoneyOnChain {
    function mintDocVendors(uint256 btcToMint, address vendorAccount)
        external
        payable;

    function redeemFreeDocVendors(uint256 docAmount, address vendorAccount)
        external;

    function docToken() external view returns (address);
}
