import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import Product from '../models/Product.js';

const router = express.Router();

// Add a new product (farmer only)
router.post('/add', authMiddleware, roleMiddleware(['farmer']), async (req, res) => {
  try {
    const { name, origin, harvestDate, description } = req.body;
    const product = new Product({
      name,
      origin,
      harvestDate,
      description,
      farmer: req.user.id,
      supplyChain: [{ location: origin, date: harvestDate, description: 'Product harvested' }],
    });
    await product.save();
    res.status(201).json({ message: 'Product added successfully', product });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

export default router;