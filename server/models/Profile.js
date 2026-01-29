import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  birthday: {
    type: String
  },
  location: {
    type: String
  },
  bio: {
    type: String
  },
  social: {
    linkedin: String,
    github: String,
    twitter: String,
    instagram: String
  },
  resumeUrl: {
    type: String
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

profileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Profile', profileSchema);
