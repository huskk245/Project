import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import Product from '../models/Product.js';
import { detectFreshness } from '../utils/freshness.js';
import fs from 'fs';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
  }
});

// Add a new product (farmer only)
router.post('/add', authMiddleware, roleMiddleware(['farmer']), upload.single('productImage'), async (req, res) => {
  try {
    const { productType, productName, origin, harvestDate, description, rfid } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    if (!rfid) {
      return res.status(400).json({ message: 'RFID number is required' });
    }

    // Get freshness detection results with error handling
    let freshnessResult = {
      freshnessScore: 100,
      isFresh: true,
      predictedLabel: 'Unknown'
    };

    try {
      freshnessResult = await detectFreshness(req.file.path);
    } catch (error) {
      console.error('Freshness detection failed:', error);
      // Continue with default values
    }

    const product = new Product({
      type: productType,
      name: productName,
      origin,
      harvestDate,
      description,
      rfid,
      image: '/' + req.file.path, // Add leading slash for proper URL formation
      freshnessScore: freshnessResult.freshnessScore,
      isFresh: freshnessResult.isFresh,
      predictedLabel: freshnessResult.predictedLabel,
      farmer: req.user.id,
      supplyChain: [
        {
          location: origin,
          date: harvestDate,
          description: `Product harvested - Freshness Score: ${freshnessResult.freshnessScore}% - Classification: ${freshnessResult.predictedLabel}`,
        },
      ],
    });

    await product.save();
    res.status(201).json({
      message: 'Product added successfully',
      product,
    });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({
      message: 'Failed to add product',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all products for a farmer (farmer only)
router.get('/farmer-products', authMiddleware, roleMiddleware(['farmer']), async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user.id });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product details by ID (consumer only)
router.get('/track/:id', authMiddleware, roleMiddleware(['consumer']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmer', 'username');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all products (consumer and retailer)
router.get('/all', authMiddleware, roleMiddleware(['consumer', 'retailer']), async (req, res) => {
  try {
    const products = await Product.find().populate('farmer', 'username');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a product (farmer only)
router.delete('/:id', authMiddleware, roleMiddleware(['farmer']), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if the product belongs to the requesting farmer
    if (product.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    // Delete the product image from the uploads folder
    if (product.image) {
      const imagePath = product.image;
      fs.unlink(imagePath, (err) => {
        if (err) {
          console.error('Error deleting image file:', err);
        }
      });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product delisted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new endpoint for verifying product freshness
router.post('/verify-freshness', authMiddleware, roleMiddleware(['retailer']), upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required' });
    }

    const { rfid } = req.body;
    if (!rfid) {
      return res.status(400).json({ message: 'RFID is required' });
    }

    // Get the path to the uploaded image
    const imagePath = path.join(process.cwd(), req.file.path);
    
    // Detect freshness using the utility function
    const freshnessResult = await detectFreshness(imagePath);
    
    // Find the product with the provided RFID
    const product = await Product.findOne({ rfid });
    if (!product) {
      return res.status(404).json({ message: 'Product not found with this RFID' });
    }
    
    // Get retailer information
    const retailer = await User.findById(req.user.id).select('username storeName');
    
    // Add verification to supply chain with image URL
    product.supplyChain.push({
      location: retailer.storeName || 'Retail Store',
      date: new Date(),
      description: `Freshness verified by retailer ${retailer.username} - Score: ${freshnessResult.freshnessScore}% - Classification: ${freshnessResult.predictedLabel || 'Unknown'}`,
      verificationImage: `/${req.file.path}` // Add the verification image URL
    });
    
    // Save the updated product
    await product.save();
    
    // Return the freshness result
    res.json({
      rfid,
      freshnessScore: freshnessResult.freshnessScore,
      isFresh: freshnessResult.isFresh,
      predictedLabel: freshnessResult.predictedLabel || undefined,
      imageUrl: `/${req.file.path}`,
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user.id
    });
  } catch (error) {
    console.error('Error during freshness verification:', error);
    res.status(500).json({ message: 'Failed to verify product freshness' });
  }
});

// Add a new endpoint for finding a product by RFID
router.get('/by-rfid', authMiddleware, roleMiddleware(['consumer', 'retailer']), async (req, res) => {
  try {
    const { rfid } = req.query;
    if (!rfid) {
      return res.status(400).json({ message: 'RFID is required' });
    }

    const product = await Product.findOne({ rfid }).populate('farmer', 'username');
    if (!product) {
      return res.status(404).json({ message: 'Product not found with this RFID' });
    }

    console.log(`Product found by RFID ${rfid}:`, product.name);
    console.log(`Supply chain entries: ${product.supplyChain.length}`);
    
    res.json(product);
  } catch (error) {
    console.error('Error finding product by RFID:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;