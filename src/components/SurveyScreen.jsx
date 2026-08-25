
import { useSurvey } from '../store/SurveyContext';
import { useTimer } from '../hooks/useTimer';
import { validateAllAnswers } from '../utils/validation';
import QuestionRenderer from './QuestionRenderer';
import TimerDialog from './TimerDialog';
import SuccessScreen from './SuccessScreen';

export default function SurveyScreen({ onAdminClick }) {
    const { state, submitSurvey } = useSurvey();
    const { continueSession } = useTimer();

    if (state.loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (state.showSuccess) {
        return <SuccessScreen />;
    }

    const visibleQuestions = state.survey?.questions.filter(question => {
        if (!question.dependsOn) return true;
        const { questionId, optionIds } = question.dependsOn;
        const answer = state.currentAnswers[questionId];
        return answer && answer.some(id => optionIds.includes(id));
    });

    const isValid = validateAllAnswers(visibleQuestions, state.currentAnswers);
    const answeredCount = Object.keys(state.currentAnswers).length;

    return (
        <div className="survey-screen">
            <header className="survey-header">
                <h1>{state.survey?.title || 'Опрос'}</h1>
                <p>{state.survey?.description}</p>
                <button
                    className="admin-link"
                    onClick={onAdminClick}
                    title="Администрирование"
                >
                    ⚙️
                </button>
            </header>

            <div className="survey-progress">
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${(answeredCount / state.survey?.questions.length) * 100}%` }}
                    />
                </div>
                <span>{answeredCount} / {state.survey?.questions.length}</span>
            </div>

            <div className="questions-container">
                {visibleQuestions?.map(question => (
                    <QuestionRenderer
                        key={question.id}
                        question={question}
                        selectedOptions={state.currentAnswers[question.id] || []}
                    />
                ))}
            </div>

            <div className="survey-footer">
                <button
                    className="submit-button"
                    disabled={!isValid || state.isSubmitting}
                    onClick={submitSurvey}
                >
                    {state.isSubmitting ? 'Отправка...' : 'Отправить'}
                </button>
            </div>

            {state.showWarning && (
                <TimerDialog
                    onContinue={continueSession}
                    onClear={useSurvey().clearSession}
                />
            )}
        </div>
    );
}