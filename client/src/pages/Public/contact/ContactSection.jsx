import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';

const ContactSection = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus('sending');
    
    // Simulate API call
    setTimeout(() => {
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      setTimeout(() => {
        setStatus('');
      }, 3000);
    }, 1500);
  };

  return (
    <section className="content-section">
      {/* <h2 className="section-title">Contact Me</h2> */}
      
      <div className="contact-container">
        {/* Contact Info Cards */}
        <div className="contact-info-grid">
          <div className="contact-info-card">
            <div className="contact-icon">
              <FiMail />
            </div>
            <div>
              <h4 className="contact-label">Email</h4>
              <a href={`mailto:${profile?.email || 'contact@example.com'}`} className="contact-value">
                {profile?.email || 'contact@example.com'}
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
        </form>
      </div>
    </section>
  );
};

export default ContactSection;