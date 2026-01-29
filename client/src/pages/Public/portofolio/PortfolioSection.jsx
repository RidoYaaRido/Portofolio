import { useState } from 'react';

const PortfolioSection = ({ projects }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const dummyProjects = projects.length > 0 ? projects : [
    {
      _id: 1,
      title: 'E-Commerce Platform',
      category: 'Web Development',
      image: 'https://via.placeholder.com/400x300/2a2a2a/ffa500?text=E-Commerce',
      description: 'Full-featured e-commerce platform with payment integration',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      _id: 2,
      title: 'Mobile Banking App',
      category: 'Mobile Apps',
      image: 'https://via.placeholder.com/400x300/2a2a2a/3b82f6?text=Banking+App',
      description: 'Secure mobile banking application with biometric authentication',
      technologies: ['React Native', 'Firebase', 'Redux']
    },
    {
      _id: 3,
      title: 'Portfolio Website',
      category: 'Web Design',
      image: 'https://via.placeholder.com/400x300/2a2a2a/10b981?text=Portfolio',
      description: 'Modern portfolio website with smooth animations',
      technologies: ['React', 'GSAP', 'Tailwind CSS']
    },
    {
      _id: 4,
      title: 'Task Management Tool',
      category: 'Web Development',
      image: 'https://via.placeholder.com/400x300/2a2a2a/8b5cf6?text=Task+Manager',
      description: 'Collaborative task management tool for teams',
      technologies: ['Vue.js', 'Express', 'PostgreSQL']
    },
    {
      _id: 5,
      title: 'Fitness Tracking App',
      category: 'Mobile Apps',
      image: 'https://via.placeholder.com/400x300/2a2a2a/ef4444?text=Fitness+App',
      description: 'Track workouts, nutrition, and health metrics',
      technologies: ['Flutter', 'Firebase', 'HealthKit']
    },
    {
      _id: 6,
      title: 'Restaurant Landing Page',
      category: 'Web Design',
      image: 'https://via.placeholder.com/400x300/2a2a2a/f59e0b?text=Restaurant',
      description: 'Elegant landing page for fine dining restaurant',
      technologies: ['HTML', 'CSS', 'JavaScript', 'Figma']
    }
  ];

  const categories = ['all', ...new Set(dummyProjects.map(p => p.category))];

  const filteredProjects = activeFilter === 'all' 
    ? dummyProjects 
    : dummyProjects.filter(p => p.category === activeFilter);

  return (
    <section className="content-section">
      {/* <h2 className="section-title">Portfolio</h2> */}
      
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
            <div className="project-image">
              <img 
                src={project.image.startsWith('http') ? project.image : `http://localhost:5000${project.image}`}
                alt={project.title}
              />
              <div className="project-overlay">
                <h3>{project.title}</h3>
                <p>{project.category}</p>
                {project.technologies && (
                  <div className="project-tech">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PortfolioSection;