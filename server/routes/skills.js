// routes/skills.js
const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { uploadToSupabase } = require('../utils/storageHelper');

// Setup multer untuk upload gambar di memori
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});
// GET all skills
router.get('/', async (req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST create new skill
router.post('/', auth, upload.single('iconFile'), async (req, res) => {
  try {
    const skillData = { ...req.body };
    
    // Jika ada file yang diupload
    if (req.file) {
      skillData.iconType = 'image';
      skillData.iconUrl = await uploadToSupabase(req.file, 'skills');
      skillData.icon = req.file.originalname; // Simpan filename sebagai fallback
    } else {
      skillData.iconType = 'emoji';
    }

    const level = req.body.level !== undefined ? parseInt(req.body.level, 10) : 0;

    const skill = await prisma.skill.create({
      data: {
        name: skillData.name || '',
        level,
        icon: skillData.icon || '⚡',
        iconType: skillData.iconType || 'emoji',
        iconUrl: skillData.iconUrl || null,
        color: skillData.color || '#ffa500',
        category: skillData.category || 'other',
        description: skillData.description || ''
      }
    });

    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update skill
router.put('/:id', auth, upload.single('iconFile'), async (req, res) => {
  try {
    const skillData = { ...req.body };
    
    // Ambil skill lama untuk hapus gambar lama jika perlu
    const oldSkill = await prisma.skill.findUnique({
      where: { id: req.params.id }
    });
    if (!oldSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Jika ada file baru yang diupload
    if (req.file) {
      skillData.iconType = 'image';
      skillData.iconUrl = await uploadToSupabase(req.file, 'skills');
      skillData.icon = req.file.originalname;
    } else if (skillData.iconType === 'emoji') {
      skillData.iconUrl = null;
    }

    const updateData = {};
    const stringFields = ['name', 'icon', 'iconType', 'iconUrl', 'color', 'category', 'description'];
    stringFields.forEach(field => {
      if (skillData[field] !== undefined) {
        updateData[field] = skillData[field];
      }
    });

    if (skillData.level !== undefined) {
      updateData.level = parseInt(skillData.level, 10);
    }

    const skill = await prisma.skill.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await prisma.skill.findUnique({
      where: { id: req.params.id }
    });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // No local file deletion needed since it is uploaded to Supabase Storage

    await prisma.skill.delete({
      where: { id: req.params.id }
    });
    
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;