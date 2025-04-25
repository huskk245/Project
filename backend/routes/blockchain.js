import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import authMiddleware from '../middleware/authMiddleware.js';

// Import blockchain and IPFS functionality
// Note: Since backend is ES modules and blockchain is CommonJS, we need to do dynamic imports
const blockchainPath = path.join(process.cwd(), '..', 'blockchain');

const router = express.Router();

// Setup file upload for images
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// Register a new product with image and initial stage data
router.post('/register-product', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Dynamically import blockchain modules
    const { registerProduct } = await import('../../blockchain/blockchain.js');
    const { addFileToIPFS } = await import('../../blockchain/ipfs.js');
    
    const { 
      productId, 
      rfid, 
      name, 
      productType, 
      origin, 
      harvestDate, 
      freshnessScore, 
      location, 
      handler, 
      description 
    } = req.body;
    
    // Upload image to IPFS
    let imageHash = '';
    if (req.file) {
      const ipfsResult = await addFileToIPFS(req.file.path);
      if (!ipfsResult.success) {
        return res.status(500).json({ error: 'Failed to upload image to IPFS' });
      }
      imageHash = ipfsResult.hash;
    }
    
    // Register product on blockchain
    const result = await registerProduct({
      productId,
      rfid,
      name,
      productType,
      origin,
      harvestDate: parseInt(harvestDate),
      imageHash,
      freshnessScore: parseInt(freshnessScore),
      location,
      handler,
      description
    });
    
    res.status(201).json({
      success: true,
      message: 'Product registered successfully',
      data: {
        transaction: result.transactionHash,
        imageHash
      }
    });
  } catch (error) {
    console.error('Error registering product:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record intermediate stage with RFID data
router.post('/record-intermediate-stage', authMiddleware, async (req, res) => {
  try {
    // Dynamically import blockchain module
    const { recordIntermediateStage } = await import('../../blockchain/blockchain.js');
    
    const { rfid, location, handler, description } = req.body;
    
    // Record intermediate stage on blockchain
    const result = await recordIntermediateStage({
      rfid,
      location,
      handler,
      description
    });
    
    res.status(200).json({
      success: true,
      message: 'Intermediate stage recorded successfully',
      data: {
        transaction: result.transactionHash
      }
    });
  } catch (error) {
    console.error('Error recording intermediate stage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Record final stage with image and freshness data
router.post('/record-final-stage', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    // Dynamically import blockchain modules
    const { recordFinalStage } = await import('../../blockchain/blockchain.js');
    const { addFileToIPFS } = await import('../../blockchain/ipfs.js');
    
    const { rfid, freshnessScore, location, handler, description } = req.body;
    
    // Upload image to IPFS
    let imageHash = '';
    if (req.file) {
      const ipfsResult = await addFileToIPFS(req.file.path);
      if (!ipfsResult.success) {
        return res.status(500).json({ error: 'Failed to upload image to IPFS' });
      }
      imageHash = ipfsResult.hash;
    }
    
    // Record final stage on blockchain
    const result = await recordFinalStage({
      rfid,
      imageHash,
      freshnessScore: parseInt(freshnessScore),
      location,
      handler,
      description
    });
    
    res.status(200).json({
      success: true,
      message: 'Final stage recorded successfully',
      data: {
        transaction: result.transactionHash,
        imageHash
      }
    });
  } catch (error) {
    console.error('Error recording final stage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get product details and all stages
router.get('/product/:rfid', async (req, res) => {
  try {
    // Dynamically import blockchain module
    const { getProductDetails, getAllProductStages } = await import('../../blockchain/blockchain.js');
    const { getIPFSUrl } = await import('../../blockchain/ipfs.js');
    
    const { rfid } = req.params;
    
    // Get product details from blockchain
    const details = await getProductDetails(rfid);
    
    // Get all stages from blockchain
    const stages = await getAllProductStages(rfid);
    
    // Process stages to add IPFS URLs
    const processedStages = stages.map(stage => {
      if (stage.imageHash && stage.imageHash !== '') {
        return {
          ...stage,
          imageUrl: getIPFSUrl(stage.imageHash)
        };
      }
      return stage;
    });
    
    res.status(200).json({
      success: true,
      data: {
        details,
        stages: processedStages
      }
    });
  } catch (error) {
    console.error('Error getting product details:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all product IDs
router.get('/products', async (req, res) => {
  try {
    // Dynamically import blockchain module
    const { getAllProductIds } = await import('../../blockchain/blockchain.js');
    
    // Get all product IDs from blockchain
    const productIds = await getAllProductIds();
    
    res.status(200).json({
      success: true,
      data: {
        productIds
      }
    });
  } catch (error) {
    console.error('Error getting product IDs:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router; 