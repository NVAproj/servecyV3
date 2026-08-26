export const defaultSurvey = {
    title: "Опрос пассажиров",
    img: './icons/logo.png',
    description: "Пожалуйста, ответьте на несколько вопросов",
    questions: [
        {
            id: 1,
            text: "Как изменилась частота ваших полетов за последний год?",
            type: "single",
            required: true,
            options: [
                { id: 1, text: "Стал(а) летать чаще" },
                { id: 2, text: "Примерно так же" },
                { id: 3, text: "Стал(а) летать реже" }
            ]
        },
        {
            id: 2,
            text: "Если вы стали летать реже, укажите причины (не более 2):",
            type: "multiple",
            maxSelections: 2,
            required: true,
            dependsOn: {
                questionId: 1,
                optionIds: [3] // Показывать только если в Q1 выбран ответ "Реже"
            },
            options: [
                { id: 1, text: "Дорогие билеты" },
                { id: 2, text: "Меньше командировок/поездок" },
                { id: 3, text: "Нет прямых рейсов" },
                { id: 4, text: "Неудобное расписание" },
                { id: 5, text: "Другое" }
            ]
        },
        {
            id: 3,
            text: "Выбираете ли вы другой аэропорт вместо Нижневартовска?",
            type: "single",
            required: true,
            options: [
                { id: 1, text: "Да, Сургут" },
                { id: 2, text: "Да, Ханты-Мансийск" },
                { id: 3, text: "Да, Тюмень" },
                { id: 4, text: "Да, Екатеринбург" },
                { id: 5, text: "Да, другой аэропорт" },
                { id: 6, text: "Нет, выбираю Нижневартовск" }
            ]
        },
        {
            id: 4,
            text: "Почему вы выбираете другой аэропорт? (не более 2):",
            type: "multiple",
            maxSelections: 2,
            required: true,
            dependsOn: {
                questionId: 3,
                optionIds: [1, 2, 3, 4, 5] // Показывать если выбран любой аэропорт кроме Нижневартовска
            },
            options: [
                { id: 1, text: "Дешевле билеты" },
                { id: 2, text: "Есть прямые рейсы" },
                { id: 3, text: "Удобное расписание" },
                { id: 4, text: "Ближе добираться" },
                { id: 5, text: "Другое" }
            ]
        },
        {
            id: 5,
            text: "Что могло бы привлечь вас летать из Нижневартовска? (не более 2):",
            type: "multiple",
            maxSelections: 2,
            required: true,
            options: [
                { id: 1, text: "Низкие цены на билеты" },
                { id: 2, text: "Новые направления" },
                { id: 3, text: "Удобное расписание" },
                { id: 4, text: "Прямые рейсы" },
                { id: 5, text: "Комфортные самолеты" },
                { id: 6, text: "Бонусные программы" }
            ]
        }
    ]
};