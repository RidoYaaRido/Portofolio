const ResumeSection = () => {
  const education = [
    {
      id: 1,
      degree: 'Bachelor of Computer Science',
      institution: 'University of Technology',
      period: '2016 - 2020',
      description: 'Focused on software engineering, data structures, and web development. Graduated with honors.'
    },
    {
      id: 2,
      degree: 'Full Stack Web Development Bootcamp',
      institution: 'Tech Academy',
      period: '2020',
      description: 'Intensive program covering modern web technologies including React, Node.js, and MongoDB.'
    }
  ];

  const experience = [
    {
      id: 1,
      position: 'Senior Full Stack Developer',
      company: 'Tech Innovations Inc.',
      period: '2022 - Present',
      description: 'Leading development of enterprise web applications using React, Node.js, and AWS. Mentoring junior developers and implementing best practices.'
    },
    {
      id: 2,
      position: 'Full Stack Developer',
      company: 'Digital Solutions Ltd.',
      period: '2020 - 2022',
      description: 'Developed and maintained multiple client projects using MERN stack. Collaborated with design team to create responsive and user-friendly interfaces.'
    },
    {
      id: 3,
      position: 'Junior Web Developer',
      company: 'StartUp Hub',
      period: '2019 - 2020',
      description: 'Built responsive websites and landing pages. Gained experience in front-end technologies and version control systems.'
    }
  ];

  const certifications = [
    'AWS Certified Developer Associate',
    'MongoDB Certified Developer',
    'React Professional Certification',
    'Scrum Master Certified (SMC)'
  ];

  return (
    <div className="resume-container">
      {/* Education Section */}
      <section className="content-section">
        <h2 className="section-title">Education</h2>
        <div className="timeline">
          {education.map(edu => (
            <div key={edu.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-period">{edu.period}</span>
                <h3 className="timeline-title">{edu.degree}</h3>
                <h4 className="timeline-subtitle">{edu.institution}</h4>
                <p className="timeline-description">{edu.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience Section */}
      <section className="content-section">
        <h2 className="section-title">Experience</h2>
        <div className="timeline">
          {experience.map(exp => (
            <div key={exp.id} className="timeline-item">
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <span className="timeline-period">{exp.period}</span>
                <h3 className="timeline-title">{exp.position}</h3>
                <h4 className="timeline-subtitle">{exp.company}</h4>
                <p className="timeline-description">{exp.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications Section */}
      <section className="content-section">
        <h2 className="section-title">Certifications</h2>
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