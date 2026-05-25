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

router.get('/', async (req, res) => {
  try {
    const blogs = await prisma.blog.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: req.params.id }
    });
    if (!blog) return res.status(404).json({ message: 'Blog not found' });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const published = req.body.published === 'true' || req.body.published === true;
    const image = req.file ? await uploadToSupabase(req.file, 'blogs') : '';

    const blog = await prisma.blog.create({
      data: {
        title: req.body.title || '',
        category: req.body.category || '',
        excerpt: req.body.excerpt || '',
        content: req.body.content || '',
        image,
        readTime: req.body.readTime || '5 min read',
        published
      }
    });

    res.status(201).json({ message: 'Blog created successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const updateData = {};
    const stringFields = ['title', 'category', 'excerpt', 'content', 'readTime'];
    stringFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.file) {
      updateData.image = await uploadToSupabase(req.file, 'blogs');
    }

    if (req.body.published !== undefined) {
      updateData.published = req.body.published === 'true' || req.body.published === true;
    }

    const blog = await prisma.blog.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({ message: 'Blog updated successfully', blog });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const blog = await prisma.blog.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;