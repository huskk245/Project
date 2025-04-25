import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  origin: {
    type: String,
    required: true
  },
  harvestDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: 'N/A'
  },
  image: {
    type: String,
    required: true
  },
  rfid: {
    type: String,
    required: true
  },
  freshnessScore: {
    type: Number,
    required: true
  },
  isFresh: {
    type: Boolean,
    required: true
  },
  predictedLabel: {
    type: String,
    required: false
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplyChain: [{
    location: String,
    date: Date,
    description: String,
    verificationImage: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Product = mongoose.model('Product', productSchema);

export default Product;