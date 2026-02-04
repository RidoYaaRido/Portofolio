const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// --- 1. MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 2. DATABASE CONNECTION LOGIC ---
const MONGODB_URI = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    // Mongoose 6+ tidak memerlukan useNewUrlParser & useUnifiedTopology
    const conn = await mongoose.connect(MONGODB_URI);
    
    console.log('-----------------------------------------');
    console.log(`✅ MongoDB Connected!`);
    console.log(`📡 Host: ${conn.connection.host}`);
    console.log(`📂 Database: ${conn.connection.name}`);
    console.log('-----------------------------------------');
  } catch (err) {
    console.error('-----------------------------------------');
    console.error(`❌ MongoDB Connection Error!`);
    console.error(`📝 Message: ${err.message}`);
    console.error('-----------------------------------------');
    // Tidak mematikan proses agar server tetap hidup untuk Health Check
  }
};

connectDB();

// --- 3. HEALTH CHECK ENDPOINT ---
// Gunakan ini untuk cek status via browser: https://api-anda.vercel.app/api/status
app.get('/api/status', (req, res) => {
  const dbStatus = {
    0: "Disconnected",
    1: "Connected",
    2: "Connecting",
    3: "Disconnecting"
  };

  res.status(200).json({
    server: "Online",
    database: dbStatus[mongoose.connection.readyState],
    details: {
      uptime: Math.floor(process.uptime()) + " seconds",
      node_version: process.version
    }
  });
});

// --- 4. ROUTES ---
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const projectRoutes = require('./routes/projects');
const skillRoutes = require('./routes/skills');
const blogRoutes = require('./routes/blogs');
const educationRoutes = require('./routes/education');
const experienceRoutes = require('./routes/experience');
const contactRouter = require('./routes/contact');

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/contact', contactRouter);

// --- 5. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Internal Server Error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🩺 Health check available at http://localhost:${PORT}/api/status`);
});

module.exports = app;
