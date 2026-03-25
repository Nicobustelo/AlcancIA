// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {Errors} from "./libraries/Errors.sol";

contract VaultManager is ReentrancyGuard {
    mapping(address => uint256) public rbtcBalances;
    mapping(address => uint256) public docBalances;
    mapping(address => uint256) public tropykusShares;
    mapping(address => uint256) public tropykusDepositedDoc;

    address public docToken;
    address public strategyExecutor;
    address public owner;

    event Deposited(
        address indexed user,
        string asset,
        uint256 amount,
        uint256 timestamp
    );
    event Withdrawn(
        address indexed user,
        string asset,
        uint256 amount,
        uint256 timestamp
    );
    event StrategyRecorded(
        address indexed user,
        uint256 docAmount,
        uint256 kDocShares,
        uint256 timestamp
    );

    constructor(address _docToken) {
        if (_docToken == address(0)) revert Errors.InvalidAddress();
        docToken = _docToken;
        owner = msg.sender;
    }

    function setStrategyExecutor(address _executor) external {
        if (msg.sender != owner) revert Errors.UnauthorizedCaller();
        strategyExecutor = _executor;
    }

    function depositRBTC() external payable nonReentrant {
        rbtcBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, "RBTC", msg.value, block.timestamp);
    }

    function depositDOC(uint256 amount) external nonReentrant {
        if (amount == 0) revert Errors.InvalidAmount();
        bool ok = IERC20(docToken).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        if (!ok) revert Errors.TransferFailed();
        docBalances[msg.sender] += amount;
        emit Deposited(msg.sender, "DOC", amount, block.timestamp);
    }

    function withdrawRBTC(uint256 amount) external nonReentrant {
        uint256 bal = rbtcBalances[msg.sender];
        if (amount > bal) {
            revert Errors.InsufficientBalance(amount, bal);
        }
        rbtcBalances[msg.sender] = bal - amount;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        if (!sent) revert Errors.TransferFailed();
        emit Withdrawn(msg.sender, "RBTC", amount, block.timestamp);
    }

    function withdrawDOC(uint256 amount) external nonReentrant {
        uint256 bal = docBalances[msg.sender];
        if (amount > bal) {
            revert Errors.InsufficientBalance(amount, bal);
        }
        docBalances[msg.sender] = bal - amount;
        bool ok = IERC20(docToken).transfer(msg.sender, amount);
        if (!ok) revert Errors.TransferFailed();
        emit Withdrawn(msg.sender, "DOC", amount, block.timestamp);
    }

    function recordStrategyExecution(
        address user,
        uint256 docUsed,
        uint256 kDocReceived
    ) external {
        if (msg.sender != strategyExecutor) revert Errors.UnauthorizedCaller();
        tropykusDepositedDoc[user] += docUsed;
        tropykusShares[user] += kDocReceived;
        emit StrategyRecorded(user, docUsed, kDocReceived, block.timestamp);
    }

    function getUserPosition(address user)
        external
        view
        returns (
            uint256 rbtc,
            uint256 doc,
            uint256 shares,
            uint256 depositedDoc
        )
    {
        return (
            rbtcBalances[user],
            docBalances[user],
            tropykusShares[user],
            tropykusDepositedDoc[user]
        );
    }

    function getYield(address user) external view returns (uint256 estimatedYield) {
        user;
        return 0;
    }

    receive() external payable {
        rbtcBalances[msg.sender] += msg.value;
        emit Deposited(msg.sender, "RBTC", msg.value, block.timestamp);
    }
}
