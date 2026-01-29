import { useState, useEffect } from 'react';
import api from '../services/api';

const Portfolio = () => {
  const [profile, setProfile] = useState(null);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, projectsRes, skillsRes] = await Promise.all([
        api.get('/profile'),
        api.get('/projects'),
        api.get('/skills')
      ]);
      setProfile(profileRes.data);
      setProjects(projectsRes.data);
      setSkills(skillsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.category === activeFilter);

  const categories = ['all', 'web development', 'web design', 'applications', 'mobile app'];

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '60px' }}>
        {profile && (
          <>
            <img 
              src={`http://localhost:5000${profile.avatar}`} 
              alt={profile.name}
              style={{ width: '150px', height: '150px', borderRadius: '50%', marginBottom: '20px' }}
            />
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{profile.name}</h1>
            <p style={{ fontSize: '1.2rem', color: '#666' }}>{profile.title}</p>
            <p style={{ marginTop: '20px', maxWidth: '600px', margin: '20px auto' }}>{profile.bio}</p>
          </>
        )}
      </header>

      <section style={{ marginBottom: '60px' }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>Skills</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          {skills.map(skill => (
            <div key={skill._id} style={{ padding: '20px', background: '#f5f5f5', borderRadius: '8px' }}>
              <h3 style={{ marginBottom: '10px' }}>{skill.name}</h3>
              <div style={{ background: '#ddd', height: '10px', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ 
                  background: '#4CAF50', 
                  height: '100%', 
                  width: `${skill.level}%`,
                  transition: 'width 0.3s'
                }}></div>
              </div>
              <span style={{ fontSize: '0.9rem', color: '#666' }}>{skill.level}%</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: '2rem', marginBottom: '30px', textAlign: 'center' }}>Projects</h2>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              style={{
                padding: '10px 20px',
                background: activeFilter === cat ? '#4CAF50' : '#f5f5f5',
                color: activeFilter === cat ? '#fff' : '#333',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
          {filteredProjects.map(project => (
            <div key={project._id} style={{ 
              background: '#fff', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <img 
                src={`http://localhost:5000${project.image}`} 
                alt={project.title}
                style={{ width: '100%', height: '200px', objectFit: 'cover' }}
              />
              <div style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '10px' }}>{project.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '10px' }}>{project.category}</p>
                <p style={{ marginBottom: '15px' }}>{project.description}</p>
                {project.projectUrl && (
                  <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" 
                    style={{ color: '#4CAF50', textDecoration: 'none' }}>
                    View Project →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '80px', padding: '40px 0', borderTop: '1px solid #eee' }}>
        <p>© 2025 {profile?.name}. All rights reserved.</p>
        <a href="/login" style={{ color: '#4CAF50', textDecoration: 'none', marginTop: '10px', display: 'inline-block' }}>
          Admin Login
        </a>
      </footer>
    </div>
  );
};

export default Portfolio;
