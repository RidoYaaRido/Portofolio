const express = require('express');
const router = express.Router();
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Get Profile
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    if (!profile) {
      // Create default profile if none exists
      profile = new Profile({
        name: 'Your Name',
        title: 'Web Developer',
        email: 'your.email@example.com',
        phone: '+62 XXX-XXXX-XXXX',
        birthday: 'January 1',
        location: 'Jakarta, Indonesia',
        bio: 'Add your bio here',
        social: {
          github: '',
          linkedin: '',
          twitter: ''
        }
      });
      await profile.save();
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Profile
router.put('/', auth, upload.single('avatar'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }
    
    if (req.body.social) {
      updateData.social = JSON.parse(req.body.social);
    }
    
    updateData.updatedAt = Date.now();
    
    let profile = await Profile.findOne();
    
    if (!profile) {
      profile = new Profile(updateData);
    } else {
      Object.assign(profile, updateData);
    }
    
    await profile.save();
    
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;