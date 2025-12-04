require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://rpc.sepolia.org',
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66) 
        ? [process.env.PRIVATE_KEY] 
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'], // Default Hardhat key for compilation
      chainId: 11155111,
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
