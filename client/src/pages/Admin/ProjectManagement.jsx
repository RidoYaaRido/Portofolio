import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { getBaseUrl } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { translateTextApi, parseTranslated, translateText } from '../../utils/translationHelper';

const ProjectManagement = () => {
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    category_id: '',
    category_en: '',
    description_id: '',
    description_en: '',
    technologies: '',
    demoUrl: '',
    githubUrl: '',
    featured: false
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
      console.error('Fetch projects error:', error);
    }
  };

  const handleTranslate = async (field, sourceLang) => {
    let sourceText = '';
    let targetLang = sourceLang === 'id' ? 'en' : 'id';

    if (field === 'title') {
      sourceText = sourceLang === 'id' ? formData.title_id : formData.title_en;
    } else if (field === 'category') {
      sourceText = sourceLang === 'id' ? formData.category_id : formData.category_en;
    } else if (field === 'description') {
      sourceText = sourceLang === 'id' ? formData.description_id : formData.description_en;
    }

    if (!sourceText || sourceText.trim() === '') {
      toast.warning('Please enter source text first');
      return;
    }

    try {
      const toastId = toast.loading('Translating...');
      const translated = await translateTextApi(sourceText, targetLang);
      toast.dismiss(toastId);

      const targetField = `${field}_${targetLang}`;
      setFormData(prev => ({
        ...prev,
        [targetField]: translated
      }));
      toast.success('Translated successfully!');
    } catch (error) {
      toast.error('Translation failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = new FormData();
    
    // Localized fields as JSON
    data.append('title', JSON.stringify({ id: formData.title_id, en: formData.title_en }));
    data.append('category', JSON.stringify({ id: formData.category_id, en: formData.category_en }));
    data.append('description', JSON.stringify({ id: formData.description_id, en: formData.description_en }));
    
    // Standard fields
    data.append('technologies', JSON.stringify(formData.technologies.split(',').map(t => t.trim())));
    data.append('demoUrl', formData.demoUrl);
    data.append('githubUrl', formData.githubUrl);
    data.append('featured', formData.featured);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Project created successfully!');
      }
      
      fetchProjects();
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted successfully!');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
        console.error('Delete error:', error);
      }
    }
  };

  const openModal = (project = null) => {
    if (project) {
      setEditingProject(project);
      
      const titleObj = parseTranslated(project.title);
      const categoryObj = parseTranslated(project.category);
      const descObj = parseTranslated(project.description);

      setFormData({
        title_id: titleObj.id,
        title_en: titleObj.en,
        category_id: categoryObj.id,
        category_en: categoryObj.en,
        description_id: descObj.id,
        description_en: descObj.en,
        technologies: Array.isArray(project.technologies) 
          ? project.technologies.join(', ') 
          : project.technologies || '',
        demoUrl: project.demoUrl || '',
        githubUrl: project.githubUrl || '',
        featured: project.featured || false
      });
    } else {
      setEditingProject(null);
      setFormData({
        title_id: '',
        title_en: '',
        category_id: '',
        category_en: '',
        description_id: '',
        description_en: '',
        technologies: '',
        demoUrl: '',
        githubUrl: '',
        featured: false
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setImageFile(null);
  };

  // Helper untuk mendapatkan URL gambar - FIXED untuk Vite
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${getBaseUrl()}${image}`;
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <button className="add-btn" onClick={() => openModal()}>
          <FiPlus /> Add New Project
        </button>
      </div>

      <div className="items-grid">
        {projects.length === 0 ? (
          <div className="empty-state">
            <p>No projects yet. Click "Add New Project" to create one.</p>
          </div>
        ) : (
          projects.map(project => (
            <div key={project._id} className="item-card">
              <div className="item-image">
                <img 
                  src={getImageUrl(project.image)}
                  alt={translateText(project.title, 'id')}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="item-content">
                <h3>{translateText(project.title, 'id')}</h3>
                <span className="item-category">{translateText(project.category, 'id')}</span>
                <p>{translateText(project.description, 'id')}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-tech-preview">
                    {project.technologies.slice(0, 3).map((tech, i) => (
                      <span key={i} className="tech-badge">{tech}</span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="tech-badge">+{project.technologies.length - 3}</span>
                    )}
                  </div>
                )}
                <div className="item-actions">
                  <button onClick={() => openModal(project)} className="edit-btn">
                    <FiEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(project._id)} className="delete-btn">
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProject ? 'Edit Project' : 'Add New Project'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Bilingual Title */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Title (ID) *</label>
                  <input
                    type="text"
                    value={formData.title_id}
                    onChange={(e) => setFormData({...formData, title_id: e.target.value})}
                    required
                    placeholder="e.g., Platform E-Commerce"
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
                  <label>Title (EN) *</label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})}
                    required
                    placeholder="e.g., E-Commerce Platform"
                  />
                </div>
              </div>

              {/* Bilingual Category */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Category (ID) *</label>
                  <input
                    type="text"
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    placeholder="e.g., Pengembangan Web"
                    required
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('category', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Category (EN) *</label>
                  <input
                    type="text"
                    value={formData.category_en}
                    onChange={(e) => setFormData({...formData, category_en: e.target.value})}
                    placeholder="e.g., Web Development"
                    required
                  />
                </div>
              </div>

              {/* Bilingual Description */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Description (ID) *</label>
                  <textarea
                    value={formData.description_id}
                    onChange={(e) => setFormData({...formData, description_id: e.target.value})}
                    rows="3"
                    placeholder="Deskripsi singkat proyek..."
                    required
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('description', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Description (EN) *</label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({...formData, description_en: e.target.value})}
                    rows="3"
                    placeholder="Brief description of the project..."
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Technologies (comma-separated) *</label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({...formData, technologies: e.target.value})}
                  placeholder="React, Node.js, MongoDB"
                  required
                />
                <small>Separate technologies with commas</small>
              </div>

              <div className="form-group">
                <label>Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  required={!editingProject}
                />
                {editingProject && (
                  <small>Leave empty to keep current image</small>
                )}
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Demo URL</label>
                  <input
                    type="url"
                    value={formData.demoUrl}
                    onChange={(e) => setFormData({...formData, demoUrl: e.target.value})}
                    placeholder="https://demo-site.com"
                  />
                </div>

                <div className="form-group">
                  <label>GitHub URL</label>
                  <input
                    type="url"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                  />
                  Featured Project
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;