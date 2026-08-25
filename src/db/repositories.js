import { getDB } from './database';

// Survey Repository
export const surveyRepository = {
    async saveSurvey(surveyData) {
        const db = await getDB();
        await db.put('surveyBox', { id: 'survey_data', ...surveyData });
    },

    async getSurvey() {
        const db = await getDB();
        return await db.get('surveyBox', 'survey_data');
    },

    async hasSurvey() {
        const db = await getDB();
        const survey = await db.get('surveyBox', 'survey_data');
        return !!survey;
    }
};

// Session Repository
export const sessionRepository = {
    async saveSession(session) {
        const db = await getDB();
        await db.put('sessionBox', { id: 'current_session', ...session });
    },

    async getSession() {
        const db = await getDB();
        return await db.get('sessionBox', 'current_session');
    },

    async clearSession() {
        const db = await getDB();
        await db.delete('sessionBox', 'current_session');
    },

    async hasSession() {
        const db = await getDB();
        const session = await db.get('sessionBox', 'current_session');
        return !!session;
    }
};

// Results Repository
export const resultsRepository = {
    async saveResult(answers) {
        const db = await getDB();
        const result = {
            submittedAt: new Date().toISOString(),
            answersJson: JSON.stringify(answers),
        };
        return await db.add('resultsBox', result);
    },

    async getAllResults() {
        const db = await getDB();
        return await db.getAll('resultsBox');
    },

    async clearAllResults() {
        const db = await getDB();
        await db.clear('resultsBox');
    },

    async getResultsCount() {
        const db = await getDB();
        return await db.count('resultsBox');
    }
};