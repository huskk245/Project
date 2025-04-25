const Web3 = require('web3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Load contract ABIs
const ProductTrackerArtifact = require('./build/ProductTracker.json');
const IPFSStorageArtifact = require('./build/IPFSStorage.json');

// Initialize Web3
let web3;
if (process.env.NODE_ENV === 'production') {
  web3 = new Web3(process.env.TESTNET_RPC_URL);
} else {
  web3 = new Web3('http://127.0.0.1:7545'); // Ganache default
}

// Initialize contract instances
const productTracker = new web3.eth.Contract(
  ProductTrackerArtifact.abi,
  process.env.PRODUCT_TRACKER_ADDRESS
);

const ipfsStorage = new web3.eth.Contract(
  IPFSStorageArtifact.abi,
  process.env.IPFS_STORAGE_ADDRESS
);

// Get default account for transactions
async function getDefaultAccount() {
  const accounts = await web3.eth.getAccounts();
  return accounts[0];
}

// Product registration - Initial stage with image, freshness score, and RFID
async function registerProduct(productData) {
  const account = await getDefaultAccount();
  
  return productTracker.methods.registerProduct(
    productData.productId,
    productData.rfid,
    productData.name,
    productData.productType,
    productData.origin,
    productData.harvestDate,
    productData.imageHash,
    productData.freshnessScore,
    productData.location,
    productData.handler,
    productData.description
  ).send({ from: account, gas: 3000000 });
}

// Record intermediate stage (with RFID data only)
async function recordIntermediateStage(stageData) {
  const account = await getDefaultAccount();
  
  return productTracker.methods.recordIntermediateStage(
    stageData.rfid,
    stageData.location,
    stageData.handler,
    stageData.description
  ).send({ from: account, gas: 3000000 });
}

// Record final stage (with image, freshness score, and RFID)
async function recordFinalStage(stageData) {
  const account = await getDefaultAccount();
  
  return productTracker.methods.recordFinalStage(
    stageData.rfid,
    stageData.imageHash,
    stageData.freshnessScore,
    stageData.location,
    stageData.handler,
    stageData.description
  ).send({ from: account, gas: 3000000 });
}

// Add image to IPFS Storage contract
async function addImage(imageData) {
  const account = await getDefaultAccount();
  
  return ipfsStorage.methods.addImage(
    imageData.rfid,
    imageData.ipfsHash,
    imageData.name,
    imageData.description
  ).send({ from: account, gas: 3000000 });
}

// Get product details
async function getProductDetails(rfid) {
  const result = await productTracker.methods.getProductDetails(rfid).call();
  
  // Format the result into an object
  return {
    name: result[0],
    productType: result[1],
    origin: result[2],
    harvestDate: result[3],
    stageCount: result[4]
  };
}

// Get product stage details
async function getProductStage(rfid, stageNumber) {
  const result = await productTracker.methods.getProductStage(rfid, stageNumber).call();
  
  // Format the result into an object
  return {
    rfid: result[0],
    imageHash: result[1],
    freshnessScore: result[2],
    timestamp: result[3],
    location: result[4],
    handler: result[5],
    description: result[6]
  };
}

// Get all stages for a product
async function getAllProductStages(rfid) {
  const details = await getProductDetails(rfid);
  const stageCount = parseInt(details.stageCount);
  
  const stages = [];
  for (let i = 0; i < stageCount; i++) {
    const stage = await getProductStage(rfid, i);
    stages.push(stage);
  }
  
  return stages;
}

// Get all product RFIDs by product ID
async function getProductRfids(productId) {
  return productTracker.methods.getProductRfids(productId).call();
}

// Get all product IDs
async function getAllProductIds() {
  return productTracker.methods.getAllProductIds().call();
}

module.exports = {
  web3,
  productTracker,
  ipfsStorage,
  registerProduct,
  recordIntermediateStage,
  recordFinalStage,
  addImage,
  getProductDetails,
  getProductStage,
  getAllProductStages,
  getProductRfids,
  getAllProductIds
}; 