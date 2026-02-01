const express = require('express');
const router = express.Router();
const { sendEmail } = require('../services/emailService');

// POST /api/contact
// Public route — no auth needed
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validasi field wajib
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields (name, email, subject, message) are required.' 
      });
    }

    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid email format.' 
      });
    }

    // Kirim email melalui service
    await sendEmail({ name, email, subject, message });

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Contact route error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send message. Please try again later.' 
    });
  }
});

module.exports = router;