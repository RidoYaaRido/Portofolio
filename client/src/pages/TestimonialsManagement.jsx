import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api from '../services/api';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    testimonial: '',
    rating: 5,
    featured: false,
    avatar: null
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/testimonials');
      setTestimonials(response.data);
    } catch (error) {
      toast.error('Failed to fetch testimonials');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      });

      if (editingTestimonial) {
        await api.put(`/testimonials/${editingTestimonial._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Testimonial updated successfully');
      } else {
        await api.post('/testimonials', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Testimonial created successfully');
      }

      fetchTestimonials();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      position: testimonial.position,
      testimonial: testimonial.testimonial,
      rating: testimonial.rating,
      featured: testimonial.featured,
      avatar: null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      await api.delete(`/testimonials/${id}`);
      toast.success('Testimonial deleted successfully');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTestimonial(null);
    setFormData({
      name: '',
      position: '',
      testimonial: '',
      rating: 5,
      featured: false,
      avatar: null
    });
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Testimonials Management</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <FiPlus /> Add Testimonial
        </button>
      </div>

      <div className="testimonials-list">
        {testimonials.map(testimonial => (
          <div key={testimonial._id} className="testimonial-card">
            <img src={`http://localhost:5000${testimonial.avatar}`} alt={testimonial.name} />
            <div className="testimonial-content">
              <h3>{testimonial.name}</h3>
              <p className="position">{testimonial.position}</p>
              <p className="testimonial-text">{testimonial.testimonial}</p>
              <div className="testimonial-actions">
                <button onClick={() => handleEdit(testimonial)} className="btn-edit">
                  <FiEdit2 /> Edit
                </button>
                <button onClick={() => handleDelete(testimonial._id)} className="btn-delete">
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}</h2>
              <button onClick={closeModal} className="btn-close"><FiX /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Name *</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Position *</label>
                <input type="text" name="position" value={formData.position} onChange={handleInputChange} required />
              </div>

              <div className="form-group">
                <label>Testimonial *</label>
                <textarea name="testimonial" value={formData.testimonial} onChange={handleInputChange} rows="4" required />
              </div>

              <div className="form-group">
                <label>Rating *</label>
                <select name="rating" value={formData.rating} onChange={handleInputChange} required>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>

              <div className="form-group">
                <label>Avatar {!editingTestimonial && '*'}</label>
                <input type="file" onChange={handleFileChange} accept="image/*" required={!editingTestimonial} />
              </div>

              <div className="form-group-checkbox">
                <input type="checkbox" id="featured" name="featured" checked={formData.featured} onChange={handleInputChange} />
                <label htmlFor="featured">Featured</label>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManagement;
