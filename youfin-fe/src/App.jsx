import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import Dashboard from './components/Dashboard';
import Map from './components/Map';
import AIAssistant from './components/AIAssistant';
import Expenses from './components/Expenses';
import ProfilePage from './components/profile/ProfilePage';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './components/layout/MainLayout';
import { useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ResetPassword from './components/auth/ResetPassword';
import ForgotPassword from './components/auth/ForgotPassword';

// Placeholder components for new routes
const WalletPage = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-[#333] text-white">
      <h1 className="text-2xl font-bold mb-4">Wallet</h1>
      <p>This is a placeholder for the Wallet feature. It will be implemented soon.</p>
    </div>
  );
};

const PurchasePage = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-[#333] text-white">
      <h1 className="text-2xl font-bold mb-4">Purchase</h1>
      <p>This is a placeholder for the Purchase feature. Find best prices for your products soon.</p>
    </div>
  );
};

const EarnPage = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-[#333] text-white">
      <h1 className="text-2xl font-bold mb-4">Earn</h1>
      <p>This is a placeholder for the Earn feature. Learn how to earn rewards and cashback soon.</p>
    </div>
  );
};

const ConnectionsPage = () => {
  return (
    <div className="p-6 rounded-2xl bg-[#1E1E1E] border border-[#333] text-white">
      <h1 className="text-2xl font-bold mb-4">Connections</h1>
      <p>This is a placeholder for the Connections feature. Connect with financial services and friends soon.</p>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FF9F1C] to-[#FFB74D]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <MainLayout>{children}</MainLayout>;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 5000,
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '1rem',
              },
              success: {
                iconTheme: {
                  primary: '#FF9F1C',
                  secondary: '#fff',
                },
                style: {
                  background: '#1a1a1a',
                  border: '1px solid #FF9F1C',
                },
              },
              error: {
                style: {
                  background: '#1a1a1a',
                  border: '1px solid #FF4B4B',
                },
              },
            }}
          />
          <Routes>
            {/* Public Routes */}
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <Map />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <AIAssistant />
                </ProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <ProtectedRoute>
                  <Expenses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            
            {/* New Routes */}
            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <WalletPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchase"
              element={
                <ProtectedRoute>
                  <PurchasePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/earn"
              element={
                <ProtectedRoute>
                  <EarnPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ProtectedRoute>
                  <ConnectionsPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;