// StorageTestPanel.jsx
import { useState } from 'react';
import { storageFillTest } from './test-storage-fill';
import { useSurvey } from '../store/SurveyContext';

export default function StorageTestPanel() {
    const [testStatus, setTestStatus] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [testResults, setTestResults] = useState(null);
    const { state } = useSurvey();

    const runFillTest = async () => {
        setIsRunning(true);
        setTestStatus('Заполнение памяти...');

        try {
            const results = await storageFillTest.fillStorageWithVotes(state.survey, 1.5);
            setTestResults(results);
            setTestStatus(`Тест завершен! Добавлено ${results.votesCount} голосов`);
        } catch (error) {
            setTestStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const runFixedTest = async () => {
        setIsRunning(true);
        setTestStatus('Тест с фиксированным количеством...');

        try {
            const results = await storageFillTest.testWithFixedVotes(state.survey, 100);
            setTestResults(results);
            setTestStatus(`Добавлено 100 голосов, занято ${(results.usedSpace / 1024 / 1024).toFixed(2)} МБ`);
        } catch (error) {
            setTestStatus(`Ошибка: ${error.message}`);
        } finally {
            setIsRunning(false);
        }
    };

    const cleanup = async () => {
        await storageFillTest.cleanup();
        setTestStatus('Тестовые данные очищены');
        setTestResults(null);
    };

    return (
        <div className="storage-test-panel">
            <h3>🧪 Тесты заполнения памяти</h3>

            <div className="test-buttons">
                <button
                    onClick={runFillTest}
                    disabled={isRunning}
                    className="test-button"
                >
                    Заполнить до 1.5%
                </button>

                <button
                    onClick={runFixedTest}
                    disabled={isRunning}
                    className="test-button"
                >
                    Добавить 100 голосов
                </button>

                <button
                    onClick={cleanup}
                    disabled={isRunning}
                    className="test-button cleanup"
                >
                    Очистить тестовые данные
                </button>
            </div>

            {testStatus && (
                <div className="test-status">
                    {testStatus}
                </div>
            )}

            {testResults && (
                <div className="test-results">
                    <h4>Результаты теста:</h4>
                    <ul>
                        <li>Голосов: {testResults.votesCount}</li>
                        {testResults.usedSpace && (
                            <li>Занято памяти: {(testResults.usedSpace / 1024 / 1024).toFixed(2)} МБ</li>
                        )}
                        {testResults.percentIncrease && (
                            <li>Увеличение: {testResults.percentIncrease.toFixed(2)}%</li>
                        )}
                    </ul>
                </div>
            )}

            <style jsx>{`
                .storage-test-panel {
                    background: #f8f9fa;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                }

                .test-buttons {
                    display: flex;
                    gap: 10px;
                    margin: 15px 0;
                    flex-wrap: wrap;
                }

                .test-button {
                    padding: 10px 15px;
                    background: #007bff;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .test-button:hover {
                    background: #0056b3;
                }

                .test-button:disabled {
                    background: #6c757d;
                    cursor: not-allowed;
                }

                .test-button.cleanup {
                    background: #dc3545;
                }

                .test-button.cleanup:hover {
                    background: #c82333;
                }

                .test-status {
                    padding: 10px;
                    background: #e9ecef;
                    border-radius: 4px;
                    margin: 10px 0;
                }

                .test-results {
                    background: white;
                    padding: 15px;
                    border-radius: 4px;
                    border: 1px solid #dee2e6;
                }

                .test-results ul {
                    list-style: none;
                    padding: 0;
                }

                .test-results li {
                    padding: 5px 0;
                    border-bottom: 1px solid #f8f9fa;
                }
            `}</style>
        </div>
    );
}