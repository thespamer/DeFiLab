// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract SimpleLendingPool is ReentrancyGuard {
    IERC20 public usdc;
    mapping(address => uint256) public deposits;
    mapping(address => uint256) public borrows;

    uint256 public constant INTEREST_RATE = 5; // 5% fixed interest for simplicity

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        usdc.transferFrom(msg.sender, address(this), amount);
        deposits[msg.sender] += amount;
        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender] >= amount, "Insufficient deposit");
        deposits[msg.sender] -= amount;
        usdc.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function borrow(uint256 amount) external nonReentrant {
        uint256 collateral = deposits[msg.sender];
        require(collateral > 0, "No collateral");
        require(amount <= collateral / 2, "Insufficient collateral (50% LTV)"); // 50% LTV
        borrows[msg.sender] += amount;
        usdc.transfer(msg.sender, amount);
        emit Borrowed(msg.sender, amount);
    }

    function repay(uint256 amount) external nonReentrant {
        require(borrows[msg.sender] >= amount, "Repaying too much");
        usdc.transferFrom(msg.sender, address(this), amount);
        borrows[msg.sender] -= amount;
        emit Repaid(msg.sender, amount);
    }
}
