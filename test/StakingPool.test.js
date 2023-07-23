const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('StakingPool', function () {
  let stakingPool;
  let token;
  let user;
  let rewarder;

  const TOKEN_SUPPLY = ethers.utils.parseEther('1000000');
  const MIN_STAKING_PERIOD = 5 * 60;
  const MAX_STAKING_PERIOD = 4 * 60 * 60;
  const MAX_STAKING_AMOUNT = ethers.utils.parseEther('10000');
  const CAPACITY = ethers.utils.parseEther('100000');
  const HOURLY_REWARD = 10;

  beforeEach(async () => {
    [owner, user, rewarder] = await ethers.getSigners();

    const Token = await ethers.getContractFactory('TestToken');
    token = await Token.deploy('Test Token', 'TEST', TOKEN_SUPPLY);
    await token.deployed();

    await token.transfer(rewarder.address, CAPACITY);

    const StakingPool = await ethers.getContractFactory('StakingPool');
    stakingPool = await StakingPool.deploy(
      token.address,
      rewarder.address,
      MIN_STAKING_PERIOD,
      MAX_STAKING_PERIOD,
      MAX_STAKING_AMOUNT,
      CAPACITY,
      HOURLY_REWARD
    );
    await stakingPool.deployed();

    await token.connect(rewarder).approve(stakingPool.address, CAPACITY);
  });

  it('should allow user to stake tokens', async () => {
    const amount = ethers.utils.parseEther('1000');

    await token.transfer(user.address, amount);
    await token.connect(user).approve(stakingPool.address, amount);
    await stakingPool.connect(user).stakeTokens(amount);

    const stake = await stakingPool.stakes(user.address);
    expect(stake.amount).to.equal(amount);
    expect(stake.stakingTime).to.be.above(0);
  });

  it('should not allow user to stake more than the maximum token amount', async () => {
    const amount = ethers.utils.parseEther('10001');

    await token.transfer(user.address, amount);
    await token.connect(user).approve(stakingPool.address, amount);

    await expect(stakingPool.connect(user).stakeTokens(amount)).to.be.revertedWith(
      'StakingPool: Amount exceeds the maximum stake amount'
    );
  });

  it('should not allow user to stake if the pool capacity is exceeded', async () => {
    const amount = ethers.utils.parseEther('100001');

    await token.transfer(user.address, amount);
    await token.connect(user).approve(stakingPool.address, amount);

    await expect(stakingPool.connect(user).stakeTokens(amount)).to.be.revertedWith(
      'StakingPool: Amount exceeds pool capacity'
    );
  });

  it('should allow user to unstake tokens', async () => {
    const amount = ethers.utils.parseEther('1000');
    const stakingTime = 2 * 60 * 60;

    await token.transfer(user.address, amount);
    await token.connect(user).approve(stakingPool.address, amount);
    await stakingPool.connect(user).stakeTokens(amount);
    await ethers.provider.send('evm_increaseTime', [stakingTime]);
    await stakingPool.connect(user).unstakeTokens();

    const userBalance = await token.balanceOf(user.address);
    expect(userBalance).to.equal(ethers.utils.parseEther('1200'));
  });

  it('should not allow user to unstake before the minimum staking period', async () => {
    const amount = ethers.utils.parseEther('1000');

    await token.transfer(user.address, amount);
    await token.connect(user).approve(stakingPool.address, amount);
    await stakingPool.connect(user).stakeTokens(amount);

    await expect(stakingPool.connect(user).unstakeTokens()).to.be.revertedWith(
      'StakingPool: Minimum staking period not reached'
    );
  });
});
