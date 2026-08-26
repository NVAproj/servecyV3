import { useState, useEffect } from 'react';
import { resultsRepository } from '../db/repositories';
import { calculateStatistics } from '../utils/statistics';
import { useSurvey } from '../store/SurveyContext';
import ExportSummary from './ExportSummary'
import ExportTxt from './ExportTxt'
// import StorageTestPanel from '../test/StorageTestPanel';

export default function AdminStats({ onBack }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [storageInfo, setStorageInfo] = useState(null);
    const { state } = useSurvey();

    useEffect(() => {
        loadStats();
        loadStorageInfo();
    }, []);

    async function loadStats() {
        setLoading(true);
        const results = await resultsRepository.getAllResults();
        console.log(results)
        const calculatedStats = calculateStatistics(results, state.survey);
        setStats(calculatedStats);
        setLoading(false);
    };

    const loadStorageInfo = async () => {
        try {
            if (navigator.storage && navigator.storage.estimate) {
                const estimate = await navigator.storage.estimate();
                const quota = estimate.quota || 0;
                const usage = estimate.usage || 0;
                const free = Math.max(0, quota - usage);

                // Процент использования от quota
                const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
                const percentFree = quota > 0 ? (free / quota) * 100 : 0;

                setStorageInfo({
                    quota,
                    usage,
                    free,
                    percentUsed,
                    percentFree
                });
            } else {
                setStorageInfo(null);
            }
        } catch (error) {
            console.error('Ошибка получения информации о хранилище:', error);
            setStorageInfo(null);
        }
    };

    const handleClearDatabase = async () => {
        if (window.confirm('Вы уверены? Это удалит все результаты опроса!')) {
            await resultsRepository.clearAllResults();
            await loadStats();
            await loadStorageInfo();
        }
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 Б';
        const k = 1024;
        const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return <div className="loading">Загрузка статистики...</div>;
    }

    return (
        <div className="admin-stats-screen">
            {/* <StorageTestPanel /> */}
            <header className="stats-header">
                <button className="back-button" onClick={onBack}>← Назад</button>
                <h2>📊 Статистика опроса</h2>
            </header>

            <div className="stats-content">
                {/* Секция использования хранилища */}


                {/* Существующая статистика */}
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

            {storageInfo && (
                <div className="storage-info-section">
                    <h3>💾 Использование хранилища</h3>

                    <div className="storage-details">
                        <div className="storage-item reserved">
                            <span className="storage-label">Занято:</span>
                            <span className="storage-value">{formatBytes(storageInfo.usage)}</span>
                            <span className="storage-percent">
                                {storageInfo.percentUsed.toFixed(2)}% от доступного
                            </span>
                        </div>
                        <div className="storage-item free">
                            <span className="storage-label">Свободно:</span>
                            <span className="storage-value">{formatBytes(storageInfo.free)}</span>
                            <span className="storage-percent">
                                {storageInfo.percentFree.toFixed(2)}% от доступного
                            </span>
                        </div>
                        <div className="storage-item total">
                            <span className="storage-label">Всего доступно:</span>
                            <span className="storage-value">{formatBytes(storageInfo.quota)}</span>
                        </div>
                    </div>

                    {/* Прогресс-бар использования */}
                    <div className="storage-progress">
                        <div className="storage-progress-header">
                            <span>Использовано {storageInfo.percentUsed.toFixed(1)}%</span>
                            <span>Свободно {storageInfo.percentFree.toFixed(1)}%</span>
                        </div>
                        <div className="storage-progress-bar">
                            {/* Заполненная часть */}
                            <div
                                className="storage-progress-fill"
                                style={{
                                    width: `${storageInfo.percentUsed}%`,
                                    backgroundColor: storageInfo.percentUsed > 90 ? '#e74c3c' :
                                        storageInfo.percentUsed > 70 ? '#f39c12' : '#27ae60',
                                    transition: 'width 0.5s ease-in-out'
                                }}
                            />
                            {/* Свободная часть */}
                            <div
                                className="storage-progress-free"
                                style={{
                                    width: `${storageInfo.percentFree}%`,
                                    backgroundColor: '#ecf0f1',
                                    transition: 'width 0.5s ease-in-out'
                                }}
                            />
                        </div>
                    </div>

                    {/* Визуальное представление */}
                    <div className="storage-visualization">
                        <div className="storage-blocks">
                            {Array.from({ length: 50 }, (_, i) => {
                                const threshold = (i + 1) * 2; // каждый блок = 2%
                                const isUsed = threshold <= storageInfo.percentUsed;
                                return (
                                    <div
                                        key={i}
                                        className={`storage-block ${isUsed ? 'used' : 'free'}`}
                                        title={`${threshold}% - ${isUsed ? 'Занято' : 'Свободно'}`}
                                    />
                                );
                            })}
                        </div>
                        <div className="storage-legend">
                            <div className="legend-item">
                                <div className="legend-color used"></div>
                                <span>Занято ({storageInfo.percentUsed.toFixed(1)}%)</span>
                            </div>
                            <div className="legend-item">
                                <div className="legend-color free"></div>
                                <span>Свободно ({storageInfo.percentFree.toFixed(1)}%)</span>
                            </div>
                        </div>
                    </div>

                    {/* Обновленная информация о данных */}
                    <div className="storage-data-info">
                        <div className="data-info-item">
                            <span>📊 Данные опроса + Кэш приложения:</span>
                            <strong>{formatBytes(storageInfo.usage)}</strong>
                        </div>
                    </div>
                </div>
            )}
            <ExportSummary />
            <ExportTxt />
            <div className="stats-footer">
                <button className="clear-database-button" onClick={handleClearDatabase}>
                    Очистить базу данных
                </button>
            </div>


        </div>
    );
}