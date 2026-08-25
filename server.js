import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3035;

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Путь к собранным файлам
const distPath = path.join(__dirname, 'dist');

// Проверяем наличие dist
if (!fs.existsSync(distPath)) {
    console.error('❌ Папка dist не найдена! Выполните: npm run build');
    process.exit(1);
}

// Раздаем статические файлы
app.use(express.static(distPath));

// Для всех остальных маршрутов отдаем index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Запускаем сервер
app.listen(PORT, '0.0.0.0', () => {
    const localIP = getLocalIP();
    console.log('========================================');
    console.log('🚀 Сервер запущен!');
    console.log(`📍 Локально: http://localhost:${PORT}`);
    console.log(`🌐 По сети: http://${localIP}:${PORT}`);
    console.log('========================================');
});

function getLocalIP() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}