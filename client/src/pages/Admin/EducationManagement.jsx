import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { translateTextApi, parseTranslated, translateText } from '../../utils/translationHelper';

const EducationManagement = () => {
  const [education, setEducation] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    degree_id: '',
    degree_en: '',
    institution: '',
    period: '',
    description_id: '',
    description_en: '',
    order: 0
  });

  useEffect(() => { fetchEducation(); }, []);

  const fetchEducation = async () => {
    try {
      const response = await api.get('/education');
      setEducation(response.data);
    } catch (error) {
      toast.error('Failed to fetch education');
    }
  };

  const handleTranslate = async (field, sourceLang) => {
    let sourceText = '';
    let targetLang = sourceLang === 'id' ? 'en' : 'id';

    if (field === 'degree') {
      sourceText = sourceLang === 'id' ? formData.degree_id : formData.degree_en;
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
    
    const payload = {
      degree: JSON.stringify({ id: formData.degree_id, en: formData.degree_en }),
      description: JSON.stringify({ id: formData.description_id, en: formData.description_en }),
      institution: formData.institution,
      period: formData.period,
      order: formData.order
    };

    try {
      if (editing) {
        await api.put(`/education/${editing._id}`, payload);
        toast.success('Education updated!');
      } else {
        await api.post('/education', payload);
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
    if (item) {
      const degreeObj = parseTranslated(item.degree);
      const descObj = parseTranslated(item.description);
      
      setFormData({
        degree_id: degreeObj.id,
        degree_en: degreeObj.en,
        institution: item.institution || '',
        period: item.period || '',
        description_id: descObj.id,
        description_en: descObj.en,
        order: item.order || 0
      });
    } else {
      setFormData({
        degree_id: '',
        degree_en: '',
        institution: '',
        period: '',
        description_id: '',
        description_en: '',
        order: 0
      });
    }
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
              <td>{translateText(item.degree, 'id')}</td>
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
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Education' : 'Add Education'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Bilingual Degree */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Degree (ID) *</label>
                  <input 
                    type="text" 
                    value={formData.degree_id} 
                    onChange={(e) => setFormData({...formData, degree_id: e.target.value})} 
                    placeholder="e.g., Sarjana Ilmu Komputer"
                    required 
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('degree', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Degree (EN) *</label>
                  <input 
                    type="text" 
                    value={formData.degree_en} 
                    onChange={(e) => setFormData({...formData, degree_en: e.target.value})} 
                    placeholder="e.g., Bachelor of Computer Science"
                    required 
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Institution *</label>
                  <input type="text" value={formData.institution} onChange={(e) => setFormData({...formData, institution: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Period *</label>
                  <input type="text" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="2016 - 2020" required />
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
                    placeholder="Deskripsi studi atau pencapaian..."
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
                    placeholder="Study details, topics covered, achievements..."
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Order</label>
                <input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
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