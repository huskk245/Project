const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const ProductTrackerArtifact = require('./build/ProductTracker.json');
const IPFSStorageArtifact = require('./build/IPFSStorage.json');

// Initialize Web3
let web3;
if (process.env.NODE_ENV === 'production') {
  const HDWalletProvider = require('@truffle/hdwallet-provider');
  const provider = new HDWalletProvider(
    process.env.MNEMONIC,
    process.env.TESTNET_RPC_URL
  );
  web3 = new Web3(provider);
} else {
  web3 = new Web3('http://127.0.0.1:7545'); // Ganache default
}

async function deploy() {
  try {
    const accounts = await web3.eth.getAccounts();
    console.log('Deploying contracts from account:', accounts[0]);
    
    // Deploy ProductTracker
    console.log('Deploying ProductTracker...');
    const productTrackerInstance = new web3.eth.Contract(ProductTrackerArtifact.abi);
    const productTracker = await productTrackerInstance
      .deploy({ data: ProductTrackerArtifact.bytecode })
      .send({ from: accounts[0], gas: 5000000 });
    
    console.log('ProductTracker deployed at:', productTracker.options.address);
    
    // Deploy IPFSStorage
    console.log('Deploying IPFSStorage...');
    const ipfsStorageInstance = new web3.eth.Contract(IPFSStorageArtifact.abi);
    const ipfsStorage = await ipfsStorageInstance
      .deploy({ data: IPFSStorageArtifact.bytecode })
      .send({ from: accounts[0], gas: 5000000 });
    
    console.log('IPFSStorage deployed at:', ipfsStorage.options.address);
    
    // Update the .env file with contract addresses
    updateEnvFile({
      PRODUCT_TRACKER_ADDRESS: productTracker.options.address,
      IPFS_STORAGE_ADDRESS: ipfsStorage.options.address
    });
    
    console.log('Deployment complete!');
    
    return {
      productTrackerAddress: productTracker.options.address,
      ipfsStorageAddress: ipfsStorage.options.address
    };
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
}

function updateEnvFile(updates) {
  try {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    // Read existing .env file if it exists
    try {
      envContent = fs.readFileSync(envPath, 'utf8');
    } catch (error) {
      console.log('Creating new .env file');
    }
    
    // Update environment variables
    for (const [key, value] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    }
    
    // Write updated content back to .env file
    fs.writeFileSync(envPath, envContent.trim());
    console.log('Updated .env file with contract addresses');
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
}

// Execute deployment if this script is run directly
if (require.main === module) {
  deploy()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { deploy }; 