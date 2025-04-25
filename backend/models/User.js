import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'consumer', 'admin', 'retailer'], default: 'farmer' },
  phoneNumber: { type: String },
  dob: { type: Date },
  address: { type: String },
  farmSize: { type: String },
  storeName: { type: String },
  storeType: { type: String, enum: ['supermarket', 'grocery', 'specialty', 'wholesale', 'online', 'other'] },
  businessLicense: { type: String },
  photo: { type: String },
  profileCompleted: { type: Boolean, default: false },
  verified: { type: Boolean, default: false }, // Indicates if the farmer is verified
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Tracks verification request status
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;