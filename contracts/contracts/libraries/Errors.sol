// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library Errors {
    error InsufficientBalance(uint256 requested, uint256 available);
    error InvalidAmount();
    error InvalidAddress();
    error RemittanceNotFound(uint256 remittanceId);
    error RemittanceAlreadyExecuted(uint256 remittanceId);
    error RemittanceAlreadyCancelled(uint256 remittanceId);
    error RemittanceNotDue(
        uint256 remittanceId,
        uint8 currentDay,
        uint8 scheduledDay
    );
    error UnauthorizedCaller();
    error ExternalProtocolError(string protocol, string reason);
    error TransferFailed();
}
