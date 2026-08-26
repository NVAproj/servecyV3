// SurveyScreen.jsx
import { useSurvey } from '../store/SurveyContext';
import { useTimer } from '../hooks/useTimer';
import { validateAllAnswers } from '../utils/validation';
import QuestionRenderer from './QuestionRenderer';
import TimerDialog from './TimerDialog';
import SuccessScreen from './SuccessScreen';
import { useState, useEffect } from 'react';

export default function SurveyScreen({ onAdminClick, onBack }) {
    const { state, setAnswer, submitSurvey, clearSession } = useSurvey();
    const { continueSession } = useTimer();
    const [localError, setLocalError] = useState(null);

    // Обработка ошибок
    useEffect(() => {
        if (state.error) {
            setLocalError(state.error);
        }
    }, [state.error]);

    // Проверка на загрузку
    if (state.loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner">⏳</div>
                <p>Загрузка опроса...</p>
            </div>
        );
    }

    // Проверка на ошибку
    if (localError) {
        return (
            <div className="error-screen">
                <div className="error-icon">❌</div>
                <h2>Ошибка</h2>
                <p>{localError}</p>
                <button
                    className="retry-button"
                    onClick={() => {
                        setLocalError(null);
                        window.location.reload();
                    }}
                >
                    Обновить страницу
                </button>
            </div>
        );
    }

    // Проверка наличия опроса
    if (!state.survey) {
        return (
            <div className="error-screen">
                <div className="error-icon">📋</div>
                <h2>Опрос не найден</h2>
                <p>Пожалуйста, обратитесь к администратору</p>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Обновить
                </button>
            </div>
        );
    }

    // Проверка наличия вопросов
    if (!state.survey.questions || state.survey.questions.length === 0) {
        return (
            <div className="error-screen">
                <div className="error-icon">❓</div>
                <h2>Вопросы отсутствуют</h2>
                <p>В опросе нет вопросов. Пожалуйста, обратитесь к администратору</p>
                <button
                    className="retry-button"
                    onClick={() => window.location.reload()}
                >
                    Обновить
                </button>
            </div>
        );
    }

    // ✅ Экран успеха - передаём onBack для автоматического возврата
    if (state.showSuccess) {
        return <SuccessScreen onBack={onBack} autoRedirect={true} redirectDelay={3000} />;
    }

    // Получаем видимые вопросы с учетом ветвления
    const visibleQuestions = state.survey.questions.filter(question => {
        if (!question.dependsOn) return true;
        const { questionId, optionIds } = question.dependsOn;
        const answer = state.currentAnswers?.[questionId];
        return answer && answer.some(id => optionIds.includes(id));
    });

    const totalQuestions = visibleQuestions.length;
    const answeredCount = visibleQuestions.filter(q =>
        state.currentAnswers?.[q.id] && state.currentAnswers[q.id].length > 0
    ).length;

    const isValid = validateAllAnswers(visibleQuestions, state.currentAnswers || {});
    const progressPercentage = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

    // Функция для безопасного получения логотипа
    const getLogoImage = () => {
        if (state.survey?.img) {
            return state.survey.img;
        }
        return "./icons/logo.png";
    };

    // Функция для безопасного получения заголовка
    const getTitle = () => {
        return state.survey?.title || 'Опрос';
    };

    // Функция для безопасного получения описания
    const getDescription = () => {
        return state.survey?.description || '';
    };

    // Обработчик отправки
    const handleSubmit = async () => {
        try {
            // Передаём onBack как колбэк успешной отправки
            await submitSurvey(onBack);
        } catch (error) {
            console.error('Submit error:', error);
            setLocalError('Ошибка при отправке опроса. Попробуйте еще раз.');
        }
    };

    return (
        <div className="survey-screen">
            <header className="survey-header">

                {onAdminClick && (
                    <button
                        className="backButton"
                        onClick={onBack}
                        title="Назад"
                    >
                        ◀ назад
                    </button>
                )}
                {getDescription() && (
                    <p className="descriptionSurv">{getDescription()}</p>
                )}
            </header>

            {totalQuestions > 0 ? (
                <>
                    <div className="survey-progress">
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <span className="progress-text">
                            {answeredCount} / {totalQuestions}
                        </span>
                    </div>

                    <div className="questions-container">
                        {visibleQuestions.map((question, index) => (
                            <QuestionRenderer
                                key={question.id}
                                question={question}
                                questionNumber={index + 1}
                                totalQuestions={totalQuestions}
                                selectedOptions={state.currentAnswers?.[question.id] || []}
                                onAnswer={setAnswer}
                            />
                        ))}
                    </div>

                    <div className="survey-footer">
                        <button
                            className="submit-button"
                            disabled={!isValid || state.isSubmitting}
                            onClick={handleSubmit}
                        >
                            {state.isSubmitting ? (
                                <>
                                    <span className="spinner">⏳</span>
                                    Отправка...
                                </>
                            ) : (
                                'Отправить ответы'
                            )}
                        </button>
                        {!isValid && (
                            <p className="validation-hint">
                                ⚠️ Ответьте на все вопросы перед отправкой
                            </p>
                        )}
                    </div>
                </>
            ) : (
                <div className="empty-state">
                    <p>Нет доступных вопросов</p>
                </div>
            )}

            {state.showWarning && (
                <TimerDialog
                    onContinue={continueSession}
                    onClear={clearSession}
                />
            )}
        </div>
    );
}