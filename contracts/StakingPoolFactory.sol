// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StakingPool.sol";

contract StakingPoolFactory is Ownable {
    address[] public stakingPools;
    address public tokenAddress;
    address public operatorAddress;

    event StakingPoolCreated(address indexed stakingPool);

    constructor(address _tokenAddress, address _operatorAddress) {
        tokenAddress = _tokenAddress;
        operatorAddress = _operatorAddress;
    }

    modifier onlyOperator() {
        require(
            msg.sender == operatorAddress,
            "StakingPoolFactory: Only the operator can call this function"
        );
        _;
    }

    function createStakingPool(
        uint256 minStakingPeriod,
        uint256 maxStakingPeriod,
        uint256 maxStakingAmount,
        uint256 capacity,
        uint256 hourlyReward
    ) external onlyOwner {
        StakingPool stakingPool = new StakingPool(
            tokenAddress,
            address(this),
            minStakingPeriod,
            maxStakingPeriod,
            maxStakingAmount,
            capacity,
            hourlyReward
        );
        address stakingPoolAddress = address(stakingPool);
        IERC20 token = IERC20(tokenAddress);

        stakingPools.push(stakingPoolAddress);

        uint256 maxRewardAmount = (capacity * hourlyReward * maxStakingPeriod) /
            3600 /
            100;
        token.approve(stakingPoolAddress, maxRewardAmount);
        token.transferFrom(operatorAddress, address(this), maxRewardAmount);

        emit StakingPoolCreated(stakingPoolAddress);
    }

    function getAllStakingPools() external view returns (address[] memory) {
        return stakingPools;
    }

    function setOperator(address _operatorAddress) external {
        operatorAddress = _operatorAddress;
    }

    function withdrawTokens(uint256 amount) external onlyOperator {
        IERC20(tokenAddress).transfer(operatorAddress, amount);
    }
}
