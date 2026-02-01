const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  icon: {
    type: String,
    default: '⚡'
  },
  iconType: {
    type: String,
    enum: ['emoji', 'image'],
    default: 'emoji'
  },
  iconUrl: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#ffa500'
  },
  category: {
    type: String,
    enum: ['frontend', 'backend', 'database', 'tools', 'devops', 'design', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Skill', skillSchema);