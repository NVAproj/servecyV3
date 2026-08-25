import { useState, useEffect } from 'react';
import { SurveyProvider } from './store/SurveyContext';
import SurveyScreen from './components/SurveyScreen';
import AdminLogin from './components/AdminLogin';
import AdminStats from './components/AdminStats';

function App() {
  const [currentView, setCurrentView] = useState('survey');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Проверяем готовность Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker готов');
        setIsReady(true);
      });
    } else {
      setIsReady(true);
    }

    // Отслеживаем онлайн/офлайн
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleAdminLogin = (success) => {
    if (success) {
      setIsAdmin(true);
      setCurrentView('admin-stats');
    }
  };

  return (
    <SurveyProvider>
      <div className="app">
        {!isOnline && (
          <div className="offline-banner">
            <span>📡</span>
            <div>
              <strong>Офлайн-режим</strong>
              <p>Приложение работает офлайн</p>
            </div>
          </div>
        )}

        {currentView === 'survey' && (
          <SurveyScreen onAdminClick={() => setCurrentView('admin-login')} />
        )}

        {currentView === 'admin-login' && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBack={() => setCurrentView('survey')}
          />
        )}

        {currentView === 'admin-stats' && isAdmin && (
          <AdminStats onBack={() => setCurrentView('survey')} />
        )}
      </div>
    </SurveyProvider>
  );
}

export default App;