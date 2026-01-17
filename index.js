const { MongoClient } = require('mongodb');

// URL підключення до локальної бази даних
const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

// Ім'я бази даних
const dbName = 'studentDB';

async function main() {
    try {
        // Підключення до клієнта
        await client.connect();
        console.log('Успішно підключено до сервера MongoDB');

        const db = client.db(dbName);
        const collection = db.collection('assignments');

        // --- ЗАВДАННЯ 1: Базові операції ---

        // 1. Очистка колекції для чистого старту
        await collection.deleteMany({});
        console.log('\nКолекцію очищено.');

        // 2. Додавання 5 документів
        const students = [
            { name: "Олена", subject: "Math", score: 78 },
            { name: "Ігор", subject: "Physics", score: 82 },
            { name: "Марія", subject: "Chemistry", score: 90 },
            { name: "Анна", subject: "Math", score: 84 },
            { name: "Петро", subject: "Physics", score: 65 }
        ];
        await collection.insertMany(students);
        console.log('Додано 5 документів.');

        // 3. Пошук (score > 80)
        console.log('\n--- Студенти з балом > 80 ---');
        const highScores = await collection.find({ score: { $gt: 80 } }).toArray();
        console.log(highScores);

        // 4. Оновлення (score < 85 -> +5)
        await collection.updateOne(
            { score: { $lt: 85 } },
            { $inc: { score: 5 } }
        );
        console.log('\n--- Оновлено один документ (score < 85 -> +5 балів) ---');

        // 5. Видалення (найнижчий бал)
        const lowestScoreStudent = await collection.find().sort({ score: 1 }).limit(1).next();
        if (lowestScoreStudent) {
            await collection.deleteOne({ _id: lowestScoreStudent._id });
            console.log(`\n--- Видалено студента з найнижчим балом: ${lowestScoreStudent.name} (Бал: ${lowestScoreStudent.score}) ---`);
        }

        // 6. Проекція (тільки ім'я та бал)
        console.log('\n--- Проекція (тільки ім\'я та бал) ---');
        const projections = await collection.find({}, { projection: { name: 1, score: 1, _id: 0 } }).toArray();
        console.log(projections);


        // --- ЗАВДАННЯ 2: Агрегація ---
        console.log('\n========================================');
        console.log('ЗАВДАННЯ 2: Агрегація');
        console.log('========================================');

        const aggResult = await collection.aggregate([
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

        console.log('Середній бал по предметах (> 75):');
        console.log(aggResult);


        // --- ЗАВДАННЯ 3: Індекси ---
        console.log('\n========================================');
        console.log('ЗАВДАННЯ 3: Індекси');
        console.log('========================================');

        // 1. Створення унікального індексу
        await collection.createIndex({ name: 1 }, { unique: true });
        console.log("Створено унікальний індекс для поля 'name'.");

        // 2. Пошук з використанням регулярного виразу
        console.log("\n--- Пошук студентів на літеру 'А' ---");
        const studentsA = await collection.find({ name: /^А/ }).toArray();
        console.log(studentsA);

        // 3. Explain (Для Node.js драйвера explain викликається на самому курсорі)
        // Примітка: explain повертає об'єкт, який може відрізнятись структурою від Mongo Shell
        console.log("\n--- Explain (executionStats) ---");
        const explanation = await collection.find({ name: /^А/ }).explain("executionStats");

        // Виведення важливих частин. Структура explain може бути трохи іншою в драйвері.
        const stats = explanation.executionStats;
        if (stats) {
            console.log("Кількість переглянутих документів (totalDocsExamined): " + stats.totalDocsExamined);
            console.log("Час виконання (executionTimeMillis): " + stats.executionTimeMillis);
            // План може бути глибоко вкладеним
            console.log("Успішно отримано план виконання.");
        } else {
            console.log("Explain не повернув executionStats (можливо, версія сервера відрізняється).");
        }

    } catch (err) {
        console.error('Помилка:', err);
    } finally {
        await client.close();
        console.log('\nЗ\'єднання закрито.');
    }
}

main();
