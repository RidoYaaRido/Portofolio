const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
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

    // Ambil email penerima secara dinamis dari database profile
    let recipientEmail = 'ridorifkihakim@gmail.com';
    try {
      const profile = await prisma.profile.findFirst();
      if (profile && profile.email && !profile.email.includes('example.com') && profile.email.trim() !== '') {
        recipientEmail = profile.email.trim();
      } else if (process.env.EMAIL_USER) {
        recipientEmail = process.env.EMAIL_USER;
      }
    } catch (dbError) {
      console.error('Failed to fetch profile email from database:', dbError);
      if (process.env.EMAIL_USER) {
        recipientEmail = process.env.EMAIL_USER;
      }
    }

    // Kirim email melalui service ke email pemilik
    await sendEmail({ 
      name, 
      email, 
      subject, 
      message, 
      to: recipientEmail 
    });

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