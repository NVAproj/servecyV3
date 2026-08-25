import { useState, useEffect } from 'react';

export default function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);
    const [showIndicator, setShowIndicator] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false);
            setShowIndicator(false);
        };

        const handleOffline = () => {
            setIsOffline(true);
            setShowIndicator(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!showIndicator) return null;

    return (
        <div className="offline-indicator">
            <div className="offline-content">
                <span>📡</span>
                <div>
                    <strong>Офлайн-режим</strong>
                    <p>Все данные сохраняются локально</p>
                </div>
            </div>
        </div>
    );
}