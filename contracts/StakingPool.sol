// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingPool is ReentrancyGuard, Ownable {
    struct Stake {
        uint256 amount;
        uint256 stakingTime;
    }

    mapping(address => Stake) public stakes;
    address public tokenAddress;
    address public rewarderAddress;
    uint256 public minStakingPeriod;
    uint256 public maxStakingPeriod;
    uint256 public maxStakingAmount;
    uint256 public capacity;
    uint256 public hourlyReward;
    uint256 public totalStaked;

    event Staked(address indexed staker, uint256 amount);
    event Unstaked(address indexed staker, uint256 amount, uint256 reward);

    constructor(
        address _tokenAddress,
        address _rewarderAddress,
        uint256 _minStakingPeriod,
        uint256 _maxStakingPeriod,
        uint256 _maxStakingAmount,
        uint256 _capacity,
        uint256 _hourlyReward
    ) {
        require(
            _minStakingPeriod <= _maxStakingPeriod,
            "StakingPool: Invalid staking periods"
        );
        tokenAddress = _tokenAddress;
        rewarderAddress = _rewarderAddress;
        minStakingPeriod = _minStakingPeriod;
        maxStakingPeriod = _maxStakingPeriod;
        maxStakingAmount = _maxStakingAmount;
        capacity = _capacity;
        hourlyReward = _hourlyReward;
        totalStaked = 0;
    }

    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount > 0, "StakingPool: Amount should be greater than zero");
        require(
            stakes[msg.sender].amount == 0,
            "StakingPool: You already have an active stake"
        );
        require(
            totalStaked + amount <= capacity,
            "StakingPool: Amount exceeds pool capacity"
        );
        require(
            amount <= maxStakingAmount,
            "StakingPool: Amount exceeds the maximum stake amount"
        );

        IERC20 token = IERC20(tokenAddress);
        require(
            token.balanceOf(msg.sender) >= amount,
            "StakingPool: Insufficient balance"
        );

        token.transferFrom(msg.sender, address(this), amount);

        stakes[msg.sender] = Stake(amount, block.timestamp);
        totalStaked += amount;
        emit Staked(msg.sender, amount);
    }

    function unstakeTokens() external nonReentrant {
        require(stakes[msg.sender].amount > 0, "StakingPool: No active stake");

        uint256 stakingPeriod = block.timestamp -
            stakes[msg.sender].stakingTime;
        require(
            stakingPeriod >= minStakingPeriod,
            "StakingPool: Minimum staking period not reached"
        );

        if (stakingPeriod > maxStakingPeriod) {
            stakingPeriod = maxStakingPeriod;
        }

        uint256 reward = (stakes[msg.sender].amount *
            hourlyReward *
            stakingPeriod) /
            3600 /
            100;

        IERC20 token = IERC20(tokenAddress);

        require(
            token.balanceOf(rewarderAddress) >= reward,
            "StakingPool: Insufficient balance in the rewarder"
        );
        require(
            token.allowance(rewarderAddress, address(this)) >= reward,
            "StakingPool: Insufficient allowance in the rewarder"
        );

        token.transfer(msg.sender, stakes[msg.sender].amount);
        token.transferFrom(rewarderAddress, msg.sender, reward);
        totalStaked -= stakes[msg.sender].amount;

        emit Unstaked(msg.sender, stakes[msg.sender].amount, reward);
        delete stakes[msg.sender];
    }
}
