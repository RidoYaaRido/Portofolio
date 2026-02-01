// routes/skills.js
const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup multer untuk upload gambar
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/skills';
    // Buat folder jika belum ada
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'skill-' + uniqueSuffix + path.extname(file.originalname));
  }
});

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
    const skills = await Skill.find().sort({ category: 1, name: 1 });
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
      skillData.iconUrl = `/uploads/skills/${req.file.filename}`;
      skillData.icon = req.file.filename; // Simpan filename sebagai fallback
    } else {
      skillData.iconType = 'emoji';
    }

    const skill = new Skill(skillData);
    await skill.save();
    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    // Hapus file jika ada error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// PUT update skill
router.put('/:id', auth, upload.single('iconFile'), async (req, res) => {
  try {
    const skillData = { ...req.body };
    
    // Ambil skill lama untuk hapus gambar lama jika perlu
    const oldSkill = await Skill.findById(req.params.id);
    if (!oldSkill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Jika ada file baru yang diupload
    if (req.file) {
      // Hapus gambar lama jika ada
      if (oldSkill.iconType === 'image' && oldSkill.iconUrl) {
        const oldPath = path.join(__dirname, '..', oldSkill.iconUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      
      skillData.iconType = 'image';
      skillData.iconUrl = `/uploads/skills/${req.file.filename}`;
      skillData.icon = req.file.filename;
    } else if (skillData.iconType === 'emoji') {
      // Jika switch ke emoji, hapus gambar lama
      if (oldSkill.iconType === 'image' && oldSkill.iconUrl) {
        const oldPath = path.join(__dirname, '..', oldSkill.iconUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      skillData.iconUrl = null;
    }

    const skill = await Skill.findByIdAndUpdate(req.params.id, skillData, { new: true });
    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    // Hapus file jika ada error
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// DELETE skill
router.delete('/:id', auth, async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    // Hapus gambar jika ada
    if (skill.iconType === 'image' && skill.iconUrl) {
      const imagePath = path.join(__dirname, '..', skill.iconUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Skill.findByIdAndDelete(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;