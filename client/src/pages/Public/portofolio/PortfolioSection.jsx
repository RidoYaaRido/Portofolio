import { useState, useEffect } from 'react';
import { FiX, FiExternalLink, FiGithub } from 'react-icons/fi';
import { getBaseUrl } from '../../../services/api';
import { translateText, dictionary } from '../../../utils/translationHelper';
import '@/assets/css/SkillsSlider.css';

const PortfolioSection = ({ projects = [], lang = 'id' }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    console.log('PortfolioSection - Projects received:', projects);
    console.log('PortfolioSection - Projects count:', projects.length);
  }, [projects]);

  const projectsData = projects;

  useEffect(() => {
    console.log('PortfolioSection - Using data:', projectsData);
    console.log('PortfolioSection - Using backend data:', projects.length > 0);
  }, [projectsData, projects.length]);

  const categories = ['all', ...new Set(projectsData.map(p => translateText(p.category, lang)))];

  const filteredProjects = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => translateText(p.category, lang) === activeFilter);

  // Helper untuk mendapatkan URL gambar - FIXED untuk Vite
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=No+Image';
    if (image.startsWith('http')) return image;
    return `${getBaseUrl()}${image}`;
  };

  // --- Dialog handlers (sama pattern seperti SkillsSlider) ---
  const handleProjectClick = (project) => {
    setSelectedProject(project);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  // Helper: warna per kategori
  const getCategoryColor = (category) => {
    const colors = {
      'Web Development': '#61DAFB',
      'Mobile Apps': '#4169E1',
      'Web Design': '#FF6B6B',
      'Backend': '#339933',
      'DevOps': '#2496ED',
      'Design': '#FF6B6B',
    };
    return colors[category] || '#FFA500';
  };

  // Helper: ikon per kategori
  const getCategoryIcon = (category) => {
    const icons = {
      'Web Development': '🌐',
      'Mobile Apps': '📱',
      'Web Design': '🎨',
      'Backend': '⚙️',
      'DevOps': '🚀',
      'Design': '✨',
    };
    return icons[category] || '📌';
  };

  return (
    <section className="content-section">
      {/* Filter Buttons */}
      <div className="portfolio-filters">
        {categories.map(category => (
          <button
            key={category}
            className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category === 'all' ? (lang === 'id' ? 'Semua' : 'All') : category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {filteredProjects.map(project => (
          <div key={project._id} className="project-card-modern">
            <div
              className="project-image"
              onClick={() => handleProjectClick(project)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={getImageUrl(project.image)}
                alt={translateText(project.title, lang)}
                onError={(e) => {
                  console.error('Image failed to load:', project.image);
                  e.target.src = 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=Image+Error';
                }}
              />
              <div className="project-overlay">
                <h3>{translateText(project.title, lang)}</h3>
                <p>{translateText(project.category, lang)}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <div className="project-tech">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                )}
                {/* Tap/click hint */}
                <p style={{
                  fontSize: '12px',
                  marginTop: '8px',
                  opacity: 0.7,
                  fontStyle: 'italic'
                }}>
                  {dictionary[lang].tapForDetails}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>{dictionary[lang].noProjects}</p>
        </div>
      )}

      {/* ===== Project Detail Dialog (pattern dari SkillsSlider) ===== */}
      {showDialog && selectedProject && (
        <div
          className={`skill-dialog-overlay ${showDialog ? 'show' : ''}`}
          onClick={closeDialog}
        >
          <div
            className={`skill-dialog ${showDialog ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ '--skill-color': getCategoryColor(selectedProject.category) }}
          >
            {/* Header: Full-width background image with title */}
            <div className="project-dialog-header">
              <img
                src={getImageUrl(selectedProject.image)}
                alt={translateText(selectedProject.title, lang)}
                className="project-dialog-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x220/1a1a2e/ffa500?text=No+Image';
                }}
              />
              <div className="project-dialog-overlay-gradient" />
              <button
                className="dialog-close-btn"
                onClick={closeDialog}
              >
                <FiX />
              </button>
              <h2 className="project-dialog-title">
                {translateText(selectedProject.title, lang)}
              </h2>
            </div>

            {/* Content */}
            <div className="dialog-content">
              {/* Category + Featured Badge Row */}
              <div className="skill-info-row">
                <div className="skill-info-item">
                  <span className="info-label">{dictionary[lang].category}</span>
                  <div
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedProject.category) }}
                  >
                    <span className="category-icon">
                      {getCategoryIcon(selectedProject.category)}
                    </span>
                    <span className="category-name">
                      {translateText(selectedProject.category, lang)}
                    </span>
                  </div>
                </div>

                {selectedProject.featured && (
                  <div className="skill-info-item">
                    <span className="info-label">{dictionary[lang].status}</span>
                    <div
                      className="category-badge"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      <span className="category-icon">⭐</span>
                      <span className="category-name" style={{ color: '#1a1a2e' }}>
                        {dictionary[lang].featured}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="skill-description">
                <h3>{dictionary[lang].description}</h3>
                <p>{translateText(selectedProject.description, lang) || dictionary[lang].noDescription}</p>
              </div>

              {/* Technologies */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="skill-description">
                  <h3>{dictionary[lang].technologies}</h3>
                  <div className="project-tech-container">
                    {selectedProject.technologies.map((tech, i) => (
                      <span
                        key={i}
                        className="project-tech-tag"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links: Demo & GitHub */}
              {(selectedProject.demoUrl || selectedProject.githubUrl) && (
                <div className="project-links-container">
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-btn project-btn-primary"
                    >
                      <FiExternalLink size={15} /> {dictionary[lang].liveDemo}
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-btn project-btn-secondary"
                    >
                      <FiGithub size={15} /> {dictionary[lang].githubRepo}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PortfolioSection;