const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const auth = require('../middleware/auth');

// @route   GET /api/education
// @desc    Get all education
// @access  Public
router.get('/', async (req, res) => {
  try {
    const education = await prisma.education.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.json(education);
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   GET /api/education/:id
// @desc    Get single education
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const education = await prisma.education.findUnique({
      where: { id: req.params.id }
    });
    
    if (!education) {
      return res.status(404).json({ 
        message: 'Education not found' 
      });
    }
    
    res.json(education);
  } catch (error) {
    console.error('Get education error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   POST /api/education
// @desc    Create education
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const order = req.body.order !== undefined ? parseInt(req.body.order, 10) : 0;
    const education = await prisma.education.create({
      data: {
        degree: req.body.degree || '',
        institution: req.body.institution || '',
        period: req.body.period || '',
        description: req.body.description || '',
        order
      }
    });
    
    res.status(201).json({ 
      message: 'Education created successfully', 
      education 
    });
  } catch (error) {
    console.error('Create education error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   PUT /api/education/:id
// @desc    Update education
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {};
    const stringFields = ['degree', 'institution', 'period', 'description'];
    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.order !== undefined) {
      updateData.order = parseInt(req.body.order, 10);
    }

    const education = await prisma.education.update({
      where: { id: req.params.id },
      data: updateData
    });
    
    res.json({ 
      message: 'Education updated successfully', 
      education 
    });
  } catch (error) {
    console.error('Update education error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// @route   DELETE /api/education/:id
// @desc    Delete education
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const education = await prisma.education.delete({
      where: { id: req.params.id }
    });
    
    res.json({ 
      message: 'Education deleted successfully' 
    });
  } catch (error) {
    console.error('Delete education error:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

module.exports = router;