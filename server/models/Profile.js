const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  birthday: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    required: true
  },
  social: {
    github: String,
    linkedin: String,

    twitter: String,
    instagram: String
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Profile', profileSchema);