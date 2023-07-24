# Staking Pools Contracts

This repository contains smart contract files for the Staking Pools project. The contracts are written in Solidity and include the StakingPool.sol, StakingPoolFactory.sol, and TestToken.sol contracts. Additionally, deployment scripts deployFactory.js and deployTestToken.js are provided to deploy the contracts. Before deploying, make sure to set the required environment variables in the .env file.

## Installation

To set up the project and install the necessary dependencies, follow these steps:

1. Clone the repository

2. Install Node.js dependencies using Yarn:

   ```bash
   yarn install
   ```

## Contracts

1. **StakingPool.sol**
   - This contract implements the staking pool logic where users can stake tokens to earn rewards. It manages staked amounts, rewards, and distribution logic.

2. **StakingPoolFactory.sol**
   - The StakingPoolFactory contract allows the creation of new staking pools. It is responsible for deploying and initializing individual staking pool contracts. It is also used as a rewarder.

3. **TestToken.sol**
   - The TestToken contract represents a simple ERC20 token used for testing purposes. It can be used as the token to be staked in the staking pools. Tokens can be minted for test purposes.

## Deployment Scripts

1. **deployFactory.js**
   - This script is used to deploy the StakingPoolFactory contract.

2. **deployTestToken.js**
   - Use this script to deploy the TestToken contract

## Environment Variables

Before running the deployment scripts, ensure that you have set the following environment variables in the .env file:

- `PRIVATE_KEY`: The private key of the Ethereum account used to deploy the contracts.
- `TOKEN_ADDRESS`: The address of the ERC20 token contract used for staking.

## Deployment Instructions

1. Set the required environment variables in the .env file as mentioned above.

2. Deploy the TestToken contract using the deployTestToken.js script.

   ```bash
   npx hardhat run scripts/deployTestToken.js
   ```

3. Deploy the StakingPoolFactory contract using the deployFactory.js script.

   ```bash
   npx hardhat run scripts/deployFactory.js
   ```

## Running Tests

Tests for the smart contracts can be executed using Hardhat. Ensure that you have installed Hardhat globally or locally as a dev dependency.

Run tests using the following command:

```bash
npx hardhat test
```

## Licence

Copyright (c) 2023 Aidas Jankauskas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.