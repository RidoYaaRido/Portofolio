const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const { uploadToSupabase } = require('../utils/storageHelper');

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get Profile
router.get('/', async (req, res) => {
  try {
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      // Create default profile if none exists
      profile = await prisma.profile.create({
        data: {
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
            twitter: '',
            instagram: ''
          }
        }
      });
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
      updateData.avatar = await uploadToSupabase(req.file, 'avatars');
    }
    
    if (req.body.social) {
      updateData.social = JSON.parse(req.body.social);
    }
    
    let profile = await prisma.profile.findFirst();
    
    if (!profile) {
      profile = await prisma.profile.create({
        data: {
          name: updateData.name || '',
          title: updateData.title || '',
          email: updateData.email || '',
          phone: updateData.phone || '',
          birthday: updateData.birthday || '',
          location: updateData.location || '',
          bio: updateData.bio || '',
          avatar: updateData.avatar || '',
          social: updateData.social || {}
        }
      });
    } else {
      const cleanData = {};
      const fields = ['name', 'title', 'email', 'phone', 'birthday', 'location', 'avatar', 'bio', 'social'];
      fields.forEach(field => {
        if (updateData[field] !== undefined) {
          cleanData[field] = updateData[field];
        }
      });

      profile = await prisma.profile.update({
        where: { id: profile.id },
        data: cleanData
      });
    }
    
    res.json({ message: 'Profile updated successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;