import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProjectManagement from './pages/Admin/ProjectManagement';
import SkillsManagement from './pages/Admin/SkillManagement';
import BlogManagement from './pages/Admin/BlogManagement';
import ProfileManagement from './pages/Admin/ProfileManagement';
import EducationManagement from './pages/Admin/EducationManagement';
import ExperienceManagement from './pages/Admin/ExperienceManagement';
import Page from './pages/Public/page';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Page />} />
          <Route path="/login" element={<Login />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin/projects" replace />} />
            <Route path="projects" element={<ProjectManagement />} />
            <Route path="skills" element={<SkillsManagement />} />
            <Route path="blog" element={<BlogManagement />} />
            <Route path="profile" element={<ProfileManagement />} />
            <Route path="education" element={<EducationManagement />} />
            <Route path="experience" element={<ExperienceManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
