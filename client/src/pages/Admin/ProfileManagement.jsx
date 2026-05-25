import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { getBaseUrl } from '../../services/api';
import { translateTextApi, parseTranslated } from '../../utils/translationHelper';

const ProfileManagement = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    birthday: '',
    social: {
      github: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    }
  });

  const [title_id, setTitleId] = useState('');
  const [title_en, setTitleEn] = useState('');
  const [location_id, setLocationId] = useState('');
  const [location_en, setLocationEn] = useState('');
  const [bio_id, setBioId] = useState('');
  const [bio_en, setBioEn] = useState('');

  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profile');
      const data = response.data;
      setProfile(data);
      
      const titleObj = parseTranslated(data.title);
      setTitleId(titleObj.id);
      setTitleEn(titleObj.en);
      
      const locationObj = parseTranslated(data.location);
      setLocationId(locationObj.id);
      setLocationEn(locationObj.en);
      
      const bioObj = parseTranslated(data.bio);
      setBioId(bioObj.id);
      setBioEn(bioObj.en);

      if (data.avatar) {
        // If the avatar is already a full URL (Supabase), use it directly
        setPreviewUrl(data.avatar.startsWith('http') ? data.avatar : `${getBaseUrl()}${data.avatar}`);
      }
    } catch (error) {
      toast.error('Failed to fetch profile');
    }
  };

  const handleTranslate = async (field, sourceLang) => {
    let sourceText = '';
    let targetLang = sourceLang === 'id' ? 'en' : 'id';

    if (field === 'title') {
      sourceText = sourceLang === 'id' ? title_id : title_en;
    } else if (field === 'location') {
      sourceText = sourceLang === 'id' ? location_id : location_en;
    } else if (field === 'bio') {
      sourceText = sourceLang === 'id' ? bio_id : bio_en;
    }

    if (!sourceText || sourceText.trim() === '') {
      toast.warning('Please enter source text first');
      return;
    }

    try {
      const toastId = toast.loading('Translating...');
      const translated = await translateTextApi(sourceText, targetLang);
      toast.dismiss(toastId);

      if (field === 'title') {
        if (targetLang === 'en') setTitleEn(translated);
        else setTitleId(translated);
      } else if (field === 'location') {
        if (targetLang === 'en') setLocationEn(translated);
        else setLocationId(translated);
      } else if (field === 'bio') {
        if (targetLang === 'en') setBioEn(translated);
        else setBioId(translated);
      }
      toast.success('Translated successfully!');
    } catch (error) {
      toast.error('Translation failed');
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
      formData.append('name', profile.name);
      formData.append('email', profile.email);
      formData.append('phone', profile.phone);
      formData.append('birthday', profile.birthday);
      formData.append('social', JSON.stringify(profile.social));

      // Localized fields as JSON
      formData.append('title', JSON.stringify({ id: title_id, en: title_en }));
      formData.append('location', JSON.stringify({ id: location_id, en: location_en }));
      formData.append('bio', JSON.stringify({ id: bio_id, en: bio_en }));

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
          </div>

          {/* Bilingual Job Title */}
          <div className="dual-lang-group">
            <div className="form-group lang-field">
              <label>Job Title (ID) *</label>
              <input
                type="text"
                value={title_id}
                onChange={(e) => setTitleId(e.target.value)}
                placeholder="e.g., Pengembang Web"
                required
              />
            </div>
            <button
              type="button"
              className="translate-action-btn"
              onClick={() => handleTranslate('title', 'id')}
            >
              Translate ID → EN
            </button>
            <div className="form-group lang-field">
              <label>Job Title (EN) *</label>
              <input
                type="text"
                value={title_en}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g., Web Developer"
                required
              />
            </div>
          </div>

          {/* Bilingual Location */}
          <div className="dual-lang-group">
            <div className="form-group lang-field">
              <label>Location (ID) *</label>
              <input
                type="text"
                value={location_id}
                onChange={(e) => setLocationId(e.target.value)}
                placeholder="e.g., Bekasi, Jawa Barat"
                required
              />
            </div>
            <button
              type="button"
              className="translate-action-btn"
              onClick={() => handleTranslate('location', 'id')}
            >
              Translate ID → EN
            </button>
            <div className="form-group lang-field">
              <label>Location (EN) *</label>
              <input
                type="text"
                value={location_en}
                onChange={(e) => setLocationEn(e.target.value)}
                placeholder="e.g., Bekasi, West Java"
                required
              />
            </div>
          </div>

          {/* Bilingual Bio */}
          <div className="dual-lang-group">
            <div className="form-group lang-field">
              <label>Bio (ID) *</label>
              <textarea
                value={bio_id}
                onChange={(e) => setBioId(e.target.value)}
                rows="5"
                placeholder="Biografi singkat Anda..."
                required
              />
            </div>
            <button
              type="button"
              className="translate-action-btn"
              onClick={() => handleTranslate('bio', 'id')}
            >
              Translate ID → EN
            </button>
            <div className="form-group lang-field">
              <label>Bio (EN) *</label>
              <textarea
                value={bio_en}
                onChange={(e) => setBioEn(e.target.value)}
                rows="5"
                placeholder="Your short biography..."
                required
              />
            </div>
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