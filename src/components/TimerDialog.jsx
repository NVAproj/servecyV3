export default function TimerDialog({ onContinue, onClear }) {
    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h3>Вы еще здесь?</h3>
                <p>Сессия будет очищена через 10 секунд</p>
                <div className="dialog-actions">
                    <button className="continue-button" onClick={onContinue}>
                        Продолжить
                    </button>
                    <button className="clear-button" onClick={onClear}>
                        Очистить
                    </button>
                </div>
            </div>
        </div>
    );
}