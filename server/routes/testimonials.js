import express from 'express';
import Testimonial from '../models/Testimonial.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all testimonials (public)
router.get('/', async (req, res) => {
  try {
    const { featured } = req.query;
    const filter = featured === 'true' ? { featured: true } : {};
    
    const testimonials = await Testimonial.find(filter).sort({ createdAt: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching testimonials', error: error.message });
  }
});

// Create testimonial (admin only)
router.post('/', authenticate, isAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { name, position, testimonial, rating, featured } = req.body;
    
    const newTestimonial = new Testimonial({
      name,
      avatar: req.file ? `/uploads/${req.file.filename}` : '',
      position,
      testimonial,
      rating,
      featured: featured === 'true' || featured === true
    });

    await newTestimonial.save();
    res.status(201).json({ message: 'Testimonial created successfully', testimonial: newTestimonial });
  } catch (error) {
    res.status(500).json({ message: 'Error creating testimonial', error: error.message });
  }
});

// Update testimonial (admin only)
router.put('/:id', authenticate, isAdmin, upload.single('avatar'), async (req, res) => {
  try {
    const { name, position, testimonial, rating, featured } = req.body;
    
    const updateData = {
      name,
      position,
      testimonial,
      rating,
      featured: featured === 'true' || featured === true
    };

    if (req.file) {
      updateData.avatar = `/uploads/${req.file.filename}`;
    }

    const updatedTestimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTestimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial updated successfully', testimonial: updatedTestimonial });
  } catch (error) {
    res.status(500).json({ message: 'Error updating testimonial', error: error.message });
  }
});

// Delete testimonial (admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
    
    if (!testimonial) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting testimonial', error: error.message });
  }
});

export default router;
