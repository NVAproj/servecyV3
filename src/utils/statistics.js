export function calculateStatistics(results, survey) {
    // Фильтруем только реальные ответы (не тестовые)
    const realResults = results.filter(result => {
        try {
            const parsed = JSON.parse(result.answersJson);
            // Проверяем, что это массив с форматом {q, a}
            return Array.isArray(parsed) && parsed.every(item =>
                item.q !== undefined && Array.isArray(item.a)
            );
        } catch {
            return false;
        }
    });

    const stats = {
        total: realResults.length,
        questions: []
    };

    if (!survey) return stats;

    survey.questions.forEach(question => {
        const questionStat = {
            questionId: question.id,
            text: question.text,
            options: []
        };

        question.options.forEach(option => {
            let count = 0;

            realResults.forEach(result => {
                try {
                    const answers = JSON.parse(result.answersJson);

                    if (!Array.isArray(answers)) return;

                    // Ищем ответ на текущий вопрос
                    const answer = answers.find(a =>
                        String(a.q) === String(question.id)
                    );

                    if (answer && Array.isArray(answer.a)) {
                        // Проверяем, выбран ли текущий вариант
                        if (answer.a.some(a => String(a) === String(option.id))) {
                            count++;
                        }
                    }
                } catch (error) {
                    console.error('Ошибка обработки:', error);
                }
            });

            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            questionStat.options.push({
                optionId: option.id,
                text: option.text,
                count,
                percentage: percentage.toFixed(1)
            });
        });

        stats.questions.push(questionStat);
    });

    return stats;
}