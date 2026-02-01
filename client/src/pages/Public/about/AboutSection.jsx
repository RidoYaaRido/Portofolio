const AboutSection = ({ profile, services }) => {
  return (
    <>
      <section className="content-section">
        <div className="about-content">
          <p className="about-text">
            {profile?.bio || `I am a Web Developer who also has deep expertise in Web Design, Mobile App Development, and Software QA Testing. With a strong technical background and a keen attention to detail, I am committed to creating digital solutions that are not only aesthetically pleasing and user-friendly but also robust in terms of performance and functionality.`}
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