import { useState, useEffect } from 'react';
import { resultsRepository } from '../db/repositories';
import { calculateStatistics } from '../utils/statistics';
import { useSurvey } from '../store/SurveyContext';

export default function AdminStats({ onBack }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { state } = useSurvey();

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        const results = await resultsRepository.getAllResults();
        const calculatedStats = calculateStatistics(results, state.survey);
        setStats(calculatedStats);
        setLoading(false);
    };

    const handleClearDatabase = async () => {
        if (window.confirm('Вы уверены? Это удалит все результаты опроса!')) {
            await resultsRepository.clearAllResults();
            await loadStats();
        }
    };

    if (loading) {
        return <div className="loading">Загрузка статистики...</div>;
    }

    return (
        <div className="admin-stats-screen">
            <header className="stats-header">
                <button className="back-button" onClick={onBack}>← Назад</button>
                <h2>📊 Статистика опроса</h2>
            </header>

            <div className="stats-content">
                <div className="total-results">
                    <h3>Всего отправлено анкет:</h3>
                    <div className="total-number">{stats.total}</div>
                </div>

                {stats.questions.map(questionStat => (
                    <div key={questionStat.questionId} className="question-stats">
                        <h3>Вопрос {questionStat.questionId}: {questionStat.text}</h3>

                        {questionStat.options.map(option => (
                            <div key={option.optionId} className="option-stats">
                                <div className="option-label">
                                    <span>{option.text}</span>
                                    <span className="option-percentage">
                                        {option.percentage}% ({option.count})
                                    </span>
                                </div>
                                <div className="percentage-bar">
                                    <div
                                        className="percentage-fill"
                                        style={{ width: `${option.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="stats-footer">
                <button className="clear-database-button" onClick={handleClearDatabase}>
                    Очистить базу данных
                </button>
            </div>
        </div>
    );
}