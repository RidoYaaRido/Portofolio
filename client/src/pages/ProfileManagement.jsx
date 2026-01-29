import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../services/api';

const ProfileManagement = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    birthday: '',
    location: '',
    bio: '',
    linkedin: '',
    github: '',
    twitter: '',
    instagram: '',
    resumeUrl: '',
    avatar: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const profile = response.data;
      setFormData({
        name: profile.name || '',
        title: profile.title || '',
        email: profile.email || '',
        phone: profile.phone || '',
        birthday: profile.birthday || '',
        location: profile.location || '',
        bio: profile.bio || '',
        linkedin: profile.social?.linkedin || '',
        github: profile.social?.github || '',
        twitter: profile.social?.twitter || '',
        instagram: profile.social?.instagram || '',
        resumeUrl: profile.resumeUrl || '',
        avatar: null
      });
    } catch (error) {
      console.log('No profile found');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, avatar: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          data.append(key, formData[key]);
        }
      });

      await api.post('/profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Profile updated successfully');
      fetchProfile();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Profile Management</h1>
      </div>

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Title *</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </div>
            <div className="form-group">
              <label>Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Birthday</label>
              <input type="text" name="birthday" value={formData.birthday} onChange={handleInputChange} placeholder="January 1, 1990" />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="4" />
          </div>

          <div className="form-group">
            <label>Avatar</label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
          </div>
        </div>

        <div className="form-section">
          <h2>Social Media</h2>
          <div className="form-row">
            <div className="form-group">
              <label>LinkedIn</label>
              <input type="url" name="linkedin" value={formData.linkedin} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>GitHub</label>
              <input type="url" name="github" value={formData.github} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Twitter</label>
              <input type="url" name="twitter" value={formData.twitter} onChange={handleInputChange} />
            </div>
            <div className="form-group">
              <label>Instagram</label>
              <input type="url" name="instagram" value={formData.instagram} onChange={handleInputChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Resume URL</label>
            <input type="url" name="resumeUrl" value={formData.resumeUrl} onChange={handleInputChange} />
          </div>
        </div>

        <button type="submit" className="btn-primary btn-large" disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  );
};

export default ProfileManagement;
