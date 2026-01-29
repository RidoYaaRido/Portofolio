import express from 'express';
import Skill from '../models/Skill.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all skills (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    
    const skills = await Skill.find(filter).sort({ order: 1, name: 1 });
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skills', error: error.message });
  }
});

// Get single skill (public)
router.get('/:id', async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    
    res.json(skill);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching skill', error: error.message });
  }
});

// Create skill (admin only)
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, level, icon, description, order } = req.body;
    
    const skill = new Skill({
      name,
      category,
      level,
      icon,
      description,
      order
    });

    await skill.save();
    res.status(201).json({ message: 'Skill created successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Error creating skill', error: error.message });
  }
});

// Update skill (admin only)
router.put('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, category, level, icon, description, order } = req.body;
    
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { name, category, level, icon, description, order },
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill updated successfully', skill });
  } catch (error) {
    res.status(500).json({ message: 'Error updating skill', error: error.message });
  }
});

// Delete skill (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting skill', error: error.message });
  }
});

export default router;
