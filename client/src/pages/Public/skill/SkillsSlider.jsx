import { useEffect, useRef } from 'react';
import '@/assets/css/SkillsSlider.css';

const SkillsSlider = () => {
  const sliderRef = useRef(null);
  const animationRef = useRef(null);

  const skillLogos = [
    { name: 'JavaScript', icon: '⚡', color: '#F7DF1E' },
    { name: 'React', icon: '⚛️', color: '#61DAFB' },
    { name: 'Node.js', icon: '🟢', color: '#339933' },
    { name: 'Python', icon: '🐍', color: '#3776AB' },
    { name: 'TypeScript', icon: '📘', color: '#3178C6' },
    { name: 'MongoDB', icon: '🍃', color: '#47A248' },
    { name: 'PostgreSQL', icon: '🐘', color: '#4169E1' },
    { name: 'Docker', icon: '🐳', color: '#2496ED' },
    { name: 'Git', icon: '📦', color: '#F05032' },
    { name: 'AWS', icon: '☁️', color: '#FF9900' },
    { name: 'Vue.js', icon: '💚', color: '#4FC08D' },
    { name: 'Next.js', icon: '▲', color: '#000000' },
  ];

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;

    let scrollAmount = 0;
    const scrollSpeed = 0.5; // Kecepatan scroll
    let isPaused = false;

    const scroll = () => {
      if (!isPaused && slider) {
        scrollAmount += scrollSpeed;
        
        // Reset scroll saat mencapai setengah width (karena kita duplicate items)
        if (scrollAmount >= slider.scrollWidth / 2) {
          scrollAmount = 0;
        }
        
        slider.scrollLeft = scrollAmount;
      }
      animationRef.current = requestAnimationFrame(scroll);
    };

    // Mulai animasi
    animationRef.current = requestAnimationFrame(scroll);

    // Pause saat hover
    const handleMouseEnter = () => {
      isPaused = true;
    };

    const handleMouseLeave = () => {
      isPaused = false;
    };

    slider.addEventListener('mouseenter', handleMouseEnter);
    slider.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      slider.removeEventListener('mouseenter', handleMouseEnter);
      slider.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div className="skills-slider-container">
      <div className="skills-slider" ref={sliderRef}>
        <div className="skills-slider-track">
          {/* Duplicate array untuk seamless loop */}
          {[...skillLogos, ...skillLogos, ...skillLogos].map((skill, index) => (
            <div 
              key={index} 
              className="skill-logo-card"
              style={{ '--skill-color': skill.color }}
            >
              <div className="skill-logo-icon">{skill.icon}</div>
              <span className="skill-logo-name">{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkillsSlider;