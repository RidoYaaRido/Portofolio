import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiGrid, FiFolder, FiAward, FiMessageSquare, FiUser, FiLogOut } from 'react-icons/fi';
import '../assets/css/Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/projects', label: 'Projects', icon: <FiFolder /> },
    { path: '/admin/skills', label: 'Skills', icon: <FiAward /> },
    { path: '/admin/testimonials', label: 'Testimonials', icon: <FiMessageSquare /> },
    { path: '/admin/profile', label: 'Profile', icon: <FiUser /> },
  ];

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <FiGrid size={24} />
          <h2>Admin Panel</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.username?.charAt(0).toUpperCase()}</div>
            <div className="user-details">
              <p className="user-name">{user?.username}</p>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-header">
          <a href="/" target="_blank" rel="noopener noreferrer" className="view-site-btn">
            View Portfolio →
          </a>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
