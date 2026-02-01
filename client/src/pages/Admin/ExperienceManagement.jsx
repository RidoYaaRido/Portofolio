import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const ExperienceManagement = () => {
  const [experience, setExperience] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ position: '', company: '', period: '', description: '', order: 0 });

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    try {
      const response = await api.get('/experience');
      setExperience(response.data);
    } catch (error) {
      toast.error('Failed to fetch experience');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/experience/${editing._id}`, formData);
        toast.success('Experience updated!');
      } else {
        await api.post('/experience', formData);
        toast.success('Experience created!');
      }
      fetchExperience();
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this experience?')) {
      try {
        await api.delete(`/experience/${id}`);
        toast.success('Experience deleted!');
        fetchExperience();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item = null) => {
    setEditing(item);
    setFormData(item || { position: '', company: '', period: '', description: '', order: 0 });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  return (
    <div className="management-container">
      <div className="management-header">
        <button className="add-btn" onClick={() => openModal()}><FiPlus /> Add Experience</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Company</th>
            <th>Period</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {experience.map(item => (
            <tr key={item._id}>
              <td>{item.position}</td>
              <td>{item.company}</td>
              <td>{item.period}</td>
              <td>{item.order}</td>
              <td>
                <button onClick={() => openModal(item)} className="icon-btn"><FiEdit /></button>
                <button onClick={() => handleDelete(item._id)} className="icon-btn delete"><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Experience' : 'Add Experience'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Position *</label>
                <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Company *</label>
                <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Period *</label>
                <input type="text" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="2022 - Present" required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows="3" required />
              </div>
              <div className="form-group">
                <label>Order</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">Cancel</button>
                <button type="submit" className="submit-btn">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceManagement;