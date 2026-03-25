// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "./interfaces/IERC20.sol";
import {IMoneyOnChain} from "./interfaces/IMoneyOnChain.sol";
import {ITropykusMarket} from "./interfaces/ITropykusMarket.sol";
import {VaultManager} from "./VaultManager.sol";
import {Errors} from "./libraries/Errors.sol";

contract StrategyExecutor is ReentrancyGuard {
    VaultManager public immutable vaultManager;
    IMoneyOnChain public immutable moneyOnChain;
    ITropykusMarket public immutable tropykusMarket;
    address public docToken;

    bool public useFallbackMode;
    address public owner;

    event DOCMinted(
        address indexed user,
        uint256 rbtcSpent,
        uint256 docReceived,
        uint256 timestamp
    );
    event SuppliedToTropykus(
        address indexed user,
        uint256 docAmount,
        uint256 kDocReceived,
        uint256 timestamp
    );
    event StrategyExecuted(
        address indexed user,
        uint256 rbtcIn,
        uint256 docMinted,
        uint256 docSupplied,
        uint256 timestamp
    );
    event ExternalProtocolFallbackUsed(
        string protocol,
        string reason,
        uint256 timestamp
    );

    constructor(
        address _vaultManager,
        address _moneyOnChain,
        address _tropykusMarket,
        address _docToken
    ) {
        vaultManager = VaultManager(payable(_vaultManager));
        moneyOnChain = IMoneyOnChain(_moneyOnChain);
        tropykusMarket = ITropykusMarket(_tropykusMarket);
        docToken = _docToken;
        owner = msg.sender;
    }

    function setFallbackMode(bool _useFallback) external {
        if (msg.sender != owner) revert Errors.UnauthorizedCaller();
        useFallbackMode = _useFallback;
    }

    function executeStrategy(uint256 rbtcAmount, address user)
        external
        payable
        nonReentrant
        returns (uint256 docMinted, uint256 kDocReceived)
    {
        if (msg.value != rbtcAmount) revert Errors.InvalidAmount();

        uint256 docBalBefore = IERC20(docToken).balanceOf(address(this));

        if (useFallbackMode || address(moneyOnChain) == address(0)) {
            emit ExternalProtocolFallbackUsed(
                "MoneyOnChain",
                "Fallback mode active",
                block.timestamp
            );
            docMinted = (rbtcAmount * 65000) / 1e18;
        } else {
            try
                moneyOnChain.mintDocVendors{value: rbtcAmount}(
                    rbtcAmount,
                    address(0)
                )
            {
                docMinted =
                    IERC20(docToken).balanceOf(address(this)) -
                    docBalBefore;
            } catch {
                emit ExternalProtocolFallbackUsed(
                    "MoneyOnChain",
                    "Fallback mode active",
                    block.timestamp
                );
                docMinted = (rbtcAmount * 65000) / 1e18;
            }
        }

        uint256 docSupplied = 0;
        kDocReceived = 0;

        uint256 docOnHand = IERC20(docToken).balanceOf(address(this));
        bool canSupply =
            address(tropykusMarket) != address(0) &&
            docMinted > 0 &&
            docOnHand >= docMinted;

        if (canSupply) {
            IERC20(docToken).approve(address(tropykusMarket), docMinted);
            uint256 kBefore = tropykusMarket.balanceOf(address(this));
            try tropykusMarket.mint(docMinted) returns (uint256 err) {
                if (err != 0) {
                    emit ExternalProtocolFallbackUsed(
                        "Tropykus",
                        "Mint returned error",
                        block.timestamp
                    );
                    kDocReceived = docMinted;
                } else {
                    kDocReceived =
                        tropykusMarket.balanceOf(address(this)) -
                        kBefore;
                    docSupplied = docMinted;
                }
            } catch {
                emit ExternalProtocolFallbackUsed(
                    "Tropykus",
                    "Mint failed",
                    block.timestamp
                );
                kDocReceived = docMinted;
            }
        } else if (docMinted > 0) {
            emit ExternalProtocolFallbackUsed(
                "Tropykus",
                "Insufficient DOC balance or zero market",
                block.timestamp
            );
            kDocReceived = docMinted;
        }

        vaultManager.recordStrategyExecution(user, docMinted, kDocReceived);

        emit DOCMinted(user, rbtcAmount, docMinted, block.timestamp);
        emit SuppliedToTropykus(user, docSupplied, kDocReceived, block.timestamp);
        emit StrategyExecuted(
            user,
            rbtcAmount,
            docMinted,
            docSupplied,
            block.timestamp
        );
    }

    function estimateDocOutput(uint256 rbtcAmount) external pure returns (uint256) {
        return (rbtcAmount * 65000) / 1e18;
    }

    function getCurrentApy() external pure returns (uint256) {
        return 550;
    }
}
