// SuccessScreen.jsx
import { useEffect, useState } from 'react';

export default function SuccessScreen({ onBack, autoRedirect = true, redirectDelay = 3000 }) {
    const [countdown, setCountdown] = useState(redirectDelay / 1000);

    useEffect(() => {
        if (autoRedirect && onBack) {
            // Обратный отсчёт
            const countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // Таймер для автоматического возврата
            const timer = setTimeout(() => {
                onBack();
            }, redirectDelay);

            return () => {
                clearTimeout(timer);
                clearInterval(countdownInterval);
            };
        }
    }, [autoRedirect, onBack, redirectDelay]);

    return (
        <div className="success-screen-wrapper">
            <div className="success-icon">✅</div>
            <h2>Спасибо за участие!</h2>
            <p>Ваши ответы успешно отправлены</p>

            {/* <button
                className="back-to-start-button"
                onClick={onBack}
            >
                ← На главную
            </button> */}

            {autoRedirect && onBack && (
                <div className="countdown-timer">
                    Возврат через <span className="countdown-number">{countdown}</span> сек
                </div>
            )}
        </div>
    );
}