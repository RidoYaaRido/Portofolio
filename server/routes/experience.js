const express = require('express');
const router = express.Router();
const Experience = require('../models/Experience');
const auth = require('../middleware/auth');

// @route   GET /api/experience
// @desc    Get all experience
// @access  Public
router.get('/', async (req, res) => {
  try {
    const experience = await Experience.find().sort({ order: 1, createdAt: -1 });
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
    const experience = await Experience.findById(req.params.id);
    
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
    const experience = new Experience(req.body);
    await experience.save();
    
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
    const experience = await Experience.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!experience) {
      return res.status(404).json({ 
        message: 'Experience not found' 
      });
    }
    
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
    const experience = await Experience.findByIdAndDelete(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ 
        message: 'Experience not found' 
      });
    }
    
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