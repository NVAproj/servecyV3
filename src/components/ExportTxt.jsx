import { useState } from 'react';
import { resultsRepository } from '../db/repositories';
import { useSurvey } from '../store/SurveyContext';

export default function ExportTxt() {
    const [isExporting, setIsExporting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const { state } = useSurvey();

    // Форматирование даты
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Подсчет количества ответивших на вопрос
    const countRespondentsForQuestion = (results, questionId) => {
        let count = 0;

        results.forEach(result => {
            try {
                const answers = JSON.parse(result.answersJson);
                const answer = answers.find(a => a.q === questionId);
                if (answer && answer.a && answer.a.length > 0) {
                    count++;
                }
            } catch (error) {
                // Пропускаем ошибки
            }
        });

        return count;
    };

    // Функция для выравнивания текста в колонках
    const padText = (text, width, align = 'left') => {
        const str = String(text || '');
        if (str.length >= width) return str;

        const padding = ' '.repeat(width - str.length);
        return align === 'left' ? str + padding : padding + str;
    };

    // Генерация TXT отчета
    const generateTXT = (results) => {
        const lines = [];
        const separator = '='.repeat(100);
        const divider = '-'.repeat(100);

        // Получаем все уникальные даты
        const allDates = new Set();
        results.forEach(result => {
            allDates.add(formatDate(result.submittedAt));
        });

        const sortedDates = Array.from(allDates).sort((a, b) => {
            return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'));
        });

        // ===== ЗАГОЛОВОК =====
        lines.push(separator);
        lines.push('СВОДНЫЙ ОТЧЕТ ПО ОПРОСУ ПАССАЖИРОВ');
        lines.push(separator);
        lines.push(`Дата выгрузки: ${formatDate(new Date().toISOString())}`);
        lines.push(`Всего ответов: ${results.length}`);
        lines.push('');

        if (results.length === 0) {
            lines.push('Нет данных для отображения');
            return lines.join('\n');
        }

        // ===== РАЗДЕЛ 1: СВОДКА ПО ДНЯМ =====
        lines.push(divider);
        lines.push('1. СВОДКА ПО ДНЯМ');
        lines.push(divider);

        // Заголовки таблицы
        const col1Width = 15; // Дата
        const col2Width = 30; // Количество

        lines.push(
            padText('Дата', col1Width) +
            '| ' + padText('Количество проголосовавших', col2Width)
        );
        lines.push(padText('', col1Width, 'right') + '+' + '-'.repeat(col2Width + 2));

        // Данные по дням
        const resultsByDate = {};
        results.forEach(result => {
            const dateKey = formatDate(result.submittedAt);
            if (!resultsByDate[dateKey]) {
                resultsByDate[dateKey] = [];
            }
            resultsByDate[dateKey].push(result);
        });

        sortedDates.forEach(date => {
            const dayResults = resultsByDate[date];
            lines.push(
                padText(date, col1Width) +
                '| ' + padText(String(dayResults.length), col2Width)
            );
        });

        // Итоговая строка
        lines.push(
            padText('ИТОГО', col1Width) +
            '| ' + padText(String(results.length), col2Width)
        );

        lines.push('');
        lines.push('');

        // ===== РАЗДЕЛ 2: СТАТИСТИКА ПО ВОПРОСАМ =====
        lines.push(divider);
        lines.push('2. СТАТИСТИКА ПО ВОПРОСАМ');
        lines.push(divider);
        lines.push('');

        // Для каждого вопроса
        state.survey?.questions.forEach((question, questionIndex) => {
            const respondentsCount = countRespondentsForQuestion(results, question.id);

            // Выводим вопрос
            lines.push(`Вопрос ${question.id}: ${question.text}`);
            lines.push(divider);

            // Заголовки таблицы
            const optionWidth = 35; // Вариант ответа
            const totalWidth = 8;   // ИТОГО

            let headerLine = padText('Вариант ответа', optionWidth) + '| ' + padText('ИТОГО', totalWidth, 'right');

            // Добавляем даты в заголовок
            sortedDates.forEach(date => {
                headerLine += '| ' + padText(date, 12, 'right');
            });

            lines.push(headerLine);
            lines.push('-'.repeat(headerLine.length));

            // Для каждого варианта ответа
            question.options.forEach(option => {
                let totalCount = 0;
                const countsByDate = {};

                sortedDates.forEach(date => {
                    countsByDate[date] = 0;
                });

                results.forEach(result => {
                    try {
                        const answers = JSON.parse(result.answersJson);
                        const answer = answers.find(a => a.q === question.id);
                        if (answer && answer.a.includes(option.id)) {
                            totalCount++;
                            const dateKey = formatDate(result.submittedAt);
                            if (countsByDate[dateKey] !== undefined) {
                                countsByDate[dateKey]++;
                            }
                        }
                    } catch (error) {
                        // Пропускаем ошибки
                    }
                });

                let rowLine = padText(option.text, optionWidth) + '| ' + padText(String(totalCount), totalWidth, 'right');

                sortedDates.forEach(date => {
                    rowLine += '| ' + padText(String(countsByDate[date] || 0), 12, 'right');
                });

                lines.push(rowLine);
            });

            // Итоговая строка по вопросу
            let totalLine = padText(`ИТОГО: Ответило ${respondentsCount} из ${results.length}`, optionWidth) + '| ' + padText(String(respondentsCount), totalWidth, 'right');

            sortedDates.forEach(date => {
                let dateCount = 0;
                results.forEach(result => {
                    try {
                        const answers = JSON.parse(result.answersJson);
                        const answer = answers.find(a => a.q === question.id);
                        if (answer && answer.a && answer.a.length > 0) {
                            const dateKey = formatDate(result.submittedAt);
                            if (dateKey === date) {
                                dateCount++;
                            }
                        }
                    } catch (error) {
                        // Пропускаем ошибки
                    }
                });
                totalLine += '| ' + padText(String(dateCount), 12, 'right');
            });

            lines.push(totalLine);
            lines.push('');
            lines.push('');
        });

        return lines.join('\n');
    };

    // Скачивание файла
    const downloadFile = (content, filename) => {
        const blob = new Blob(['\uFEFF' + content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Обработчик экспорта
    const handleExport = async () => {
        setIsExporting(true);
        setShowSuccess(false);

        try {
            const results = await resultsRepository.getAllResults();
            const txtContent = generateTXT(results);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `survey_report_${timestamp}.txt`;

            downloadFile(txtContent, filename);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Ошибка при создании файла');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="export-txt">
            <button
                className="export-summary-button"
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? '⏳ Создание отчета...' : '📄 Выгрузить в TXT'}
            </button>

            {showSuccess && (
                <div className="export-txt-success">
                    ✅ TXT файл успешно создан!
                </div>
            )}
        </div>
    );
}