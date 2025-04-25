require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*", // Match any network id
    },
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 5777,
    },
    testnet: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.TESTNET_RPC_URL
      ),
      network_id: process.env.TESTNET_NETWORK_ID,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },
  compilers: {
    solc: {
      version: "0.8.17",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  },
  contracts_directory: './contracts/',
  contracts_build_directory: './build/',
  migrations_directory: './migrations/',
}; 