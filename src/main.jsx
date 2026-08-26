import React from 'react';
import ReactDOM from 'react-dom/client';
import { SurveyProvider } from './store/SurveyContext'
import App from './App.jsx';
import './index.css';

// Простая регистрация Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Относительный путь
    navigator.serviceWorker.register('./sw.js', {
      scope: './'
    }).then(reg => {
      console.log('SW зарегистрирован:', reg.scope);
    }).catch(err => {
      console.error('SW ошибка:', err);
    });
  });
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SurveyProvider>
      <App />
    </SurveyProvider>
  </React.StrictMode>
);