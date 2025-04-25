import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Get all pending verification requests (admin only)
router.get('/pending', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const pendingUsers = await User.find({
      $or: [
        { role: 'farmer', profileCompleted: true, verificationStatus: 'pending' },
        { role: 'retailer', profileCompleted: true, verificationStatus: 'pending' }
      ]
    }).select('-password');
    res.json(pendingUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Approve or reject a verification request (admin only)
router.put('/:id', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'farmer' && user.role !== 'retailer') {
      return res.status(400).json({ message: 'User is not a farmer or retailer' });
    }

    if (!user.profileCompleted) {
      return res.status(400).json({ message: 'User has not completed their profile' });
    }

    if (user.verificationStatus !== 'pending') {
      return res.status(400).json({ message: 'Verification is not in pending status' });
    }

    user.verificationStatus = status;
    user.verified = status === 'approved'; // Set verified to true if approved
    await user.save();

    res.json({
      message: `Verification ${status} successfully`,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        verified: user.verified,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;