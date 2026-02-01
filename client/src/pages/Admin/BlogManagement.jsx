import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [formData, setFormData] = useState({ title: '', category: '', excerpt: '', content: '', readTime: '', published: false });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => { fetchBlogs(); }, []);

  const fetchBlogs = async () => {
    try {
      const response = await api.get('/blogs');
      setBlogs(response.data);
    } catch (error) {
      toast.error('Failed to fetch blogs');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
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
    setFormData(blog || { title: '', category: '', excerpt: '', content: '', readTime: '5 min read', published: false });
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
              <img src={blog.image.startsWith('http') ? blog.image : `http://localhost:5000${blog.image}`} alt={blog.title} />
            </div>
            <div className="item-content">
              <h3>{blog.title}</h3>
              <span className="item-category">{blog.category}</span>
              <p>{blog.excerpt}</p>
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
              <div className="form-group">
                <label>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Excerpt *</label>
                <textarea value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} rows="2" required />
              </div>
              <div className="form-group">
                <label>Content *</label>
                <textarea value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} rows="6" required />
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