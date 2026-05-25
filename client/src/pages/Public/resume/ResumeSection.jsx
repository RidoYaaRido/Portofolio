import { translateText, dictionary } from '../../../utils/translationHelper';

const ResumeSection = ({ education = [], experience = [], lang = 'id' }) => {
  const certifications = [
    'AWS Certified Developer Associate',
    'MongoDB Certified Developer',
    'React Professional Certification',
    'Scrum Master Certified (SMC)'
  ];

  const educationData = education;
  const experienceData = experience;

  return (
    <div className="resume-container">
      {/* Education Section */}
      <section className="content-section">
        <h2 className="section-title">{dictionary[lang].education}</h2>
        <div className="timeline">
          {educationData.map((edu) => (
            <div key={edu._id || edu.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-period">{edu.period}</span>
                <h3 className="timeline-title">{translateText(edu.degree, lang)}</h3>
                <h4 className="timeline-subtitle">{translateText(edu.institution, lang)}</h4>
                <p className="timeline-description">{translateText(edu.description, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="content-section">
        <h2 className="section-title">{dictionary[lang].experience}</h2>
        <div className="timeline">
          {experienceData.map((exp) => (
            <div key={exp._id || exp.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-period">{exp.period}</span>
                <h3 className="timeline-title">{translateText(exp.position, lang)}</h3>
                <h4 className="timeline-subtitle">{translateText(exp.company, lang)}</h4>
                <p className="timeline-description">{translateText(exp.description, lang)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="content-section">
        <h2 className="section-title">{dictionary[lang].certifications}</h2>
        <div className="certifications-grid">
          {certifications.map((cert, index) => (
            <div key={index} className="certification-badge">
              <span className="badge-icon">🏆</span>
              <span className="badge-text">{cert}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ResumeSection;