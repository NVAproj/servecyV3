import { useState, useEffect } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Проверяем, установлено ли уже приложение
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isIOSStandalone = window.navigator.standalone === true;
            setIsInstalled(isStandalone || isIOSStandalone);
        };

        checkInstalled();

        // Перехватываем событие beforeinstallprompt
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowInstallButton(true);

            // Показываем предложение установки через 2 секунды
            setTimeout(() => {
                setShowPrompt(true);
            }, 2000);
        };

        // Отслеживаем успешную установку
        const installedHandler = () => {
            console.log('Приложение установлено!');
            setIsInstalled(true);
            setShowPrompt(false);
            setShowInstallButton(false);
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Пользователь принял установку');
            setDeferredPrompt(null);
            setShowInstallButton(false);
            setShowPrompt(false);
        } else {
            console.log('Пользователь отклонил установку');
        }
    };

    if (isInstalled || !showPrompt) return null;

    return (
        <div className="install-prompt">
            <div className="install-prompt-content">
                <div className="install-icon">📱</div>
                <div className="install-text">
                    <h3>Установить приложение</h3>
                    <p>Быстрый доступ к опросу с главного экрана</p>
                </div>
                {showInstallButton && (
                    <button className="install-button" onClick={handleInstallClick}>
                        Установить
                    </button>
                )}
                <button
                    className="close-install"
                    onClick={() => setShowPrompt(false)}
                    title="Закрыть"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}