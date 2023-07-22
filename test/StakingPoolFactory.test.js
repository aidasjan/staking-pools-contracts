const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('StakingPoolFactory', function () {
  let stakingPoolFactory;
  let token;
  let operator;
  let user;

  const TOKEN_SUPPLY = ethers.utils.parseEther('1000000');
  const MIN_STAKING_PERIOD = 5 * 60;
  const MAX_STAKING_PERIOD = 4 * 60 * 60;
  const MAX_STAKING_AMOUNT = ethers.utils.parseEther('10000');
  const CAPACITY = ethers.utils.parseEther('100000');
  const HOURLY_REWARD = 10;

  beforeEach(async () => {
    [owner, user, operator] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('TestToken');
    token = await Token.deploy('Test Token', 'TEST', TOKEN_SUPPLY);
    await token.deployed();

    const StakingPoolFactory = await ethers.getContractFactory('StakingPoolFactory');
    stakingPoolFactory = await StakingPoolFactory.deploy(
      token.address,
      operator.address
    );
    await stakingPoolFactory.deployed();

    const rewardAmount = ethers.utils.parseEther('40000');
    await token.transfer(operator.address, rewardAmount);
    await token.connect(operator).approve(stakingPoolFactory.address, rewardAmount);
  });

  it('should create a staking pool', async () => {
    await stakingPoolFactory.createStakingPool(
      MIN_STAKING_PERIOD,
      MAX_STAKING_PERIOD,
      MAX_STAKING_AMOUNT,
      CAPACITY,
      HOURLY_REWARD
    );

    const stakingPools = await stakingPoolFactory.getAllStakingPools();
    expect(stakingPools.length).to.equal(1);

    const stakingPool = await ethers.getContractAt('StakingPool', stakingPools[0]);
    expect(await stakingPool.tokenAddress()).to.equal(token.address);
    expect(await stakingPool.rewarderAddress()).to.equal(stakingPoolFactory.address);
    expect(await stakingPool.minStakingPeriod()).to.equal(MIN_STAKING_PERIOD);
    expect(await stakingPool.maxStakingPeriod()).to.equal(MAX_STAKING_PERIOD);
    expect(await stakingPool.maxStakingAmount()).to.equal(MAX_STAKING_AMOUNT);
    expect(await stakingPool.capacity()).to.equal(CAPACITY);
    expect(await stakingPool.hourlyReward()).to.equal(HOURLY_REWARD);
  });

  it('should not allow user to create a new staking pool', async () => {
    await expect(
      stakingPoolFactory
        .connect(user)
        .createStakingPool(
          MIN_STAKING_PERIOD,
          MAX_STAKING_PERIOD,
          MAX_STAKING_AMOUNT,
          CAPACITY,
          HOURLY_REWARD
        )
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });

  it('should allow operator to withdraw tokens', async () => {
    await stakingPoolFactory.createStakingPool(
      MIN_STAKING_PERIOD,
      MAX_STAKING_PERIOD,
      MAX_STAKING_AMOUNT,
      CAPACITY,
      HOURLY_REWARD
    );

    const rewardAmount = ethers.utils.parseEther('40000');

    await stakingPoolFactory.connect(operator).withdrawTokens(rewardAmount);

    const operatorBalance = await token.balanceOf(operator.address);
    const factoryBalance = await token.balanceOf(stakingPoolFactory.address);
    expect(operatorBalance).to.equal(rewardAmount);
    expect(factoryBalance).to.equal(0);
  });

  it('should not allow user to withdraw tokens', async () => {
    await expect(
      stakingPoolFactory.connect(user).withdrawTokens(ethers.utils.parseEther('100'))
    ).to.be.revertedWith('StakingPoolFactory: Only the operator can call this function');
  });

  it('should allow owner to set operator', async () => {
    await stakingPoolFactory.connect(owner).setOperator(user.address);
    const operatorAddress = await stakingPoolFactory.operatorAddress()
    expect(operatorAddress).to.equal(user.address);
  });
});