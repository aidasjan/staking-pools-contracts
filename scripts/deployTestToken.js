const { ethers } = require('hardhat');

const main = async () => {
  console.log('Deploying TestToken');

  const TestToken = await ethers.getContractFactory('TestToken');
  const testToken = await TestToken.deploy('Test Token', 'TEST', ethers.utils.parseEther('1000000'));
  await testToken.deployed();

  console.log('TestToken deployed:', testToken.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });