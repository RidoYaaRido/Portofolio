import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const EducationManagement = () => {
  const [education, setEducation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({ degree: '', institution: '', period: '', description: '', order: 0 });

  useEffect(() => { fetchEducation(); }, []);

  const fetchEducation = async () => {
    try {
      const response = await api.get('/education');
      setEducation(response.data);
    } catch (error) {
      toast.error('Failed to fetch education');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/education/${editing._id}`, formData);
        toast.success('Education updated!');
      } else {
        await api.post('/education', formData);
        toast.success('Education created!');
      }
      fetchEducation();
      closeModal();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this education?')) {
      try {
        await api.delete(`/education/${id}`);
        toast.success('Education deleted!');
        fetchEducation();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const openModal = (item = null) => {
    setEditing(item);
    setFormData(item || { degree: '', institution: '', period: '', description: '', order: 0 });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); };

  return (
    <div className="management-container">
      <div className="management-header">
        <button className="add-btn" onClick={() => openModal()}><FiPlus /> Add Education</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Degree</th>
            <th>Institution</th>
            <th>Period</th>
            <th>Order</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {education.map(item => (
            <tr key={item._id}>
              <td>{item.degree}</td>
              <td>{item.institution}</td>
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
            <h2>{editing ? 'Edit Education' : 'Add Education'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Degree *</label>
                <input type="text" value={formData.degree} onChange={(e) => setFormData({...formData, degree: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Institution *</label>
                <input type="text" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Period *</label>
                <input type="text" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="2016 - 2020" required />
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

export default EducationManagement;