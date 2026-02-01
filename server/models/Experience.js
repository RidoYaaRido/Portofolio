const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  position: {
    type: String,
    required: [true, 'Position is required'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true
  },
  period: {
    type: String,
    required: [true, 'Period is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Experience', experienceSchema);