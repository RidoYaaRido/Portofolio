import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCalendar, FiMapPin, FiGithub, FiLinkedin, FiGlobe, FiChevronDown } from 'react-icons/fi';
// import api from './services/app';
import AboutSection from './about/AboutSection';
import ResumeSection from './resume/ResumeSection';
import PortfolioSection from './portofolio/PortfolioSection';
import BlogSection from './blog/BlogSection';
import ContactSection from './contact/ContactSection';
import SkillsSlider from './skill/SkillsSlider';
import '@/assets/css/Portfolio.css';
import avatar from "@/assets/avatar.png";

const Page = () => {
  const [profile, setProfile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeSection, setActiveSection] = useState('about');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Uncomment when API is ready
      // const [profileRes, projectsRes, skillsRes] = await Promise.all([
      //   api.get('/profile'),
      //   api.get('/projects'),
      //   api.get('/skills')
      // ]);
      // setProfile(profileRes.data);
      // setProjects(projectsRes.data);
      // setSkills(skillsRes.data);

      // Dummy data for now
      setProfile({
        name: 'Rido Rifki Hakim',
        title: 'Web Developer',
        email: 'ridorifkihakim@gmail.com',
        phone: '+62 858-8867-3602',
        birthday: 'April 18',
        location: 'Bekasi, Jawa Barat, Indonesia',
        avatar: '/placeholder-avatar.jpg',
        bio: 'I am a Web Developer who also has deep expertise in Web Design, Mobile App Development, and Software QA Testing. With a strong technical background and a keen attention to detail, I am committed to creating digital solutions that are not only aesthetically pleasing and user-friendly but also robust in terms of performance and functionality.',
        social: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
          twitter: 'https://twitter.com/johndoe'
        }
      });

      setSkills([
        { _id: 1, name: 'JavaScript', level: 95 },
        { _id: 2, name: 'React', level: 90 },
        { _id: 3, name: 'Node.js', level: 85 },
        { _id: 4, name: 'MongoDB', level: 80 },
        { _id: 5, name: 'TypeScript', level: 85 },
        { _id: 6, name: 'CSS/SCSS', level: 90 }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const services = [
    {
      icon: '🎨',
      title: 'Web Design',
      description: 'The most modern and high-quality design made at a professional level.'
    },
    {
      icon: '💻',
      title: 'Web Development',
      description: 'High-quality development of sites at the professional level.'
    },
    {
      icon: '📱',
      title: 'Mobile Apps',
      description: 'Professional development of applications for iOS and Android.'
    },
    {
      icon: '🔧',
      title: 'Software QA / Tester',
      description: 'Ensuring application quality through functional and usability testing.'
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'about':
        return (
          <>
            <AboutSection profile={profile} services={services} />

            {/* Skills Slider - Technologies & Tools */}
            <section className="content-section">
              <h2 className="section-title">Skills</h2>
              <SkillsSlider />
            </section>

            {/* Skills with Progress Bars - Removed since it's already in slider
            <section className="content-section">
              <div className="skills-grid">
                {skills.map(skill => (
                  <div key={skill._id} className="skill-item-modern">
                    <div className="skill-header">
                      <span className="skill-name">{skill.name}</span>
                      <span className="skill-percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-bar">
                      <div 
                        className="skill-progress" 
                        style={{ width: `${skill.level}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            */}
          </>
        );
      case 'resume':
        return <ResumeSection />;
      case 'portfolio':
        return <PortfolioSection projects={projects} />;
      case 'blog':
        return <BlogSection />;
      case 'contact':
        return <ContactSection profile={profile} />;
      default:
        return null;
    }
  };

  return (
    <div className="portfolio-modern">
      {/* Sidebar */}
      <aside className={`portfolio-sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="profile-card">
          {/* Tombol Toggle Mobile - Muncul hanya di mobile */}
          <button
            className="info-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <FiChevronDown className={isExpanded ? 'rotated' : ''} />
          </button>

          <div className="profile-header">
            <div className="profile-avatar">
              {profile && (
                <img src={avatar} alt={profile.name} />
              )}
            </div>
            <div className="profile-text">
              <h1 className="profile-name">{profile?.name || 'Loading...'}</h1>
              <p className="profile-title">{profile?.title || 'Web Developer'}</p>
            </div>
          </div>

          <div className={`profile-info ${isExpanded ? 'show' : ''}`}>
            <div className="info-item">
              <FiMail className="info-icon" />
              <div>
                <span className="info-label">EMAIL</span>
                <a href={`mailto:${profile?.email}`} className="info-value">
                  {profile?.email || 'loading...'}
                </a>
              </div>
            </div>

            <div className="info-item">
              <FiPhone className="info-icon" />
              <div>
                <span className="info-label">PHONE</span>
                <span className="info-value">{profile?.phone || '+62 XXX-XXXX-XXXX'}</span>
              </div>
            </div>

            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div>
                <span className="info-label">BIRTHDAY</span>
                <span className="info-value">{profile?.birthday || 'April 18'}</span>
              </div>
            </div>

            <div className="info-item">
              <FiMapPin className="info-icon" />
              <div>
                <span className="info-label">LOCATION</span>
                <span className="info-value">{profile?.location || 'Jakarta, Indonesia'}</span>
              </div>
            </div>
          </div>

          <div className="profile-social">
            {profile?.social?.github && (
              <a href={profile.social.github} target="_blank" rel="noopener noreferrer">
                <FiGithub />
              </a>
            )}
            {profile?.social?.linkedin && (
              <a href={profile.social.linkedin} target="_blank" rel="noopener noreferrer">
                <FiLinkedin />
              </a>
            )}
            {profile?.social?.twitter && (
              <a href={profile.social.twitter} target="_blank" rel="noopener noreferrer">
                <FiGlobe />
              </a>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="portfolio-main">
        <div className="portfolio-card-wrapper">
          <div className="card-inner-container">
            {/* Navigation dengan Title */}
            <div className="portfolio-header">
              <h2 className="page-title">
                {activeSection === 'about' && 'About Me'}
                {activeSection === 'resume' && 'Resume'}
                {activeSection === 'portfolio' && 'Portfolio'}
                {activeSection === 'blog' && 'Blog'}
                {activeSection === 'contact' && 'Contact'}
              </h2>

              <nav className="portfolio-nav">
                <button
                  className={activeSection === 'about' ? 'active' : ''}
                  onClick={() => setActiveSection('about')}
                >
                  About
                </button>
                <button
                  className={activeSection === 'resume' ? 'active' : ''}
                  onClick={() => setActiveSection('resume')}
                >
                  Resume
                </button>
                <button
                  className={activeSection === 'portfolio' ? 'active' : ''}
                  onClick={() => setActiveSection('portfolio')}
                >
                  Portfolio
                </button>
                <button
                  className={activeSection === 'blog' ? 'active' : ''}
                  onClick={() => setActiveSection('blog')}
                >
                  Blog
                </button>
                <button
                  className={activeSection === 'contact' ? 'active' : ''}
                  onClick={() => setActiveSection('contact')}
                >
                  Contact
                </button>
              </nav>
            </div>

            {/* Content Sections */}
            <div className="portfolio-content">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Page;