import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus, FiUpload, FiX } from 'react-icons/fi';

const SkillManagement = () => {
  const [skills, setSkills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    level: 50,
    icon: '⚡',
    iconType: 'emoji',
    color: '#ffa500',
    category: 'other',
    description: ''
  });

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/skills');
      setSkills(response.data);
    } catch (error) {
      toast.error('Failed to fetch skills');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData({ ...formData, iconType: 'image' });
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setFormData({ ...formData, iconType: 'emoji' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });

      // Append file if selected
      if (selectedFile) {
        submitData.append('iconFile', selectedFile);
      }

      if (editingSkill) {
        await api.put(`/skills/${editingSkill._id}`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Skill updated!');
      } else {
        await api.post('/skills', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Skill created!');
      }
      
      fetchSkills();
      closeModal();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this skill?')) {
      try {
        await api.delete(`/skills/${id}`);
        toast.success('Skill deleted!');
        fetchSkills();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (skill = null) => {
    setEditingSkill(skill);
    if (skill) {
      setFormData({
        name: skill.name,
        level: skill.level,
        icon: skill.icon || '⚡',
        iconType: skill.iconType || 'emoji',
        color: skill.color,
        category: skill.category,
        description: skill.description || ''
      });
      
      if (skill.iconType === 'image' && skill.iconUrl) {
        setImagePreview(`http://localhost:5000${skill.iconUrl}`);
      }
    } else {
      setFormData({
        name: '',
        level: 50,
        icon: '⚡',
        iconType: 'emoji',
        color: '#ffa500',
        category: 'other',
        description: ''
      });
      setImagePreview(null);
      setSelectedFile(null);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingSkill(null);
    setImagePreview(null);
    setSelectedFile(null);
  };

  const renderSkillIcon = (skill) => {
    if (skill.iconType === 'image' && skill.iconUrl) {
      return (
        <img 
          src={`http://localhost:5000${skill.iconUrl}`} 
          alt={skill.name}
          style={{ width: '30px', height: '30px', objectFit: 'contain' }}
        />
      );
    }
    return <span style={{ fontSize: '24px' }}>{skill.icon || '⚡'}</span>;
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <button className="add-btn" onClick={() => openModal()}>
          <FiPlus /> Add Skill
        </button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Icon</th>
            <th>Name</th>
            <th>Level</th>
            <th>Category</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {skills.map(skill => (
            <tr key={skill._id}>
              <td>{renderSkillIcon(skill)}</td>
              <td>{skill.name}</td>
              <td>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${skill.level}%`,
                      backgroundColor: skill.color
                    }}
                  ></div>
                  <span>{skill.level}%</span>
                </div>
              </td>
              <td><span className="badge">{skill.category}</span></td>
              <td>
                <span className="badge" style={{ 
                  backgroundColor: skill.iconType === 'image' ? '#4CAF50' : '#2196F3' 
                }}>
                  {skill.iconType}
                </span>
              </td>
              <td>
                <button onClick={() => openModal(skill)} className="icon-btn">
                  <FiEdit />
                </button>
                <button onClick={() => handleDelete(skill._id)} className="icon-btn delete">
                  <FiTrash2 />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingSkill ? 'Edit Skill' : 'Add Skill'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>Level (0-100) *</label>
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  value={formData.level} 
                  onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})} 
                  required 
                />
                <div className="level-preview" style={{ marginTop: '10px' }}>
                  <div style={{
                    width: '100%',
                    height: '20px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '10px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${formData.level}%`,
                      height: '100%',
                      backgroundColor: formData.color,
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Icon Type *</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="iconType"
                      value="emoji"
                      checked={formData.iconType === 'emoji'}
                      onChange={() => {
                        setFormData({...formData, iconType: 'emoji'});
                        clearImage();
                      }}
                      style={{ marginRight: '5px' }}
                    />
                    Emoji
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="iconType"
                      value="image"
                      checked={formData.iconType === 'image'}
                      onChange={() => setFormData({...formData, iconType: 'image'})}
                      style={{ marginRight: '5px' }}
                    />
                    Image
                  </label>
                </div>

                {formData.iconType === 'emoji' ? (
                  <input 
                    type="text" 
                    value={formData.icon} 
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    placeholder="Enter emoji (e.g., ⚡)"
                  />
                ) : (
                  <div>
                    <div 
                      style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={() => document.getElementById('iconFileInput').click()}
                    >
                      {imagePreview ? (
                        <div style={{ position: 'relative' }}>
                          <img 
                            src={imagePreview} 
                            alt="Preview" 
                            style={{ maxWidth: '100px', maxHeight: '100px' }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              clearImage();
                            }}
                            style={{
                              position: 'absolute',
                              top: '-10px',
                              right: '-10px',
                              background: '#ff4444',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '25px',
                              height: '25px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <FiX />
                          </button>
                        </div>
                      ) : (
                        <div>
                          <FiUpload size={40} style={{ color: '#999' }} />
                          <p style={{ margin: '10px 0 0 0', color: '#999' }}>
                            Click to upload image
                          </p>
                          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                            Max 5MB (PNG, JPG, SVG)
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="iconFileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Color</label>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input 
                    type="color" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    style={{ width: '60px', height: '40px' }}
                  />
                  <input 
                    type="text" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="#ffa500"
                    style={{ flex: 1 }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  required
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="database">Database</option>
                  <option value="tools">Tools</option>
                  <option value="devops">DevOps</option>
                  <option value="design">Design</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                  placeholder="Brief description of your skill level or experience..."
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingSkill ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillManagement;