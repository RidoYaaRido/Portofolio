const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Middleware to map database id to _id for React client compatibility
app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && typeof body === 'object') {
      const format = (data) => {
        if (data === null || data === undefined) return data;
        if (Array.isArray(data)) {
          return data.map(format);
        }
        if (typeof data === 'object') {
          const formatted = { ...data };
          if (formatted.id && formatted._id === undefined) {
            formatted._id = formatted.id;
          }
          for (const key in formatted) {
            if (formatted[key] && typeof formatted[key] === 'object') {
              formatted[key] = format(formatted[key]);
            }
          }
          return formatted;
        }
        return data;
      };
      body = format(body);
    }
    return originalJson.call(this, body);
  };
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Database connection info
console.log('🔌 Database backend: Prisma Client initialized');

// Import Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const blogRoutes = require('./routes/blogs');
const educationRoutes = require('./routes/education');
const experienceRoutes = require('./routes/experience');
const contactRouter = require('./routes/contact');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/contact', contactRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
