// ДЗ 69.1. Операції з базами даних і документами в Mongo Shell

// --- ЗАВДАННЯ 1: Базові операції ---

// 1. Створіть нову базу даних studentDB.
// У скрипті ми перемикаємось на неї. Якщо ви в консолі - введіть: use studentDB
db = db.getSiblingDB('studentDB');

// Очистимо колекцію перед запуском, щоб уникнути дублікатів при повторному виконанні
db.assignments.drop();

// 2. Додайте до колекції assignments п'ять документів
// (name, subject, score)
db.assignments.insertMany([
    { name: "Марія", subject: "Математика", score: 88 },
    { name: "Олег", subject: "Фізика", score: 75 },
    { name: "Олександр", subject: "Хімія", score: 92 },
    { name: "Олексій", subject: "Математика", score: 65 },
    { name: "Дмитро", subject: "Фізика", score: 81 }
]);
print("Додано 5 документів.");

// 3. Виконайте запит, щоб знайти всі документи, де score більше 80.
print("\n--- Студенти з балом > 80 ---");
const highScores = db.assignments.find({ score: { $gt: 80 } }).toArray();
printjson(highScores);

// 4. Оновіть один з документів, збільшивши score на 5 балів для студента, який має менше 85 балів.
// Використовуємо updateOne для оновлення першого знайденого
db.assignments.updateOne(
    { score: { $lt: 85 } },
    { $inc: { score: 5 } }
);
print("\n--- Оновлено один документ (score < 85 -> +5 балів) ---");

// 5. Видаліть документ для студента, який має найнижчий бал.
// Знаходимо документ з найменшим балом
const lowestScoreStudent = db.assignments.find().sort({ score: 1 }).limit(1).next();

if (lowestScoreStudent) {
    db.assignments.deleteOne({ _id: lowestScoreStudent._id });
    print(`\n--- Видалено студента з найнижчим балом: ${lowestScoreStudent.name} (Бал: ${lowestScoreStudent.score}) ---`);
}

// 6. Використайте команду find() з проекцією, щоб вивести тільки ім'я та бал студента.
print("\n--- Проекція (тільки ім'я та бал) ---");
const projections = db.assignments.find({}, { name: 1, score: 1, _id: 0 }).toArray();
printjson(projections);


// --- ЗАВДАННЯ 2 (не обов'язкове): Агрегаційні операції ---
print("\n========================================");
print("ЗАВДАННЯ 2: Агрегація");
print("========================================");

// Групує документи за предметом та обчислює середній бал за кожним предметом.
// Фільтрує результати для виведення тільки тих предметів, де середній бал вище 75.
const aggResult = db.assignments.aggregate([
    {
        $group: {
            _id: "$subject",
            averageScore: { $avg: "$score" }
        }
    },
    {
        $match: {
            averageScore: { $gt: 75 }
        }
    }
]).toArray();

print("Середній бал по предметах (> 75):");
printjson(aggResult);


// --- ЗАВДАННЯ 3 (не обов'язкове): Робота з індексами ---
print("\n========================================");
print("ЗАВДАННЯ 3: Індекси");
print("========================================");

// 1. Створіть унікальний індекс для поля name
db.assignments.createIndex({ name: 1 }, { unique: true });
print("Створено унікальний індекс для поля 'name'.");

// 2. Виконайте запит пошуку, який використовує цей індекс, для вибірки документів, 
// де ім'я студента починається на літеру 'А'. 
// (Використовуємо регулярний вираз ^А)
print("\n--- Пошук студентів на літеру 'А' ---");
const nameQuery = { name: /^А/ };
const studentsA = db.assignments.find(nameQuery).toArray();
printjson(studentsA);

// 3. Аналізуйте час виконання запиту до та після створення індексу, використовуючи explain()
print("\n--- Explain (executionStats) ---");
const explanation = db.assignments.find(nameQuery).explain("executionStats");
print("Кількість переглянутих документів (totalDocsExamined): " + explanation.executionStats.totalDocsExamined);
print("Час виконання (executionTimeMillis): " + explanation.executionStats.executionTimeMillis);
print("Використаний план (stage): " + explanation.executionStats.executionStages.stage); // Має бути IXSCAN або FETCH з IXSCAN
