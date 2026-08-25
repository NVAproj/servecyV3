export function validateAllAnswers(questions, answers) {
    if (!questions || questions.length === 0) return false;

    return questions.every(question => {
        const answer = answers[question.id];

        if (!question.required) return true;

        if (!answer || answer.length === 0) return false;

        if (question.type === 'single' && answer.length !== 1) return false;

        if (question.type === 'multiple' && question.maxSelections &&
            answer.length > question.maxSelections) return false;

        return true;
    });
}

export function validateQuestion(question, answer) {
    if (!question.required) return true;

    if (!answer || answer.length === 0) return false;

    if (question.type === 'single' && answer.length !== 1) return false;

    if (question.type === 'multiple' && question.maxSelections &&
        answer.length > question.maxSelections) return false;

    return true;
}