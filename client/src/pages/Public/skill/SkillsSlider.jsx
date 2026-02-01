import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import '@/assets/css/SkillsSlider.css';

const SkillsSlider = ({ apiEndpoint = '/skills' }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api${apiEndpoint}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        setSkills(data);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loading || skills.length === 0) return;

    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5;
    let isPaused = false;

    const scroll = () => {
      if (!isPaused && slider && !showDialog) {
        scrollAmount += scrollSpeed;
        
        if (scrollAmount >= slider.scrollWidth / 2) {
          scrollAmount = 0;
        }
        
        slider.scrollLeft = scrollAmount;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    animationRef.current = requestAnimationFrame(scroll);

    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [loading, skills, showDialog]);

  const handleSkillClick = (skill) => {
    setSelectedSkill(skill);
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setTimeout(() => setSelectedSkill(null), 300);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      frontend: '🎨',
      backend: '⚙️',
      database: '💾',
      tools: '🔧',
      devops: '🚀',
      design: '✨',
      other: '📌'
    };
    return icons[category] || icons.other;
  };

  const getCategoryColor = (category) => {
    const colors = {
      frontend: '#61DAFB',
      backend: '#339933',
      database: '#4169E1',
      tools: '#F05032',
      devops: '#2496ED',
      design: '#FF6B6B',
      other: '#FFA500'
    };
    return colors[category] || colors.other;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      frontend: 'Frontend Development',
      backend: 'Backend Development',
      database: 'Database Management',
      tools: 'Development Tools',
      devops: 'DevOps & Infrastructure',
      design: 'Design & UI/UX',
      other: 'Other Skills'
    };
    return labels[category] || category;
  };

  const getLevelLabel = (level) => {
    if (level >= 90) return 'Expert';
    if (level >= 75) return 'Advanced';
    if (level >= 60) return 'Intermediate';
    if (level >= 40) return 'Competent';
    return 'Beginner';
  };

  const renderSkillIcon = (skill) => {
    if (skill.iconType === 'image' && skill.iconUrl) {
      return (
        <>
          <img 
            src={`http://localhost:5000${skill.iconUrl}`} 
            alt={skill.name} 
            className="skill-logo-image"
            onError={(e) => {
              e.target.style.display = 'none';
              if (e.target.nextSibling) {
                e.target.nextSibling.style.display = 'block';
              }
            }}
          />
          <span className="skill-logo-emoji" style={{ display: 'none' }}>
            {skill.icon || '⚡'}
          </span>
        </>
      );
    }
    return <span className="skill-logo-emoji">{skill.icon || '⚡'}</span>;
  };

  if (loading) {
    return (
      <div className="skills-slider-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading skills...</p>
        </div>
      </div>
    );
  }

  if (skills.length === 0) {
    return (
      <div className="skills-slider-container">
        <div className="empty-state">
          <p>No skills available yet</p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            Skills will appear here once added by admin
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="skills-slider-container">
        <div className="skills-slider" ref={sliderRef}>
          <div className="skills-slider-track">
            {[...skills, ...skills, ...skills].map((skill, index) => (
              <div 
                key={`${skill._id || skill.name}-${index}`}
                className="skill-logo-card"
                style={{ '--skill-color': skill.color }}
                onClick={() => handleSkillClick(skill)}
              >
                <div className="skill-logo-icon">
                  {renderSkillIcon(skill)}
                </div>
                <span className="skill-logo-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showDialog && selectedSkill && (
        <div 
          className={`skill-dialog-overlay ${showDialog ? 'show' : ''}`}
          onClick={closeDialog}
        >
          <div 
            className={`skill-dialog ${showDialog ? 'show' : ''}`}
            onClick={(e) => e.stopPropagation()}
            style={{ '--skill-color': selectedSkill.color }}
          >
            <button className="dialog-close-btn" onClick={closeDialog}>
              <FiX />
            </button>

            <div className="dialog-header">
              <div className="dialog-icon">
                {renderSkillIcon(selectedSkill)}
              </div>
              <h2>{selectedSkill.name}</h2>
            </div>

            <div className="dialog-content">
              {/* Category & Level Info */}
              <div className="skill-info-row">
                <div className="skill-info-item">
                  <span className="info-label">Category</span>
                  <div 
                    className="category-badge" 
                    style={{ backgroundColor: getCategoryColor(selectedSkill.category) }}
                  >
                    <span className="category-icon">
                      {getCategoryIcon(selectedSkill.category)}
                    </span>
                    <span className="category-name">
                      {getCategoryLabel(selectedSkill.category)}
                    </span>
                  </div>
                </div>

                <div className="skill-info-item">
                  <span className="info-label">Proficiency Level</span>
                  <div className="level-display">
                    <div className="level-bar-container">
                      <div 
                        className="level-bar-fill" 
                        style={{ 
                          width: `${selectedSkill.level}%`,
                          backgroundColor: selectedSkill.color 
                        }}
                      ></div>
                    </div>
                    <span className="level-percentage">{selectedSkill.level}%</span>
                  </div>
                </div>
              </div>

              {/* Stats Circles */}
              <div className="skill-stats">
                <div className="stat-item">
                  <div 
                    className="stat-circle" 
                    style={{ borderColor: selectedSkill.color }}
                  >
                    <span className="stat-value">{selectedSkill.level}</span>
                  </div>
                  <span className="stat-label">{getLevelLabel(selectedSkill.level)}</span>
                </div>

                <div className="stat-item">
                  <div 
                    className="stat-circle" 
                    style={{ borderColor: getCategoryColor(selectedSkill.category) }}
                  >
                    <span className="stat-icon">
                      {getCategoryIcon(selectedSkill.category)}
                    </span>
                  </div>
                  <span className="stat-label">{selectedSkill.category}</span>
                </div>
              </div>

              {/* Description */}
              {selectedSkill.description && (
                <div className="skill-description">
                  <h3>About this skill</h3>
                  <p>{selectedSkill.description}</p>
                </div>
              )}

              {/* Additional Info if no description */}
              {!selectedSkill.description && (
                <div className="skill-description">
                  <h3>Skill Overview</h3>
                  <p>
                    I have achieved a {getLevelLabel(selectedSkill.level).toLowerCase()} level 
                    in {selectedSkill.name}, with {selectedSkill.level}% proficiency. 
                    This skill falls under the {getCategoryLabel(selectedSkill.category).toLowerCase()} category.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SkillsSlider;