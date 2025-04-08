import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useOnlineStatus } from './hooks/useOnlineStatus';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Page Components
import HomePage from './pages/HomePage';
import CompetitionsPage from './pages/CompetitionsPage';
import CompetitionDetailsPage from './pages/CompetitionDetailsPage';
import SubmissionPage from './pages/SubmissionPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import OfflinePage from './pages/OfflinePage';
import NotFoundPage from './pages/NotFoundPage';

// UI Components
import OfflineBanner from './components/common/OfflineBanner';
import InstallPrompt from './components/common/InstallPrompt';
import UpdateNotification from './components/common/UpdateNotification';

function App() {
  const { user, loading } = useAuth();
  const isOnline = useOnlineStatus();
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [installEvent, setInstallEvent] = useState(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Handle PWA installation
  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      // Prevent the default browser install prompt
      event.preventDefault();
      // Save the event for later use
      setInstallEvent(event);
      // Show our custom install prompt
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle service worker updates
  useEffect(() => {
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    // Listen for service worker update events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleServiceWorkerUpdate);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleServiceWorkerUpdate);
      }
    };
  }, []);

  // Handle app installation
  const handleInstallClick = async () => {
    if (!installEvent) return;

    try {
      await installEvent.prompt();
      const choiceResult = await installEvent.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      // Reset the install event
      setInstallEvent(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('Error during installation:', error);
    }
  };

  // Handle app update
  const handleUpdate = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  // Protected route component
  const ProtectedRoute = ({ children, adminOnly = false }) => {
    if (loading) return <div>Loading...</div>;
    
    if (!user) return <Navigate to="/login" />;
    
    if (adminOnly && user.role !== 'admin') {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  // If offline and not on the offline page, show offline page
  if (!isOnline && window.location.pathname !== '/offline') {
    return <OfflinePage />;
  }

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && <OfflineBanner />}
      
      {/* Install Prompt */}
      {showInstallPrompt && <InstallPrompt onInstall={handleInstallClick} onDismiss={() => setShowInstallPrompt(false)} />}
      
      {/* Update Notification */}
      {updateAvailable && <UpdateNotification onUpdate={handleUpdate} />}
      
      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="competitions" element={<CompetitionsPage />} />
          <Route path="competitions/:id" element={<CompetitionDetailsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="offline" element={<OfflinePage />} />
        </Route>
        
        {/* Protected Routes */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<ProfilePage />} />
          <Route path="submissions" element={<SubmissionPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="competitions" element={<AdminDashboardPage section="competitions" />} />
          <Route path="users" element={<AdminDashboardPage section="users" />} />
          <Route path="analytics" element={<AdminDashboardPage section="analytics" />} />
        </Route>
        
        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
