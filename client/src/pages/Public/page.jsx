import { useState, useEffect } from 'react';
import { FiUser, FiFileText, FiGrid, FiBookOpen, FiMail, FiPhone, FiCalendar, FiMapPin, FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiChevronDown } from 'react-icons/fi';
import api, { getBaseUrl } from '../../services/api';
import AboutSection from './about/AboutSection';
import ResumeSection from './resume/ResumeSection';
import PortfolioSection from './portofolio/PortfolioSection';
import BlogSection from './blog/BlogSection';
import ContactSection from './contact/ContactSection';
import SkillsSlider from './skill/SkillsSlider';
import '../../assets/css/Portfolio.css';
import '../../assets/css/LoadingStates.css';
import avatar from '../../assets/avatar.png';
import { translateText, dictionary } from '../../utils/translationHelper';

const Page = () => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id');
  const [profile, setProfile] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [ghostIcons, setGhostIcons] = useState({});
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [activeSection, setActiveSection] = useState('about');
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { id: 'about', icon: <FiUser /> },
    { id: 'resume', icon: <FiFileText /> },
    { id: 'portfolio', icon: <FiGrid /> },
    { id: 'blog', icon: <FiBookOpen /> },
    { id: 'contact', icon: <FiMail /> }
  ];

  const handleDockClick = (id) => {
    setActiveSection(id);
    setGhostIcons(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setGhostIcons(prev => ({ ...prev, [id]: false }));
    }, 800);
  };

  const activeIndex = navItems.findIndex(item => item.id === activeSection);

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
      setProfile(null);
      setProjects([]);
      setSkills([]);
      setBlogs([]);
      setEducation([]);
      setExperience([]);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      icon: '🎨',
      title: lang === 'id' ? 'Desain Web' : 'Web Design',
      description: lang === 'id' ? 'Desain paling modern dan berkualitas tinggi yang dibuat pada tingkat profesional.' : 'The most modern and high-quality design made at a professional level.'
    },
    {
      icon: '💻',
      title: lang === 'id' ? 'Pengembangan Web' : 'Web Development',
      description: lang === 'id' ? 'Pengembangan situs berkualitas tinggi pada tingkat profesional.' : 'High-quality development of sites at the professional level.'
    },
    {
      icon: '📱',
      title: lang === 'id' ? 'Aplikasi Seluler' : 'Mobile Apps',
      description: lang === 'id' ? 'Pengembangan aplikasi profesional untuk iOS dan Android.' : 'Professional development of applications for iOS and Android.'
    },
    {
      icon: '🔧',
      title: lang === 'id' ? 'Software QA / Tester' : 'Software QA / Tester',
      description: lang === 'id' ? 'Memastikan kualitas aplikasi melalui pengujian fungsional dan kegunaan.' : 'Ensuring application quality through functional and usability testing.'
    }
  ];

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{dictionary[lang].loading}</p>
        </div>
      );
    }

    switch (activeSection) {
      case 'about':
        return (
          <>
            <AboutSection profile={profile} services={services} lang={lang} />
            
            {/* Skills Slider - Technologies & Tools */}
            <section className="content-section">
              <h2 className="section-title">{dictionary[lang].skills}</h2>
              <SkillsSlider skills={skills} lang={lang} />
            </section>
          </>
        );
      case 'resume':
        return <ResumeSection education={education} experience={experience} lang={lang} />;
      case 'portfolio':
        return <PortfolioSection projects={projects} lang={lang} />;
      case 'blog':
        return <BlogSection blogs={blogs} lang={lang} />;
      case 'contact':
        return <ContactSection profile={profile} lang={lang} />;
      default:
        return null;
    }
  };

  // Avatar URL helper - FIXED untuk Vite
  const getAvatarUrl = () => {
    if (!profile?.avatar) return avatar;
    if (profile.avatar.startsWith('http')) return profile.avatar;
    return `${getBaseUrl()}${profile.avatar}`;
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
            {/* Language Switcher */}
            <div className="lang-switcher-sidebar">
              <button 
                className={`lang-btn ${lang === 'id' ? 'active' : ''}`}
                onClick={() => { setLang('id'); localStorage.setItem('lang', 'id'); }}
              >
                ID
              </button>
              <span className="lang-divider">|</span>
              <button 
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => { setLang('en'); localStorage.setItem('lang', 'en'); }}
              >
                EN
              </button>
            </div>
            <div className="profile-avatar">
              {profile && (
                <img src={getAvatarUrl()} alt={profile.name} />
              )}
            </div>
            <div className="profile-text">
              <h1 className="profile-name">{profile ? translateText(profile.name, lang) : 'Loading...'}</h1>
              <p className="profile-title">{profile ? translateText(profile.title, lang) : 'Web Developer'}</p>
            </div>
          </div>

          <div className={`profile-info ${isExpanded ? 'show' : ''}`}>
            <div className="info-item">
              <FiMail className="info-icon" />
              <div>
                <span className="info-label">{dictionary[lang].email}</span>
                <a href={`mailto:${profile?.email}`} className="info-value">
                  {profile?.email || 'loading...'}
                </a>
              </div>
            </div>

            <div className="info-item">
              <FiPhone className="info-icon" />
              <div>
                <span className="info-label">{dictionary[lang].phone}</span>
                <span className="info-value">{profile?.phone || '+62 XXX-XXXX-XXXX'}</span>
              </div>
            </div>

            <div className="info-item">
              <FiCalendar className="info-icon" />
              <div>
                <span className="info-label">{dictionary[lang].birthday}</span>
                <span className="info-value">{profile ? translateText(profile.birthday, lang) : 'April 18'}</span>
              </div>
            </div>

            <div className="info-item">
              <FiMapPin className="info-icon" />
              <div>
                <span className="info-label">{dictionary[lang].location}</span>
                <span className="info-value">{profile ? translateText(profile.location, lang) : 'Jakarta, Indonesia'}</span>
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
                {activeSection === 'about' && dictionary[lang].about}
                {activeSection === 'resume' && dictionary[lang].resume}
                {activeSection === 'portfolio' && dictionary[lang].portfolio}
                {activeSection === 'blog' && dictionary[lang].blog}
                {activeSection === 'contact' && dictionary[lang].contact}
              </h2>
              
              <nav 
                className={`portfolio-dock ${!isNavVisible ? 'dock-hidden' : ''}`}
                style={{ '--active-index': activeIndex }}
              >
                <div className="dock-indicator"></div>
                {navItems.map((item) => (
                  <button 
                    key={item.id}
                    className={`dock-item ${activeSection === item.id ? 'active' : ''}`} 
                    onClick={() => handleDockClick(item.id)}
                  >
                    <span className="dock-icon">{item.icon}</span>
                    <span className="dock-label">{dictionary[lang][item.id]}</span>
                    
                    {/* Ghost Icon */}
                    {ghostIcons[item.id] && (
                      <span className="ghost-icon floating">{item.icon}</span>
                    )}
                  </button>
                ))}
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
