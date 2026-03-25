// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPriceOracle {
    function getPrice(string calldata symbol)
        external
        view
        returns (uint256 price, uint8 decimals);
}
