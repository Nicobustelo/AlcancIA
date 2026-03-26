// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {Errors} from "./libraries/Errors.sol";

contract RemittanceScheduler is ReentrancyGuard {
    enum RemittanceStatus {
        Scheduled,
        Executed,
        Failed,
        Cancelled
    }

    struct Remittance {
        uint256 id;
        address sender;
        address recipient;
        uint256 amountDoc;
        uint8 dayOfMonth;
        RemittanceStatus status;
        uint256 createdAt;
        uint256 executedAt;
        bytes32 executionTxHash;
    }

    mapping(address => uint256[]) private _userRemittanceIds;
    mapping(uint256 => Remittance) public remittances;
    uint256 public nextRemittanceId;

    address public docToken;

    event RemittanceScheduled(
        uint256 indexed id,
        address indexed sender,
        address indexed recipient,
        uint256 amountDoc,
        uint8 dayOfMonth,
        uint256 timestamp
    );
    event RemittanceCancelled(
        uint256 indexed id,
        address indexed sender,
        uint256 timestamp
    );
    event RemittanceSent(
        uint256 indexed id,
        address indexed sender,
        address indexed recipient,
        uint256 amountDoc,
        uint256 timestamp
    );

    constructor(address _docToken) {
        if (_docToken == address(0)) revert Errors.InvalidAddress();
        docToken = _docToken;
    }

    function scheduleRemittance(
        address recipient,
        uint256 amountDoc,
        uint8 dayOfMonth
    ) external returns (uint256 remittanceId) {
        if (recipient == address(0)) revert Errors.InvalidAddress();
        if (amountDoc == 0) revert Errors.InvalidAmount();
        if (dayOfMonth < 1 || dayOfMonth > 28) revert Errors.InvalidAmount();

        remittanceId = nextRemittanceId++;
        remittances[remittanceId] = Remittance({
            id: remittanceId,
            sender: msg.sender,
            recipient: recipient,
            amountDoc: amountDoc,
            dayOfMonth: dayOfMonth,
            status: RemittanceStatus.Scheduled,
            createdAt: block.timestamp,
            executedAt: 0,
            executionTxHash: bytes32(0)
        });
        _userRemittanceIds[msg.sender].push(remittanceId);

        emit RemittanceScheduled(
            remittanceId,
            msg.sender,
            recipient,
            amountDoc,
            dayOfMonth,
            block.timestamp
        );
    }

    function cancelRemittance(uint256 remittanceId) external {
        Remittance storage r = remittances[remittanceId];
        if (r.id != remittanceId) revert Errors.RemittanceNotFound(remittanceId);
        if (r.sender != msg.sender) revert Errors.UnauthorizedCaller();
        if (r.status == RemittanceStatus.Executed) {
            revert Errors.RemittanceAlreadyExecuted(remittanceId);
        }
        if (r.status == RemittanceStatus.Cancelled) {
            revert Errors.RemittanceAlreadyCancelled(remittanceId);
        }

        r.status = RemittanceStatus.Cancelled;
        emit RemittanceCancelled(remittanceId, msg.sender, block.timestamp);
    }

    function executeRemittance(uint256 remittanceId) external nonReentrant {
        Remittance storage r = remittances[remittanceId];
        if (r.id != remittanceId) revert Errors.RemittanceNotFound(remittanceId);
        if (r.status == RemittanceStatus.Executed) {
            revert Errors.RemittanceAlreadyExecuted(remittanceId);
        }
        if (r.status == RemittanceStatus.Cancelled) {
            revert Errors.RemittanceAlreadyCancelled(remittanceId);
        }
        if (r.status != RemittanceStatus.Scheduled) {
            revert Errors.RemittanceNotFound(remittanceId);
        }

        bool ok = IERC20(docToken).transferFrom(
            r.sender,
            r.recipient,
            r.amountDoc
        );
        if (!ok) revert Errors.TransferFailed();

        r.status = RemittanceStatus.Executed;
        r.executedAt = block.timestamp;
        r.executionTxHash = bytes32(0);

        emit RemittanceSent(
            remittanceId,
            r.sender,
            r.recipient,
            r.amountDoc,
            block.timestamp
        );
    }

    function getRemittance(uint256 remittanceId)
        external
        view
        returns (Remittance memory)
    {
        Remittance memory r = remittances[remittanceId];
        if (r.id != remittanceId) revert Errors.RemittanceNotFound(remittanceId);
        return r;
    }

    function getUserRemittances(address user)
        external
        view
        returns (uint256[] memory)
    {
        return _userRemittanceIds[user];
    }

    function getUserRemittanceCount(address user) external view returns (uint256) {
        return _userRemittanceIds[user].length;
    }
}
