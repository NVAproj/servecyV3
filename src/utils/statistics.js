export function calculateStatistics(results, survey) {
    const stats = {
        total: results.length,
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

            results.forEach(result => {
                const answers = JSON.parse(result.answersJson);
                const answer = answers.find(a => a.q === question.id);

                if (answer && answer.a.includes(option.id)) {
                    count++;
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