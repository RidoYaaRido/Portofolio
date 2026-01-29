import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectsManagement from './pages/ProjectsManagement';
import SkillsManagement from './pages/SkillsManagement';
import TestimonialsManagement from './pages/TestimonialsManagement';
import ProfileManagement from './pages/ProfileManagement';
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
          <Route path="/admin" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin/projects" replace />} />
            <Route path="projects" element={<ProjectsManagement />} />
            <Route path="skills" element={<SkillsManagement />} />
            <Route path="testimonials" element={<TestimonialsManagement />} />
            <Route path="profile" element={<ProfileManagement />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
