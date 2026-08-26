# 📋 Оглавление

1. [Общее описание проекта](#1-общее-описание-проекта)
2. [Структура проекта](#2-структура-проекта)
3. [Архитектура и ключевые решения](#3-архитектура-и-ключевые-решения)
   - 3.1 [Управление состоянием (SurveyContext)](#31-управление-состоянием-surveycontext)
   - 3.2 [Хранилище (IndexedDB)](#32-хранилище-indexeddb)
   - 3.3 [Таймер неактивности (useTimer)](#33-таймер-неактивности-usetimer)
   - 3.4 [Условная логика вопросов (dependsOn)](#34-условная-логика-вопросов-dependson)
4. [Административная панель](#4-административная-панель)
   - 4.1 [Вход (AdminLogin)](#41-вход-adminlogin)
   - 4.2 [Статистика (AdminStats)](#42-статистика-adminstats)
5. [Экспорт данных](#5-экспорт-данных)
   - 5.1 [ExportSummary (Excel)](#51-exportsummary-excel)
   - 5.2 [ExportTxt (TXT)](#52-exporttxt-txt)
6. [PWA и установка (InstallPrompt)](#6-pwa-и-установка-installprompt)
7. [Тестирование хранилища (StorageTestPanel)](#7-тестирование-хранилища-storagetestpanel)
8. [Потоки данных](#8-потоки-данных)
9. [Валидация (validation.js)](#9-валидация-validationjs)
10. [Потенциальные улучшения](#10-потенциальные-улучшения)

---

# 📋 AEROFUELS — Опрос пассажиров

## 1. Общее описание проекта

**Название:** AEROFUELS Survey App  
**Тип:** Progressive Web App (PWA) для проведения анонимного опроса пассажиров аэропорта  
**Цель:** Сбор статистики о предпочтениях пассажиров, частоте полетов и выборе аэропортов для улучшения сервиса аэропорта Нижневартовск

**Стек технологий:**
- React (функциональные компоненты, хуки)
- IndexedDB (idb) для локального хранения
- CSS (собственная стилизация, без UI-библиотек)
- PWA-возможности (установка на устройство)

---

## 2. Структура проекта

```js
src/
├── components/
│   ├── AdminLogin.jsx          # Форма входа для администратора
│   ├── AdminStats.jsx          # Панель статистики + управление БД
│   ├── ExportSummary.jsx       # Экспорт в Excel (.xls)
│   ├── ExportTxt.jsx           # Экспорт в TXT
│   ├── InstallPrompt.jsx       # Предложение установить PWA
│   ├── QuestionRenderer.jsx    # Рендер вопроса (single/multiple)
│   ├── StorageTestPanel.jsx    # Панель тестирования хранилища
│   ├── SuccessScreen.jsx       # Экран успешного завершения
│   ├── SurveyScreen.jsx        # Основной экран опроса
│   ├── TimerDialog.jsx         # Диалог неактивности (таймер)
│   └── WelcomeScreen.jsx       # Приветственный экран
├── db/
│   ├── database.js             # Инициализация IndexedDB
│   └── repositories.js         # CRUD-операции над хранилищами
├── hooks/
│   └── useTimer.js             # Хук для таймера неактивности
├── store/
│   └── SurveyContext.jsx       # Глобальное состояние (Context + Reducer)
├── utils/
│   ├── statistics.js           # Расчет статистики по результатам
│   └── validation.js           # Валидация ответов
├── data/
│   └── defaultSurvey.js        # Стандартный опросник (ТЗ)
└── test/
    └── test-storage-fill.js    # Тест заполнения хранилища
```

---

## 3. Архитектура и ключевые решения

### 3.1 Управление состоянием (SurveyContext)

Используется **React Context + useReducer** для глобального состояния.

**Состояние:**
```js
{
  survey: null,          // Данные опроса
  currentAnswers: {},    // { questionId: [optionIds] }
  sessionId: null,
  startedAt: null,
  lastActivity: null,
  showWarning: false,    // Показывать предупреждение
  isSubmitting: false,
  showSuccess: false,
  loading: true,
  error: null
}
```

**Основные действия (dispatch):**
- `SET_ANSWER` / `CLEAR_ANSWER`
- `SHOW_WARNING` / `HIDE_WARNING`
- `CLEAR_SESSION`
- `SHOW_SUCCESS`

---

### 3.2 Хранилище (IndexedDB)

Три объектных хранилища:

| Хранилище | Назначение |
|-----------|------------|
| `surveyBox` | Хранение структуры опроса (ключ `survey_data`) |
| `sessionBox` | Текущая сессия пользователя (ответы + время) |
| `resultsBox` | Все сохраненные ответы (история) |

**Ключевые методы репозиториев:**
```js
surveyRepository.saveSurvey()
surveyRepository.getSurvey()

sessionRepository.saveSession()
sessionRepository.getSession()
sessionRepository.clearSession()

resultsRepository.saveResult()
resultsRepository.getAllResults()
resultsRepository.clearAllResults()
```

---

### 3.3 Таймер неактивности (useTimer)

**Логика:**
- После **25 секунд** бездействия → показывается диалог `TimerDialog`
- После **35 секунд** → сессия автоматически очищается

**Реализация:** два `setTimeout` с автоматическим сбросом при изменении ответов.

---

### 3.4 Условная логика вопросов (dependsOn)

Вопросы могут зависеть от ответов на предыдущие.  
Пример: вопрос 2 показывается только если в вопросе 1 выбран вариант "Реже".

```js
dependsOn: {
  questionId: 1,
  optionIds: [3]
}
```

Реализовано через фильтрацию `visibleQuestions` в `SurveyScreen`.

---


## 4. Административная панель

### 4.1 Вход (AdminLogin)
- Данные в компоненте (я понимаю, что поступаю плохо)

### 4.2 Статистика (AdminStats)

**Функциональность:**
- Отображение общего количества отправленных анкет
- Процентное распределение ответов по каждому вопросу (визуальные бары)
- Информация о хранилище (занято/свободно в байтах, %)
- Очистка всей базы данных
- Экспорт в Excel (.xls) с двумя листами:
  - Сводка по дням
  - Статистика по вопросам с разбивкой по датам
- Экспорт в TXT (текстовый отчет с таблицами)

---

## 5. Экспорт данных

### 5.1 ExportSummary (Excel)
- Генерирует XML-файл, совместимый с Excel
- Два листа: "Сводка по дням" и "Статистика по вопросам"
- Даты форматируются как `DD.MM.YYYY`

### 5.2 ExportTxt (TXT)
- Генерирует структурированный текстовый отчет
- Разделы: сводка по дням + статистика по вопросам
- Использует моноширинное выравнивание (padText)

---

## 6. PWA и установка (InstallPrompt)

- Отслеживает событие `beforeinstallprompt`
- Показывает кнопку "Установить" через 2 секунды после загрузки
- Скрывается, если приложение уже запущено в standalone-режиме

---

## 7. Тестирование хранилища (StorageTestPanel)

Предназначен для проверки работы IndexedDB при заполнении:
- Заполнить до 1.5% доступного места
- Добавить 100 тестовых голосов
- Очистить тестовые данные

Использует `storageFillTest` для генерации случайных ответов.

---

## 8. Потоки данных

```
Пользователь → WelcomeScreen → SurveyScreen
    ↓
Ответы → SurveyContext (currentAnswers)
    ↓
Автосохранение → sessionRepository (IndexedDB)
    ↓
Отправка → resultsRepository.saveResult()
    ↓
SuccessScreen → возврат на WelcomeScreen
```

**Администратор:**
```
WelcomeScreen → AdminLogin → AdminStats
    ↓
Загрузка результатов → resultsRepository.getAllResults()
    ↓
Расчет статистики → calculateStatistics()
    ↓
Экспорт / Очистка БД
```

---

## 9. Валидация (validation.js)

- Проверка обязательных вопросов
- Для `single`: ровно 1 выбранный вариант
- Для `multiple`: не более `maxSelections`
- Условная валидация только для видимых вопросов

---

## 10. Потенциальные улучшения

| Область | Предложение |
|---------|-------------|
| Безопасность | Вынести логин/пароль в переменные окружения (.env) |
| Экспорт | Добавить экспорт в CSV и JSON |
| Тесты | Добавить unit-тесты для calculateStatistics и validation |

---

![alt text](/readmeData/image.png)
![alt text](/readmeData/image-1.png)
![alt text](/readmeData/image-2.png)
![alt text](/readmeData/image-3.png)