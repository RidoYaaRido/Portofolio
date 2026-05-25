import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { getBaseUrl } from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { translateTextApi, parseTranslated, translateText } from '../../utils/translationHelper';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({
    title_id: '',
    title_en: '',
    category_id: '',
    category_en: '',
    excerpt_id: '',
    excerpt_en: '',
    content_id: '',
    content_en: '',
    readTime: '5 min read',
    published: false
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      setBlogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    }
  };

  const handleTranslate = async (field, sourceLang) => {
    let sourceText = '';
    let targetLang = sourceLang === 'id' ? 'en' : 'id';

    if (field === 'title') {
      sourceText = sourceLang === 'id' ? formData.title_id : formData.title_en;
    } else if (field === 'category') {
      sourceText = sourceLang === 'id' ? formData.category_id : formData.category_en;
    } else if (field === 'excerpt') {
      sourceText = sourceLang === 'id' ? formData.excerpt_id : formData.excerpt_en;
    } else if (field === 'content') {
      sourceText = sourceLang === 'id' ? formData.content_id : formData.content_en;
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
    
    // Localized fields as JSON strings
    data.append('title', JSON.stringify({ id: formData.title_id, en: formData.title_en }));
    data.append('category', JSON.stringify({ id: formData.category_id, en: formData.category_en }));
    data.append('excerpt', JSON.stringify({ id: formData.excerpt_id, en: formData.excerpt_en }));
    data.append('content', JSON.stringify({ id: formData.content_id, en: formData.content_en }));
    
    // Standard fields
    data.append('readTime', formData.readTime);
    data.append('published', formData.published);
    
    if (imageFile) data.append('image', imageFile);

    try {
      if (editingBlog) {
        await api.put(`/blogs/${editingBlog._id}`, data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Blog updated!');
      } else {
        await api.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' }});
        toast.success('Blog created!');
      }
      fetchBlogs();
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this blog?')) {
      try {
        await api.delete(`/blogs/${id}`);
        toast.success('Blog deleted!');
        fetchBlogs();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (blog = null) => {
    setEditingBlog(blog);
    if (blog) {
      const titleObj = parseTranslated(blog.title);
      const categoryObj = parseTranslated(blog.category);
      const excerptObj = parseTranslated(blog.excerpt);
      const contentObj = parseTranslated(blog.content);

      setFormData({
        title_id: titleObj.id,
        title_en: titleObj.en,
        category_id: categoryObj.id,
        category_en: categoryObj.en,
        excerpt_id: excerptObj.id,
        excerpt_en: excerptObj.en,
        content_id: contentObj.id,
        content_en: contentObj.en,
        readTime: blog.readTime || '5 min read',
        published: blog.published || false
      });
    } else {
      setFormData({
        title_id: '',
        title_en: '',
        category_id: '',
        category_en: '',
        excerpt_id: '',
        excerpt_en: '',
        content_id: '',
        content_en: '',
        readTime: '5 min read',
        published: false
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingBlog(null); };

  return (
    <div className="management-container">
      <div className="management-header">
        <button className="add-btn" onClick={() => openModal()}><FiPlus /> Add Blog</button>
      </div>

      <div className="items-grid">
        {blogs.map(blog => (
          <div key={blog._id} className="item-card">
            <div className="item-image">
              <img src={blog.image.startsWith('http') ? blog.image : `${getBaseUrl()}${blog.image}`} alt={translateText(blog.title, 'id')} />
            </div>
            <div className="item-content">
              <h3>{translateText(blog.title, 'id')}</h3>
              <span className="item-category">{translateText(blog.category, 'id')}</span>
              <p>{translateText(blog.excerpt, 'id')}</p>
              <div className="item-actions">
                <button onClick={() => openModal(blog)} className="edit-btn"><FiEdit /> Edit</button>
                <button onClick={() => handleDelete(blog._id)} className="delete-btn"><FiTrash2 /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editingBlog ? 'Edit Blog' : 'Add Blog'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Bilingual Title */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Title (ID) *</label>
                  <input 
                    type="text" 
                    value={formData.title_id} 
                    onChange={(e) => setFormData({...formData, title_id: e.target.value})} 
                    placeholder="e.g., Memulai dengan React Hooks"
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
                  <label>Title (EN) *</label>
                  <input 
                    type="text" 
                    value={formData.title_en} 
                    onChange={(e) => setFormData({...formData, title_en: e.target.value})} 
                    placeholder="e.g., Getting Started with React Hooks"
                    required 
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

              {/* Bilingual Excerpt */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Excerpt (ID) *</label>
                  <textarea 
                    value={formData.excerpt_id} 
                    onChange={(e) => setFormData({...formData, excerpt_id: e.target.value})} 
                    rows="2" 
                    placeholder="Kutipan singkat artikel..."
                    required 
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('excerpt', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Excerpt (EN) *</label>
                  <textarea 
                    value={formData.excerpt_en} 
                    onChange={(e) => setFormData({...formData, excerpt_en: e.target.value})} 
                    rows="2" 
                    placeholder="Brief post summary..."
                    required 
                  />
                </div>
              </div>

              {/* Bilingual Content */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Content (ID) *</label>
                  <textarea 
                    value={formData.content_id} 
                    onChange={(e) => setFormData({...formData, content_id: e.target.value})} 
                    rows="6" 
                    placeholder="Isi konten artikel blog..."
                    required 
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('content', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Content (EN) *</label>
                  <textarea 
                    value={formData.content_en} 
                    onChange={(e) => setFormData({...formData, content_en: e.target.value})} 
                    rows="6" 
                    placeholder="Full blog post content..."
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Image *</label>
                <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} required={!editingBlog} />
              </div>

              <div className="form-group">
                <label>Read Time</label>
                <input type="text" value={formData.readTime} onChange={(e) => setFormData({...formData, readTime: e.target.value})} placeholder="5 min read" />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={formData.published} onChange={(e) => setFormData({...formData, published: e.target.checked})} />
                  Published
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">{editingBlog ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;