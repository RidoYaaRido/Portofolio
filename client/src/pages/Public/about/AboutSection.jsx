import { translateText, dictionary } from '../../../utils/translationHelper';

const AboutSection = ({ profile, services, lang = 'id' }) => {
  return (
    <>
      <section className="content-section">
        <div className="about-content">
          <p className="about-text">
            {profile ? translateText(profile.bio, lang) : ''}
          </p>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">{dictionary[lang].whatImDoing}</h2>
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