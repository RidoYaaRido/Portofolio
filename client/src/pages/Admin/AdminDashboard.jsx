import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import '@/assets/css/AdminDashboard.css';
import ProfileManagement from './ProfileManagement';
import ProjectManagement from './ProjectManagement';
import SkillManagement from './SkillManagement';
import BlogManagement from './BlogManagement';
import EducationManagement from './EducationManagement';
import ExperienceManagement from './ExperienceManagement';
import { FiUser, FiFolder, FiCode, FiFileText, FiBook, FiBriefcase, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', icon: <FiUser /> },
    { id: 'projects', label: 'Projects', icon: <FiFolder /> },
    { id: 'skills', label: 'Skills', icon: <FiCode /> },
    { id: 'blogs', label: 'Blogs', icon: <FiFileText /> },
    { id: 'education', label: 'Education', icon: <FiBook /> },
    { id: 'experience', label: 'Experience', icon: <FiBriefcase /> }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'skills':
        return <SkillManagement />;
      case 'blogs':
        return <BlogManagement />;
      case 'education':
        return <EducationManagement />;
      case 'experience':
        return <ExperienceManagement />;
      default:
        return <ProfileManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FiX /> : <FiMenu />}
      </button>

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>RDR Hakim</h2>
          <p className="admin-user">{user?.name || 'Admin'}</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-header">
          <h1 className="admin-title">
            {menuItems.find(item => item.id === activeTab)?.label} Management
          </h1>
          <a href="/" className="view-site-btn" target="_blank" rel="noopener noreferrer">
            View Site
          </a>
        </div>

        <div className="admin-content">
          {renderContent()}
        </div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;