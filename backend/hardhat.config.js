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
    // Polygon Networks
    polygonMumbai: {
      url: process.env.POLYGON_MUMBAI_RPC_URL || 'https://rpc-mumbai.maticvigil.com',
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66)
        ? [process.env.PRIVATE_KEY]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
      chainId: 80001,
      gasPrice: 20000000000, // 20 Gwei
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66)
        ? [process.env.PRIVATE_KEY]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
      chainId: 137,
      gasPrice: 50000000000, // 50 Gwei
    },
    // Binance Smart Chain Networks
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66)
        ? [process.env.PRIVATE_KEY]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
      chainId: 97,
      gasPrice: 10000000000, // 10 Gwei
    },
    bsc: {
      url: process.env.BSC_RPC_URL || 'https://bsc-dataseed1.binance.org',
      accounts: (process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length === 66)
        ? [process.env.PRIVATE_KEY]
        : ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'],
      chainId: 56,
      gasPrice: 5000000000, // 5 Gwei
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
};
