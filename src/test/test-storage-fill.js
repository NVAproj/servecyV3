// test-storage-fill.js
import { resultsRepository } from '../db/repositories';

export class StorageFillTest {
    constructor() {
        this.testResults = [];
        this.votesCount = 0;
    }

    // Генерация тестовых данных для одного голосования
    generateTestVote(survey) {
        // Генерируем ответы в формате, который ожидает calculateStatistics
        const answers = survey.questions.map(question => {
            return {
                q: question.id,  // Используем "q" как в обычных ответах
                a: this.generateRandomAnswer(question)  // Всегда массив ID
            };
        });

        const vote = {
            submittedAt: new Date().toISOString(),
            answersJson: JSON.stringify(answers)  // Сохраняем как JSON строку
        };

        return vote;
    }

    // Генерация случайного ответа - всегда возвращает массив ID
    generateRandomAnswer(question) {
        if (!question.options || question.options.length === 0) {
            return [];
        }

        if (question.type === 'single' || question.type === 'radio') {
            // Для одиночного выбора - массив с одним ID
            const randomIndex = Math.floor(Math.random() * question.options.length);
            return [question.options[randomIndex].id];

        } else if (question.type === 'multiple' || question.type === 'checkbox') {
            // Для множественного выбора - массив с несколькими ID
            const count = 1 + Math.floor(Math.random() * question.options.length);
            const shuffled = [...question.options].sort(() => Math.random() - 0.5);
            return shuffled.slice(0, count).map(option => option.id);

        } else if (question.type === 'text') {
            // Для текстового ответа - ID текстового поля (если есть)
            // Или генерируем специальный ID для текста
            return [this.generateRandomText()];

        } else {
            // Для других типов - случайный ID
            const randomIndex = Math.floor(Math.random() * question.options.length);
            return [question.options[randomIndex].id];
        }
    }

    // Генерация случайного текста
    generateRandomText() {
        const words = ['отлично', 'хорошо', 'нормально', 'плохо', 'ужасно',
            'быстро', 'медленно', 'удобно', 'неудобно', 'чисто',
            'грязно', 'вежливо', 'грубо', 'комфортно', 'шумно'];
        const count = 3 + Math.floor(Math.random() * 10);
        return Array.from({ length: count }, () =>
            words[Math.floor(Math.random() * words.length)]
        ).join(' ');
    }

    // Альтернативный метод для генерации ответов в формате questionId/optionId
    generateTestVoteAlternative(survey) {
        const answers = survey.questions.map(question => {
            const selectedOptions = this.generateRandomAnswer(question);

            return {
                questionId: question.id,
                optionIds: selectedOptions
            };
        });

        return {
            submittedAt: new Date().toISOString(),
            answersJson: JSON.stringify(answers)
        };
    }

    // Получение текущего размера хранилища
    async getStorageInfo() {
        const estimate = await navigator.storage.estimate();
        return {
            quota: estimate.quota,
            usage: estimate.usage,
            percentUsed: (estimate.usage / estimate.quota) * 100
        };
    }

    // Заполнение хранилища голосами
    async fillStorageWithVotes(survey, targetPercent = 1.5) {
        console.log('🚀 Начало теста заполнения памяти');

        const initialStorage = await this.getStorageInfo();
        console.log(`📊 Начальное состояние: ${(initialStorage.usage / 1024 / 1024).toFixed(2)} МБ (${initialStorage.percentUsed.toFixed(2)}%)`);

        let currentPercent = initialStorage.percentUsed;
        let votes = [];
        const batchSize = 10;

        while (currentPercent < targetPercent) {
            // Создаем пакет голосов
            const batch = [];
            for (let i = 0; i < batchSize; i++) {
                const vote = this.generateTestVote(survey);
                batch.push(vote);
                votes.push(vote);
                this.votesCount++;
            }

            // Сохраняем пакет
            await resultsRepository.saveResults(batch);

            // Обновляем информацию о хранилище
            const storage = await this.getStorageInfo();
            currentPercent = storage.percentUsed;

            console.log(`📦 Добавлено ${batchSize} голосов. Всего: ${this.votesCount}`);
            console.log(`💾 Память: ${(storage.usage / 1024 / 1024).toFixed(2)} МБ (${currentPercent.toFixed(2)}%)`);

            // Небольшая пауза для обновления UI
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Тест завершен!`);
        console.log(`📊 Итоговое состояние: ${(currentPercent.toFixed(2))}%)`);
        console.log(`🗳️ Всего голосов: ${this.votesCount}`);

        return {
            votesCount: this.votesCount,
            initialPercent: initialStorage.percentUsed,
            finalPercent: currentPercent,
            votes
        };
    }

    // Тест с фиксированным количеством голосов
    async testWithFixedVotes(survey, count = 100) {
        console.log(`🚀 Тест с ${count} голосами`);

        const initialStorage = await this.getStorageInfo();
        console.log(`📊 До теста: ${(initialStorage.usage / 1024 / 1024).toFixed(2)} МБ (${initialStorage.percentUsed.toFixed(2)}%)`);

        const votes = [];
        for (let i = 0; i < count; i++) {
            const vote = this.generateTestVote(survey);
            votes.push(vote);
            await resultsRepository.saveResult(vote);

            if (i % 10 === 0) {
                console.log(`📦 Прогресс: ${i}/${count}`);
            }
        }

        const finalStorage = await this.getStorageInfo();
        const usedSpace = finalStorage.usage - initialStorage.usage;

        console.log(`✅ Добавлено ${count} голосов`);
        console.log(`💾 Занято памяти: ${(usedSpace / 1024 / 1024).toFixed(2)} МБ`);
        console.log(`📊 Итоговое состояние: ${finalStorage.percentUsed.toFixed(2)}%`);

        return {
            votesCount: count,
            usedSpace,
            percentIncrease: finalStorage.percentUsed - initialStorage.percentUsed
        };
    }

    // Очистка тестовых данных
    async cleanup() {
        console.log('🧹 Очистка тестовых данных...');
        const allResults = await resultsRepository.getAllResults();

        // Ищем тестовые записи по разным признакам
        const testResults = allResults.filter(r => {
            const answersJson = r.answersJson;
            return answersJson && (
                answersJson.includes('"id":"test-') ||
                answersJson.includes('test-')
            );
        });

        for (const result of testResults) {
            await resultsRepository.deleteResult(result.id);
        }

        console.log(`✅ Удалено ${testResults.length} тестовых записей`);
    }
}

// Экспорт для использования в компоненте
export const storageFillTest = new StorageFillTest();