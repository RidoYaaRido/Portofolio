import { useState, useEffect } from 'react';
import { FiX, FiExternalLink, FiGithub } from 'react-icons/fi';

const PortfolioSection = ({ projects = [] }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    console.log('PortfolioSection - Projects received:', projects);
    console.log('PortfolioSection - Projects count:', projects.length);
  }, [projects]);

  // Fallback dummy data jika projects kosong
  const dummyProjects = [
    {
      _id: 'dummy-1',
      title: 'E-Commerce Platform',
      category: 'Web Development',
      image: 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=E-Commerce',
      description: 'Full-featured e-commerce platform with payment integration',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      demoUrl: '',
      githubUrl: ''
    },
    {
      _id: 'dummy-2',
      title: 'Mobile Banking App',
      category: 'Mobile Apps',
      image: 'https://via.placeholder.com/400x300/2a2a2a/3b82f6?text=Banking+App',
      description: 'Secure mobile banking application with biometric authentication',
      technologies: ['React Native', 'Firebase', 'Redux'],
      demoUrl: '',
      githubUrl: ''
    },
    {
      _id: 'dummy-3',
      title: 'Portfolio Website',
      category: 'Web Design',
      image: 'https://via.placeholder.com/400x300/2a2a2a/10b981?text=Portfolio',
      description: 'Modern portfolio website with smooth animations',
      technologies: ['React', 'GSAP', 'Tailwind CSS'],
      demoUrl: '',
      githubUrl: ''
    }
  ];

  const projectsData = projects.length > 0 ? projects : dummyProjects;

  useEffect(() => {
    console.log('PortfolioSection - Using data:', projectsData);
    console.log('PortfolioSection - Using backend data:', projects.length > 0);
  }, [projectsData, projects.length]);

  const categories = ['all', ...new Set(projectsData.map(p => p.category))];

  const filteredProjects = activeFilter === 'all'
    ? projectsData
    : projectsData.filter(p => p.category === activeFilter);

  // Helper untuk mendapatkan URL gambar - FIXED untuk Vite
  const getImageUrl = (image) => {
    if (!image) return 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=No+Image';
    if (image.startsWith('http')) return image;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = apiUrl.replace('/api', '');
    const fullUrl = `${baseUrl}${image}`;

    console.log('Image URL:', { original: image, full: fullUrl });
    return fullUrl;
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
            {category}
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
                alt={project.title}
                onError={(e) => {
                  console.error('Image failed to load:', project.image);
                  e.target.src = 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=Image+Error';
                }}
              />
              <div className="project-overlay">
                <h3>{project.title}</h3>
                <p>{project.category}</p>
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
                  Tap for details
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="empty-state">
          <p>No projects available in this category.</p>
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
            {/* Header: Full-width background image */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '220px',
              overflow: 'hidden',
              borderRadius: '12px 12px 0 0',
              marginTop: '-1px'
            }}>
              {/* Project image as background */}
              <img
                src={getImageUrl(selectedProject.image)}
                alt={selectedProject.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/600x220/1a1a2e/ffa500?text=No+Image';
                }}
              />
              {/* Dark gradient overlay bawah untuk readability title */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)'
              }} />
              {/* Close button — float di atas gambar */}
              <button
                className="dialog-close-btn"
                onClick={closeDialog}
                style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}
              >
                <FiX />
              </button>
              {/* Title di bawah gambar */}
              <h2 style={{
                position: 'absolute',
                bottom: '16px',
                left: '20px',
                right: '20px',
                margin: 0,
                color: '#fff',
                fontSize: '20px',
                fontWeight: '600',
                textShadow: '0 2px 6px rgba(0,0,0,0.4)',
                zIndex: 1
              }}>
                {selectedProject.title}
              </h2>
            </div>

            {/* Content */}
            <div className="dialog-content">

              {/* Category + Featured Badge Row */}
              <div className="skill-info-row">
                <div className="skill-info-item">
                  <span className="info-label">Category</span>
                  <div
                    className="category-badge"
                    style={{ backgroundColor: getCategoryColor(selectedProject.category) }}
                  >
                    <span className="category-icon">
                      {getCategoryIcon(selectedProject.category)}
                    </span>
                    <span className="category-name">
                      {selectedProject.category}
                    </span>
                  </div>
                </div>

                {selectedProject.featured && (
                  <div className="skill-info-item">
                    <span className="info-label">Status</span>
                    <div
                      className="category-badge"
                      style={{ backgroundColor: '#FFD700' }}
                    >
                      <span className="category-icon">⭐</span>
                      <span className="category-name" style={{ color: '#1a1a2e' }}>
                        Featured
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="skill-description">
                <h3>Description</h3>
                <p>{selectedProject.description || 'No description available.'}</p>
              </div>

              {/* Technologies */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="skill-description">
                  <h3>Technologies</h3>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginTop: '8px'
                  }}>
                    {selectedProject.technologies.map((tech, i) => (
                      <span
                        key={i}
                        style={{
                          display: 'inline-block',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: 'rgba(255,255,255,0.08)',
                          border: `1px solid ${getCategoryColor(selectedProject.category)}55`,
                          color: getCategoryColor(selectedProject.category),
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links: Demo & GitHub */}
              {(selectedProject.demoUrl || selectedProject.githubUrl) && (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  marginTop: '20px'
                }}>
                  {selectedProject.demoUrl && (
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: getCategoryColor(selectedProject.category),
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <FiExternalLink size={15} /> Live Demo
                    </a>
                  )}
                  {selectedProject.githubUrl && (
                    <a
                      href={selectedProject.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: '#fff',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                        transition: 'opacity 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <FiGithub size={15} /> GitHub
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