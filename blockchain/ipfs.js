const { create } = require('ipfs-http-client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Initialize IPFS client
const ipfs = create({ url: process.env.IPFS_API_URL || 'http://localhost:5001' });

// Function to add a file to IPFS
async function addFileToIPFS(filePath) {
  try {
    const fileData = fs.readFileSync(filePath);
    const result = await ipfs.add(fileData);
    return {
      success: true,
      hash: result.path,
      size: result.size
    };
  } catch (error) {
    console.error('Error adding file to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to add a buffer to IPFS (e.g., for image data)
async function addBufferToIPFS(buffer) {
  try {
    const result = await ipfs.add(buffer);
    return {
      success: true,
      hash: result.path,
      size: result.size
    };
  } catch (error) {
    console.error('Error adding buffer to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to add a JSON object to IPFS
async function addJSONToIPFS(json) {
  try {
    const jsonString = JSON.stringify(json);
    const result = await ipfs.add(jsonString);
    return {
      success: true,
      hash: result.path,
      size: result.size
    };
  } catch (error) {
    console.error('Error adding JSON to IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Function to get data from IPFS by hash
async function getFromIPFS(hash) {
  try {
    const chunks = [];
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk);
    }
    return {
      success: true,
      data: Buffer.concat(chunks)
    };
  } catch (error) {
    console.error('Error getting data from IPFS:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get the IPFS gateway URL for a hash
function getIPFSUrl(hash) {
  const gateway = process.env.IPFS_GATEWAY_URL || 'http://localhost:8080';
  return `${gateway}/ipfs/${hash}`;
}

module.exports = {
  ipfs,
  addFileToIPFS,
  addBufferToIPFS,
  addJSONToIPFS,
  getFromIPFS,
  getIPFSUrl
}; 