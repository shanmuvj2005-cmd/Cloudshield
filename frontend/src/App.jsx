import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { AnomaliesPage } from './pages/AnomaliesPage';
import { NLPPage } from './pages/NLPPage';
import { DeceptionPage } from './pages/DeceptionPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuditPage } from './pages/AuditPage';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('dashboard'); // 'landing', 'login', or SOC tabs
  const { isAuthenticated } = useAuth();

  // If user is on landing page
  if (currentView === 'landing') {
    return <LandingPage onEnterConsole={() => setCurrentView('dashboard')} />;
  }

  // If not authenticated and navigating to console
  if (!isAuthenticated && currentView !== 'login') {
    return <LoginPage onSuccess={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'login') {
    return <LoginPage onSuccess={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col font-sans">
      <Navbar onNavigate={(view) => setCurrentView(view)} currentPage={currentView} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeTab={currentView} onSelectTab={(tab) => setCurrentView(tab)} />

        <main className="flex-1 overflow-y-auto h-[calc(100vh-65px)] bg-gradient-to-b from-cyber-bg to-[#05080f]">
          {currentView === 'dashboard' && (
            <DashboardPage 
              onNavigateToUsers={() => setCurrentView('users')}
              onNavigateToAlerts={() => setCurrentView('alerts')}
            />
          )}
          {currentView === 'users' && <UsersPage />}
          {currentView === 'anomalies' && <AnomaliesPage />}
          {currentView === 'nlp' && <NLPPage />}
          {currentView === 'deception' && <DeceptionPage />}
          {currentView === 'alerts' && <AlertsPage />}
          {currentView === 'audit' && <AuditPage />}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <AppContent />
      </WebSocketProvider>
    </AuthProvider>
  );
}
