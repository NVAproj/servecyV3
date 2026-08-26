// WelcomeScreen.jsx
import React from 'react';
const WelcomeScreen = ({ onStartSurvey, onAdminLogin }) => {
    return (
        <div className="welcome-screen">
            {/* Фоновый логотип */}
            <div className="welcome-background">
                <img
                    src="./icons/logo_back.png"
                    alt="Background"
                    className="background-logo"
                />
            </div>

            <div className="welcome-container">
                <div className="welcome-logo">
                    <img
                        src="./icons/logo.png"
                        alt="AEROFUELS"
                        className="welcome-logo-image"
                    />
                </div>

                <button
                    className="welcome-button start-button"
                    onClick={onStartSurvey}
                >
                    НАЧАТЬ ОПРОС
                </button>

                <button
                    className="admin-button"
                    onClick={onAdminLogin}
                    title="Вход для администратора"
                >
                    🔐
                </button>
            </div>
        </div>
    );
};

export default WelcomeScreen;