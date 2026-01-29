const AboutSection = ({ profile, services }) => {
  return (
    <>
      <section className="content-section">
        {/* <h2 className="section-title">About Me</h2> */}
        <div className="about-content">
          <p className="about-text">
            {profile?.bio || `I am a Web Developer who also has deep expertise in Web Design, Mobile App Development, and Software QA Testing. With a strong technical background and a keen attention to detail, I am committed to creating digital solutions that are not only aesthetically pleasing and user-friendly but also robust in terms of performance and functionality.`}
          </p>
          <p className="about-text">
            In every project, I combine a modern design approach with efficient and scalable development practices. I believe that technology should make life easier, not more confusing—that's why I always emphasize simplicity, user experience, application performance, and overall system quality.
          </p>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">What I'm Doing</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <div className="service-content">
                <h3 className="service-title">{service.title}</h3>
                <p className="service-description">{service.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default AboutSection;