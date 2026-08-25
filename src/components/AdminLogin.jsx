import { useState } from 'react';

const ADMIN_CREDENTIALS = {
    login: 'admin',
    password: '12345'
};

export default function AdminLogin({ onLogin, onBack }) {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login === ADMIN_CREDENTIALS.login && password === ADMIN_CREDENTIALS.password) {
            setError('');
            onLogin(true);
        } else {
            setError('Неверный логин или пароль');
        }
    };

    return (
        <div className="admin-login-screen">
            <div className="admin-login-card">
                <h2>Вход для администратора</h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Логин:</label>
                        <input
                            type="text"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            placeholder="Введите логин"
                        />
                    </div>

                    <div className="form-group">
                        <label>Пароль:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Введите пароль"
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="admin-login-actions">
                        <button type="submit" className="login-button">Войти</button>
                        <button type="button" className="back-button" onClick={onBack}>Назад</button>
                    </div>
                </form>
            </div>
        </div>
    );
}