const express = require('express');
const router = express.Router();
const Education = require('../models/Education');
const auth = require('../middleware/auth');

// @route   GET /api/education
// @desc    Get all education
// @access  Public
router.get('/', async (req, res) => {
  try {
    const education = await Education.find().sort({ order: 1, createdAt: -1 });
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
    const education = await Education.findById(req.params.id);
    
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
    const education = new Education(req.body);
    await education.save();
    
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
    const education = await Education.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!education) {
      return res.status(404).json({ 
        message: 'Education not found' 
      });
    }
    
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
    const education = await Education.findByIdAndDelete(req.params.id);
    
    if (!education) {
      return res.status(404).json({ 
        message: 'Education not found' 
      });
    }
    
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