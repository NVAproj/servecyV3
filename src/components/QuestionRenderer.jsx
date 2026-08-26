import { useSurvey } from '../store/SurveyContext';

export default function QuestionRenderer({ question, selectedOptions, questionNumber, totalQuestions }) {
    const { setAnswer } = useSurvey();

    const handleSingleSelect = (optionId) => {
        setAnswer(question.id, [optionId]);
    };

    const handleMultipleSelect = (optionId) => {
        const current = selectedOptions || [];
        let newSelection;

        if (current.includes(optionId)) {
            newSelection = current.filter(id => id !== optionId);
        } else {
            if (question.maxSelections && current.length >= question.maxSelections) {
                // Убираем первый выбранный и добавляем новый
                newSelection = [...current.slice(1), optionId];
            } else {
                newSelection = [...current, optionId];
            }
        }

        setAnswer(question.id, newSelection);
    };

    return (
        <div className="question-card">
            <div className="question-header">
                <div className="question-number-badge">
                    <span className="question-number">Вопрос {questionNumber}</span>
                    <span className="question-total"> из {totalQuestions}</span>
                </div>
                <p className="question-text">{question.text}</p>
                {question.type === 'multiple' && question.maxSelections && (
                    <span className="hint">Выберите не более {question.maxSelections} вариантов</span>
                )}
            </div>

            <div className="options-list">
                {question.options.map(option => {
                    const isSelected = selectedOptions?.includes(option.id);

                    return (
                        <div
                            key={option.id}
                            className={`option-item ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                                if (question.type === 'single') {
                                    handleSingleSelect(option.id);
                                } else {
                                    handleMultipleSelect(option.id);
                                }
                            }}
                        >
                            <div className="option-indicator">
                                {question.type === 'single' ? (
                                    <div className="radio">{isSelected && <div className="radio-dot" />}</div>
                                ) : (
                                    <div className="checkbox">{isSelected && '✓'}</div>
                                )}
                            </div>
                            <span className="option-text">{option.text}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}