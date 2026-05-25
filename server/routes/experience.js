const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');

// @route   GET /api/experience
// @desc    Get all experience
// @access  Public
router.get('/', async (req, res) => {
  try {
    const experience = await prisma.experience.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(experience);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/experience/:id
// @desc    Get single experience
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const experience = await prisma.experience.findUnique({
      where: { id: req.params.id }
    });
    
    if (!experience) {
      return res.status(404).json({ 
        message: 'Experience not found' 
      });
    }
    
    res.json(experience);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/experience
// @desc    Create experience
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const order = req.body.order !== undefined ? parseInt(req.body.order, 10) : 0;
    const experience = await prisma.experience.create({
      data: {
        position: req.body.position || '',
        company: req.body.company || '',
        period: req.body.period || '',
        description: req.body.description || '',
        order
      }
    });
    
    res.status(201).json({ 
      message: 'Experience created successfully', 
      experience 
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/experience/:id
// @desc    Update experience
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {};
    const stringFields = ['position', 'company', 'period', 'description'];
    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.order !== undefined) {
      updateData.order = parseInt(req.body.order, 10);
    }

    const experience = await prisma.experience.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json({ 
      message: 'Experience updated successfully', 
      experience 
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/experience/:id
// @desc    Delete experience
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const experience = await prisma.experience.delete({
      where: { id: req.params.id }
    });
    
    res.json({ 
      message: 'Experience deleted successfully' 
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;