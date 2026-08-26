import { useState, useEffect, useCallback } from 'react';

export default function TimerDialog({ onContinue, onClear }) {
    const [countdown, setCountdown] = useState(10);
    const [isVisible, setIsVisible] = useState(true);

    const handleClear = useCallback(() => {
        setIsVisible(false);
        onClear();
    }, [onClear]);

    useEffect(() => {
        if (countdown === 0) {
            handleClear();
            return;
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, handleClear]);

    if (!isVisible) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h3>Вы еще здесь?</h3>
                <p>Сессия будет очищена через {countdown} секунд</p>

                <div className="countdown-bar">
                    <div
                        className="countdown-fill"
                        style={{
                            width: `${(countdown / 10) * 100}%`,
                            backgroundColor: countdown <= 3 ? '#f44336' : '#667eea'
                        }}
                    />
                </div>

                <div className="dialog-actions">
                    <button className="continue-button" onClick={onContinue}>
                        Продолжить ({countdown})
                    </button>
                    <button className="clear-button" onClick={handleClear}>
                        Очистить сейчас
                    </button>
                </div>
            </div>
        </div>
    );
}