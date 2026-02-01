import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import api from '@/services/api';

const ContactSection = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState(''); // '' | 'sending' | 'success' | 'error'

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');

    try {
      await api.post('/contact', formData);

      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });

      // Reset status back ke kosong setelah 4 detik
      setTimeout(() => setStatus(''), 4000);
    } catch (error) {
      console.error('Contact form error:', error);
      setStatus('error');

      // Reset status error setelah 5 detik supaya user bisa coba lagi
      setTimeout(() => setStatus(''), 5000);
    }
  };

  return (
    <section className="content-section">
      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-icon">
              <FiMail />
            </div>
            <div>
              <h4 className="contact-label">Email</h4>
              <a href={`mailto:${profile?.email || 'ridorifkihakim@gmail.com'}`} className="contact-value">
                {profile?.email || 'ridorifkihakim@gmail.com'}
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <FiPhone />
            </div>
            <div>
              <h4 className="contact-label">Phone</h4>
              <a href={`tel:${profile?.phone || '+62-XXX-XXXX-XXXX'}`} className="contact-value">
                {profile?.phone || '+62-XXX-XXXX-XXXX'}
              </a>
            </div>
          </div>

          <div className="contact-info-card">
            <div className="contact-icon">
              <FiMapPin />
            </div>
            <div>
              <h4 className="contact-label">Location</h4>
              <p className="contact-value">{profile?.location || 'Jakarta, Indonesia'}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={status === 'sending'}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              disabled={status === 'sending'}
              placeholder="Enter subject"
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message *</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              disabled={status === 'sending'}
              rows="6"
              placeholder="Write your message here..."
            ></textarea>
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={status === 'sending'}
          >
            {status === 'sending' ? (
              <>Sending...</>
            ) : status === 'success' ? (
              <>Sent Successfully! ✓</>
            ) : (
              <>
                <FiSend /> Send Message
              </>
            )}
          </button>

          {status === 'success' && (
            <div className="success-message">
              ✓ Your message has been sent successfully!
            </div>
          )}

          {status === 'error' && (
            <div className="success-message" style={{ 
              borderColor: '#ff4444', 
              backgroundColor: 'rgba(255, 68, 68, 0.1)', 
              color: '#ff6666' 
            }}>
              ✕ Failed to send message. Please try again later.
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default ContactSection;