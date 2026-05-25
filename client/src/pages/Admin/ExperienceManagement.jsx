import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { translateTextApi, parseTranslated, translateText } from '../../utils/translationHelper';

const ExperienceManagement = () => {
  const [experience, setExperience] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState({
    position_id: '',
    position_en: '',
    company: '',
    period: '',
    description_id: '',
    description_en: '',
    order: 0
  });

  useEffect(() => { fetchExperience(); }, []);

  const fetchExperience = async () => {
    try {
      const response = await api.get('/experience');
      setExperience(response.data);
    } catch (error) {
      toast.error('Failed to fetch experience');
    }
  };

  const handleTranslate = async (field, sourceLang) => {
    let sourceText = '';
    let targetLang = sourceLang === 'id' ? 'en' : 'id';

    if (field === 'position') {
      sourceText = sourceLang === 'id' ? formData.position_id : formData.position_en;
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
      position: JSON.stringify({ id: formData.position_id, en: formData.position_en }),
      description: JSON.stringify({ id: formData.description_id, en: formData.description_en }),
      company: formData.company,
      period: formData.period,
      order: formData.order
    };

    try {
      if (editing) {
        await api.put(`/experience/${editing._id}`, payload);
        toast.success('Experience updated!');
      } else {
        await api.post('/experience', payload);
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
    if (item) {
      const positionObj = parseTranslated(item.position);
      const descObj = parseTranslated(item.description);
      
      setFormData({
        position_id: positionObj.id,
        position_en: positionObj.en,
        company: item.company || '',
        period: item.period || '',
        description_id: descObj.id,
        description_en: descObj.en,
        order: item.order || 0
      });
    } else {
      setFormData({
        position_id: '',
        position_en: '',
        company: '',
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
              <td>{translateText(item.position, 'id')}</td>
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
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Experience' : 'Add Experience'}</h2>
            <form onSubmit={handleSubmit}>
              
              {/* Bilingual Position */}
              <div className="dual-lang-group">
                <div className="form-group lang-field">
                  <label>Position (ID) *</label>
                  <input 
                    type="text" 
                    value={formData.position_id} 
                    onChange={(e) => setFormData({...formData, position_id: e.target.value})} 
                    placeholder="e.g., Pengembang Full Stack Senior"
                    required 
                  />
                </div>
                <button
                  type="button"
                  className="translate-action-btn"
                  onClick={() => handleTranslate('position', 'id')}
                >
                  Translate ID → EN
                </button>
                <div className="form-group lang-field">
                  <label>Position (EN) *</label>
                  <input 
                    type="text" 
                    value={formData.position_en} 
                    onChange={(e) => setFormData({...formData, position_en: e.target.value})} 
                    placeholder="e.g., Senior Full Stack Developer"
                    required 
                  />
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Company *</label>
                  <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Period *</label>
                  <input type="text" value={formData.period} onChange={(e) => setFormData({...formData, period: e.target.value})} placeholder="2022 - Present" required />
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
                    placeholder="Deskripsi tugas dan tanggung jawab..."
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
                    placeholder="Responsibilities, stack used, achievements..."
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

export default ExperienceManagement;