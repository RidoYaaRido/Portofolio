import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiCalendar, FiMapPin, FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiChevronDown } from 'react-icons/fi';
import api from '../../services/api';
import AboutSection from './about/AboutSection';
import ResumeSection from './resume/ResumeSection';
import PortfolioSection from './portofolio/PortfolioSection';
import BlogSection from './blog/BlogSection';
import ContactSection from './contact/ContactSection';
import SkillsSlider from './skill/SkillsSlider';
import '../../assets/css/Portfolio.css'; 
import '../../assets/css/LoadingStates.css';
import avatar from '../../assets/avatar.png';

const Page = () => {
  const [profile, setProfile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [activeSection, setActiveSection] = useState('about');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  // Handle scroll untuk hide/show nav di mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Jika scroll ke bawah, sembunyikan nav
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } 
      // Jika scroll ke atas, tampilkan nav
      else if (currentScrollY < lastScrollY) {
        setIsNavVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch semua data dari backend
      const [profileRes, projectsRes, skillsRes, blogsRes, educationRes, experienceRes] = await Promise.all([
        api.get('/profile'),
        api.get('/projects'),
        api.get('/skills'),
        api.get('/blogs'),
        api.get('/education'),
        api.get('/experience')
      ]);
      
      setProfile(profileRes.data);
      setProjects(projectsRes.data);
      setSkills(skillsRes.data);
      setBlogs(blogsRes.data);
      setEducation(educationRes.data);
      setExperience(experienceRes.data);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      
      // Fallback ke dummy data jika API gagal
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
          twitter: 'https://twitter.com/johndoe',
          instagram: 'https://instagram.com/johndoe'
        }
      });
      
      setSkills([
        { _id: 1, name: 'JavaScript', level: 95, icon: '⚡', color: '#F7DF1E' },
        { _id: 2, name: 'React', level: 90, icon: '⚛️', color: '#61DAFB' },
        { _id: 3, name: 'Node.js', level: 85, icon: '🟢', color: '#339933' }
      ]);
    } finally {
      setLoading(false);
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
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'about':
        return (
          <>
            <AboutSection profile={profile} services={services} />
            
            {/* Skills Slider - Technologies & Tools */}
            <section className="content-section">
              <h2 className="section-title">Skills</h2>
              <SkillsSlider skills={skills} />
            </section>
          </>
        );
      case 'resume':
        return <ResumeSection education={education} experience={experience} />;
      case 'portfolio':
        return <PortfolioSection projects={projects} />;
      case 'blog':
        return <BlogSection blogs={blogs} />;
      case 'contact':
        return <ContactSection profile={profile} />;
      default:
        return null;
    }
  };

  // Avatar URL helper - FIXED untuk Vite
  const getAvatarUrl = () => {
    if (!profile?.avatar) return avatar;
    if (profile.avatar.startsWith('http')) return profile.avatar;
    
    // Gunakan import.meta.env untuk Vite, bukan process.env
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace('/api', '');
    return `${baseUrl}${profile.avatar}`;
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
                <img src={getAvatarUrl()} alt={profile.name} />
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
                <FiTwitter />
              </a>
            )}
            {profile?.social?.instagram && (
              <a href={profile.social.instagram} target="_blank" rel="noopener noreferrer">
                <FiInstagram />
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
              
              <nav className={`portfolio-nav ${!isNavVisible ? 'nav-hidden' : ''}`}>
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