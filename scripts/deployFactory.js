const { ethers } = require('hardhat');

const main = async () => {
  const [deployer] = await ethers.getSigners();

  console.log('Deploying StakingPoolFactory');

  const tokenAddress = process.env.TOKEN_ADDRESS;
  const operatorAddress = deployer.address;

  const StakingPoolFactory = await ethers.getContractFactory('StakingPoolFactory');
  const stakingPoolFactory = await StakingPoolFactory.deploy(tokenAddress, operatorAddress);
  await stakingPoolFactory.deployed();

  console.log('StakingPoolFactory deployed:', stakingPoolFactory.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });