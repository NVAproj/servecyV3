import { useState } from 'react';
import { resultsRepository } from '../db/repositories';
import { useSurvey } from '../store/SurveyContext';

export default function ExportSummary() {
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

    // Экранирование XML символов
    const escapeXML = (str) => {
        if (!str) return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
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

    // Генерация XLS файла (XML формат)
    const generateXLS = (results) => {
        // Получаем все уникальные даты
        const allDates = new Set();
        results.forEach(result => {
            allDates.add(formatDate(result.submittedAt));
        });

        const sortedDates = Array.from(allDates).sort((a, b) => {
            return new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-'));
        });

        // ===== ЛИСТ 1: Сводка по дням =====
        const resultsByDate = {};
        results.forEach(result => {
            const dateKey = formatDate(result.submittedAt);
            if (!resultsByDate[dateKey]) {
                resultsByDate[dateKey] = [];
            }
            resultsByDate[dateKey].push(result);
        });

        const dailyRows = [
            ['Дата', 'Количество проголосовавших']
        ];

        sortedDates.forEach(date => {
            const dayResults = resultsByDate[date];
            dailyRows.push([
                date,
                dayResults.length
            ]);
        });

        // Итоговая строка
        dailyRows.push([
            'ИТОГО',
            results.length
        ]);

        // ===== ЛИСТ 2: Статистика по вопросам с разбивкой по датам =====
        // Создаем заголовки: Вопрос, Вариант ответа, Итого, затем даты
        const headerRow = ['Вопрос', 'Вариант ответа', 'ИТОГО'];
        sortedDates.forEach(date => {
            headerRow.push(date);
        });

        const statsRows = [headerRow];

        state.survey?.questions.forEach(question => {
            const respondentsCount = countRespondentsForQuestion(results, question.id);

            // Добавляем строку с вопросом (один раз)
            const questionRow = [
                `Вопрос ${question.id}: ${question.text}`,
                '',
                ''
            ];
            // Добавляем пустые ячейки для дат
            sortedDates.forEach(() => {
                questionRow.push('');
            });
            statsRows.push(questionRow);

            // Добавляем варианты ответов для этого вопроса
            question.options.forEach(option => {
                let totalCount = 0;

                // Считаем количество ответов по каждой дате
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

                const optionRow = [
                    '',
                    option.text,
                    totalCount
                ];

                // Добавляем количество по датам
                sortedDates.forEach(date => {
                    optionRow.push(countsByDate[date] || 0);
                });

                statsRows.push(optionRow);
            });

            // Добавляем строку с итогом по вопросу
            const totalRow = [
                '',
                `ИТОГО: Ответило ${respondentsCount} из ${results.length}`,
                respondentsCount
            ];

            // Добавляем итоги по датам
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
                totalRow.push(dateCount);
            });

            statsRows.push(totalRow);

            // Добавляем пустую строку между вопросами
            const emptyRow = ['', '', ''];
            sortedDates.forEach(() => {
                emptyRow.push('');
            });
            statsRows.push(emptyRow);
        });

        // Формируем XML для Excel
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:x="urn:schemas-microsoft-com:office:excel"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:html="http://www.w3.org/TR/REC-html40">
    <Styles>
        <Style ss:ID="Default" ss:Name="Normal">
            <Alignment ss:Vertical="Center"/>
            <Font ss:FontName="Arial" ss:Size="11"/>
        </Style>
        <Style ss:ID="Header">
            <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
            <Font ss:FontName="Arial" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
            <Interior ss:Color="#667eea" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="Total">
            <Alignment ss:Vertical="Center"/>
            <Font ss:FontName="Arial" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#f0f0f0" ss:Pattern="Solid"/>
        </Style>
        <Style ss:ID="Question">
            <Alignment ss:Vertical="Center"/>
            <Font ss:FontName="Arial" ss:Size="11" ss:Bold="1"/>
            <Interior ss:Color="#e8f5e9" ss:Pattern="Solid"/>
        </Style>
    </Styles>
    
    <Worksheet ss:Name="Сводка по дням">
        <Table>
            ${dailyRows.map((row, rowIndex) => `
                <Row>
                    ${row.map((cell, cellIndex) => `
                        <Cell ss:StyleID="${rowIndex === 0 ? 'Header' : rowIndex === dailyRows.length - 1 ? 'Total' : 'Default'}">
                            <Data ss:Type="${typeof cell === 'number' ? 'Number' : 'String'}">${escapeXML(String(cell))}</Data>
                        </Cell>
                    `).join('')}
                </Row>
            `).join('')}
        </Table>
    </Worksheet>
    
    <Worksheet ss:Name="Статистика по вопросам">
        <Table>
            ${statsRows.map((row, rowIndex) => {
            const isHeader = rowIndex === 0;
            const isTotal = row[0] === '' && row[1] && row[1].startsWith('ИТОГО');
            const isQuestion = row[0] && row[0].startsWith('Вопрос');

            let styleId = 'Default';
            if (isHeader) styleId = 'Header';
            else if (isTotal) styleId = 'Total';
            else if (isQuestion) styleId = 'Question';

            return `
                <Row>
                    ${row.map((cell, cellIndex) => `
                        <Cell ss:StyleID="${styleId}">
                            <Data ss:Type="${typeof cell === 'number' ? 'Number' : 'String'}">${escapeXML(String(cell))}</Data>
                        </Cell>
                    `).join('')}
                </Row>
            `}).join('')}
        </Table>
    </Worksheet>
</Workbook>`;

        return xmlContent;
    };

    // Скачивание файла
    const downloadFile = (content, filename) => {
        const blob = new Blob(['\uFEFF' + content], { type: 'application/vnd.ms-excel;charset=utf-8' });
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
            const xlsContent = generateXLS(results);

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `survey_report_${timestamp}.xls`;

            downloadFile(xlsContent, filename);

            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Ошибка при экспорте:', error);
            alert('Ошибка при создании файла Excel');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="export-summary">
            <button
                className="export-summary-button"
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? '⏳ Создание Excel...' : '📊 Выгрузить в Excel'}
            </button>

            {showSuccess && (
                <div className="export-summary-success">
                    ✅ Excel файл успешно создан!
                </div>
            )}
        </div>
    );
}