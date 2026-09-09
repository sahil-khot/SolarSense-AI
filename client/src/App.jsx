import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Protection Wrappers
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import SolutionsPage from './pages/public/SolutionsPage';
import AboutPage from './pages/public/AboutPage';
import GovernmentSubsidiesPage from './pages/public/GovernmentSubsidiesPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage';

// User Pages
import DashboardPage from './pages/user/DashboardPage';
import OnboardingWizardPage from './pages/user/OnboardingWizardPage';
import BillAnalysisPage from './pages/user/BillAnalysisPage';
import SolarRecommendationPage from './pages/user/SolarRecommendationPage';
import CostAnalysisPage from './pages/user/CostAnalysisPage';
import ReportsPage from './pages/user/ReportsPage';
import ProfilePage from './pages/user/ProfilePage';
import ChatPage from './pages/user/ChatPage';
import CompaniesPage from './pages/user/CompaniesPage';
import CompanyComparisonPage from './pages/user/CompanyComparisonPage';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminReportsPage from './pages/admin/AdminReportsPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <Routes>
              {/* PUBLIC PAGES */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                <Route path="/solutions" element={<SolutionsPage />} />
                <Route path="/govt-schemes" element={<GovernmentSubsidiesPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* USER PROTECTED PAGES */}
              <Route
                element={
                  <ProtectedRoute>
                    <UserLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/subsidies" element={<GovernmentSubsidiesPage />} />
                <Route path="/onboarding" element={<OnboardingWizardPage />} />
                <Route path="/bill-analysis" element={<BillAnalysisPage />} />
                <Route path="/solar-recommendation" element={<SolarRecommendationPage />} />
                <Route path="/cost-analysis" element={<CostAnalysisPage />} />
                <Route path="/companies" element={<CompaniesPage />} />
                <Route path="/companies/compare" element={<CompanyComparisonPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* ADMIN ISOLATED AUTHENTICATION */}
              <Route path="/admin/login" element={<AdminLoginPage />} />

              {/* ADMIN PROTECTED PAGES */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
                <Route path="/admin/settings" element={<AdminSettingsPage />} />
              </Route>

              {/* CATCH ALL */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AdminAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
