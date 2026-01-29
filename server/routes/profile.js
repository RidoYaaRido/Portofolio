import express from 'express';
import Profile from '../models/Profile.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get profile (public)
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
});

// Create or update profile (admin only)
router.post('/', authenticate, isAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const {
      name,
      title,
      email,
      phone,
      birthday,
      location,
      bio,
      linkedin,
      github,
      twitter,
      instagram,
      resumeUrl
    } = req.body;

    const profileData = {
      name,
      title,
      email,
      phone,
      birthday,
      location,
      bio,
      social: {
        linkedin,
        github,
        twitter,
        instagram
      },
      resumeUrl
    };

    if (req.file) {
      profileData.avatar = `/uploads/${req.file.filename}`;
    }

    // Check if profile exists
    let profile = await Profile.findOne();

    if (profile) {
      // Update existing profile
      if (!req.file) {
        profileData.avatar = profile.avatar;
      }
      profile = await Profile.findByIdAndUpdate(profile._id, profileData, { new: true });
      res.json({ message: 'Profile updated successfully', profile });
    } else {
      // Create new profile
      profile = new Profile(profileData);
      await profile.save();
      res.status(201).json({ message: 'Profile created successfully', profile });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving profile', error: error.message });
  }
});

export default router;
