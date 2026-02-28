import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ScrollPreferencesProvider } from './contexts/ScrollPreferencesContext';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import SellerRegistrationPage from './pages/SellerRegistrationPage';
import StudentDashboard from './pages/StudentDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CourseView from './pages/CourseView';
import CourseEdit from './pages/CourseEdit';
import StudentsManager from './pages/StudentsManager';
import DocsPage from './pages/docs/DocsPage';
import SellerDocsPage from './pages/docs/SellerDocsPage';
import DeployPage from './pages/DeployPage';
import BottomNavigation from './components/BottomNavigation';

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isPublicPage = location.pathname === '/login' || location.pathname === '/role-select' || location.pathname === '/register-seller' || location.pathname === '/' || location.pathname === '/docs' || location.pathname === '/internal-docs' || location.pathname === '/deploy';
  const needsBottomPadding = user && !isPublicPage;

  return (
    <div className={needsBottomPadding ? 'pb-20 md:pb-0' : ''}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/role-select" element={<RoleSelectionPage />} />
        <Route path="/register-seller" element={<SellerRegistrationPage />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/seller" element={<Navigate to="/seller/dashboard" replace />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/course/:courseId" element={<CourseEdit />} />
        <Route path="/seller/course/:courseId/students" element={<StudentsManager />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/course/:courseId" element={<CourseView />} />
        <Route path="/docs" element={<SellerDocsPage />} />
        <Route path="/internal-docs" element={<DocsPage />} />
        <Route path="/deploy" element={<DeployPage />} />
      </Routes>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ScrollPreferencesProvider>
          <AuthProvider>
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
          </AuthProvider>
        </ScrollPreferencesProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
