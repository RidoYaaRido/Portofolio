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

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single project
router.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id }
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create project
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const technologies = JSON.parse(req.body.technologies || '[]');
    const featured = req.body.featured === 'true' || req.body.featured === true;
    const image = req.file ? await uploadToSupabase(req.file, 'projects') : '';

    const project = await prisma.project.create({
      data: {
        title: req.body.title || '',
        category: req.body.category || '',
        description: req.body.description || '',
        image,
        technologies,
        demoUrl: req.body.demoUrl || null,
        githubUrl: req.body.githubUrl || null,
        featured
      }
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update project
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const updateData = {};
    
    // Check fields to update
    const stringFields = ['title', 'category', 'description', 'demoUrl', 'githubUrl'];
    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.technologies) {
      updateData.technologies = JSON.parse(req.body.technologies);
    }
    
    if (req.file) {
      updateData.image = await uploadToSupabase(req.file, 'projects');
    }

    if (req.body.featured !== undefined) {
      updateData.featured = req.body.featured === 'true' || req.body.featured === true;
    }

    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await prisma.project.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;