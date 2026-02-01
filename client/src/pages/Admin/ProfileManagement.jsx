import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

const ProfileManagement = () => {
  const [profile, setProfile] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    birthday: '',
    location: '',
    bio: '',
    social: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      setProfile(response.data);
      if (response.data.avatar) {
        setPreviewUrl(`http://localhost:5000${response.data.avatar}`);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const socialField = name.split('.')[1];
      setProfile({
        ...profile,
        social: {
          ...profile.social,
          [socialField]: value
        }
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (key === 'social') {
          formData.append(key, JSON.stringify(profile[key]));
        } else {
          formData.append(key, profile[key]);
        }
      });

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      await api.put('/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Profile updated successfully!');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-container">
      <form onSubmit={handleSubmit} className="admin-form">
        {/* Avatar Upload */}
        <div className="form-section">
          <h3 className="section-title">Profile Picture</h3>
          <div className="avatar-upload">
            <div className="avatar-preview">
              {previewUrl ? (
                <img src={previewUrl} alt="Avatar preview" />
              ) : (
                <div className="avatar-placeholder">No Image</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="avatar"
              className="file-input"
            />
            <label htmlFor="avatar" className="file-label">
              Choose Image
            </label>
          </div>
        </div>

        {/* Basic Info */}
        <div className="form-section">
          <h3 className="section-title">Basic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                name="title"
                value={profile.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone *</label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Birthday *</label>
              <input
                type="text"
                name="birthday"
                value={profile.birthday}
                onChange={handleChange}
                placeholder="e.g., April 18"
                required
              />
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio *</label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="5"
              required
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="form-section">
          <h3 className="section-title">Social Links</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>GitHub</label>
              <input
                type="url"
                name="social.github"
                value={profile.social.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
              />
            </div>

            <div className="form-group">
              <label>LinkedIn</label>
              <input
                type="url"
                name="social.linkedin"
                value={profile.social.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="form-group">
              <label>Twitter</label>
              <input
                type="url"
                name="social.twitter"
                value={profile.social.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="form-group">
              <label>Instagram</label>
              <input
                type="url"
                name="social.instagram"
                value={profile.social.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default ProfileManagement;