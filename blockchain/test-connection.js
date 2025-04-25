const { 
  web3, 
  productTracker, 
  ipfsStorage, 
  getProductDetails, 
  getAllProductIds 
} = require('./blockchain.js');

async function testConnection() {
  try {
    // Test Web3 connection
    const accounts = await web3.eth.getAccounts();
    console.log('Connected to Ganache! Available accounts:', accounts);
    
    // Get chain ID
    const chainId = await web3.eth.getChainId();
    console.log('Chain ID:', chainId);
    
    // Check contract instances
    console.log('ProductTracker contract address:', productTracker.options.address);
    console.log('IPFSStorage contract address:', ipfsStorage.options.address);
    
    // Try to get all product IDs (should be empty at first)
    const productIds = await getAllProductIds();
    console.log('Product IDs:', productIds);
    
    console.log('Connection test successful!');
  } catch (error) {
    console.error('Error testing connection:', error);
  }
}

testConnection(); 