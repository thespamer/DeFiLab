// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract StakingRewards is ReentrancyGuard {
    IERC20 public stakingToken;
    IERC20 public rewardsToken;

    uint256 public constant REWARD_RATE = 100; // Simplified reward rate
    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastUpdate;
    mapping(address => uint256) public rewards;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(address _stakingToken, address _rewardsToken) {
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot stake 0");
        updateReward(msg.sender);
        stakingToken.transferFrom(msg.sender, address(this), amount);
        stakedAmount[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0");
        require(stakedAmount[msg.sender] >= amount, "Insufficient staked");
        updateReward(msg.sender);
        stakedAmount[msg.sender] -= amount;
        stakingToken.transfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function claimReward() external nonReentrant {
        updateReward(msg.sender);
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardsToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    function updateReward(address user) internal {
        if (user != address(0)) {
            rewards[user] += stakedAmount[user] * (block.timestamp - lastUpdate[user]) * REWARD_RATE / 1e18;
            lastUpdate[user] = block.timestamp;
        }
    }

    function earned(address user) external view returns (uint256) {
        return rewards[user] + (stakedAmount[user] * (block.timestamp - lastUpdate[user]) * REWARD_RATE / 1e18);
    }
}
