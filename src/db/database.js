import { openDB } from 'idb';

const DB_NAME = 'surveyDB';
const DB_VERSION = 1;

export async function initDatabase() {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            // Store для опроса (статичные данные)
            if (!db.objectStoreNames.contains('surveyBox')) {
                db.createObjectStore('surveyBox', { keyPath: 'id' });
            }

            // Store для текущей сессии
            if (!db.objectStoreNames.contains('sessionBox')) {
                db.createObjectStore('sessionBox', { keyPath: 'id' });
            }

            // Store для результатов
            if (!db.objectStoreNames.contains('resultsBox')) {
                const store = db.createObjectStore('resultsBox', {
                    keyPath: 'id',
                    autoIncrement: true
                });
                store.createIndex('submittedAt', 'submittedAt');
            }
        },
    });
}

export async function getDB() {
    return await initDatabase();
}