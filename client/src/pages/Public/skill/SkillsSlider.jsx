import { useState, useEffect, useRef } from 'react';
import { FiX } from 'react-icons/fi';
import '@/assets/css/SkillsSlider.css';
import { getBaseUrl } from '../../../services/api';
import { translateText, dictionary } from '../../../utils/translationHelper';

const SkillsSlider = ({ skills = [], lang = 'id' }) => {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (skills.length === 0) return;

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
  }, [skills, showDialog]);

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
      id: {
        frontend: 'Pengembangan Frontend',
        backend: 'Pengembangan Backend',
        database: 'Pengelolaan Database',
        tools: 'Alat Pengembangan',
        devops: 'DevOps & Infrastruktur',
        design: 'Desain & UI/UX',
        other: 'Keahlian Lainnya'
      },
      en: {
        frontend: 'Frontend Development',
        backend: 'Backend Development',
        database: 'Database Management',
        tools: 'Development Tools',
        devops: 'DevOps & Infrastructure',
        design: 'Design & UI/UX',
        other: 'Other Skills'
      }
    };
    return labels[lang]?.[category] || category;
  };

  const getLevelLabel = (level) => {
    if (level >= 90) return dictionary[lang].expert;
    if (level >= 75) return dictionary[lang].advanced;
    if (level >= 60) return dictionary[lang].intermediate;
    if (level >= 40) return dictionary[lang].competent;
    return dictionary[lang].beginner;
  };

  const renderSkillIcon = (skill) => {
    if (skill.iconType === 'image' && skill.iconUrl) {
      return (
        <>
          <img 
            src={skill.iconUrl.startsWith('http') ? skill.iconUrl : `${getBaseUrl()}${skill.iconUrl}`} 
            alt={translateText(skill.name, lang)} 
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

  if (skills.length === 0) {
    return (
      <div className="skills-slider-container">
        <div className="empty-state">
          <p>{lang === 'id' ? 'Belum ada keahlian yang tersedia' : 'No skills available yet'}</p>
          <p style={{ fontSize: '14px', color: '#999', marginTop: '10px' }}>
            {lang === 'id' ? 'Keahlian akan muncul di sini setelah ditambahkan oleh admin' : 'Skills will appear here once added by admin'}
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
                <span className="skill-logo-name">{translateText(skill.name, lang)}</span>
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
              <h2>{translateText(selectedSkill.name, lang)}</h2>
            </div>

            <div className="dialog-content">
              {/* Category & Level Info */}
              <div className="skill-info-row">
                <div className="skill-info-item">
                  <span className="info-label">{dictionary[lang].category}</span>
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
                  <span className="info-label">{lang === 'id' ? 'Tingkat Kemahiran' : 'Proficiency Level'}</span>
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
                  <h3>{dictionary[lang].aboutSkill}</h3>
                  <p>{translateText(selectedSkill.description, lang)}</p>
                </div>
              )}

              {/* Additional Info if no description */}
              {!selectedSkill.description && (
                <div className="skill-description">
                  <h3>{dictionary[lang].skillOverview}</h3>
                  {lang === 'id' ? (
                    <p>
                      Saya telah mencapai tingkat {getLevelLabel(selectedSkill.level).toLowerCase()} 
                      dalam {translateText(selectedSkill.name, lang)}, dengan kemahiran {selectedSkill.level}%. 
                      Keahlian ini termasuk dalam kategori {getCategoryLabel(selectedSkill.category).toLowerCase()}.
                    </p>
                  ) : (
                    <p>
                      I have achieved an {getLevelLabel(selectedSkill.level).toLowerCase()} level 
                      in {translateText(selectedSkill.name, lang)}, with {selectedSkill.level}% proficiency. 
                      This skill falls under the {getCategoryLabel(selectedSkill.category).toLowerCase()} category.
                    </p>
                  )}
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