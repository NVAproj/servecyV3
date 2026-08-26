import { useState, useEffect } from 'react';
import { SurveyProvider } from './store/SurveyContext';
import WelcomeScreen from './components/WelcomeScreen';
import SurveyScreen from './components/SurveyScreen';
import AdminLogin from './components/AdminLogin';
import AdminStats from './components/AdminStats';

const App = () => {
  const [currentView, setCurrentView] = useState('welcome'); // 'welcome' | 'survey' | 'admin-login' | 'admin-stats'
  const [isAdmin, setIsAdmin] = useState(false);
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
  }, []);

  const handleStartSurvey = () => {
    setCurrentView('survey');
  };

  const handleAdminLogin = (success) => {
    if (success) {
      setIsAdmin(true);
      setCurrentView('admin-stats');
    }
  };

  const handleAdminClick = () => {
    setCurrentView('admin-login');
  };

  const handleBack = () => {
    setCurrentView('welcome');
  };

  const handleBackFromAdmin = () => {
    setCurrentView('welcome');
  };

  // Если не готово, показываем загрузку
  if (!isReady) {
    return (
      <div className="app">
        <div className="loading">Загрузка приложения...</div>
      </div>
    );
  }

  return (
    <SurveyProvider> {/* 👈 Провайдер должен оборачивать всё приложение */}
      <div className="app">
        {/* Приветственный экран */}
        {currentView === 'welcome' && (
          <WelcomeScreen
            onStartSurvey={handleStartSurvey}
            onAdminLogin={handleAdminClick}
          />
        )}

        {/* Экран опроса */}
        {currentView === 'survey' && (
          <SurveyScreen
            onAdminClick={handleAdminClick}
            onBack={handleBack}
          />
        )}

        {/* Экран входа администратора */}
        {currentView === 'admin-login' && (
          <AdminLogin
            onLogin={handleAdminLogin}
            onBack={handleBackFromAdmin}
          />
        )}

        {/* Экран статистики администратора */}
        {currentView === 'admin-stats' && isAdmin && (
          <AdminStats
            onBack={handleBackFromAdmin}
          />
        )}
      </div>
    </SurveyProvider>
  );
};

export default App;