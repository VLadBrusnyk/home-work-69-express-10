const Assignment = require('../models/Assignment');

// @desc    Ініціалізація бази даних (очистка та додавання тестових даних)
// @route   POST /api/assignments/setup
const setupDatabase = async (req, res) => {
    try {
        await Assignment.deleteMany({});

        const students = [
            { name: "Артем", subject: "Математика", score: 82 },
            { name: "Ярослав", subject: "Фізика", score: 6 },
            { name: "Надія", subject: "Хімія", score: 93 },
            { name: "Любомир", subject: "Математика", score: 65 },
            { name: "Світлана", subject: "Фізика", score: 79 }
        ];

        await Assignment.insertMany(students);
        res.status(201).json({ message: 'База даних ініціалізована', count: students.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Отримати всіх студентів (або з фільтром по балу)
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
    try {
        const { minScore } = req.query;
        let query = {};

        if (minScore) {
            query.score = { $gt: Number(minScore) };
        }

        // Проекція: повертаємо всі поля за замовчуванням, 
        // але для завдання з проекцією можна додати логіку select
        const assignments = await Assignment.find(query);
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Отримати тільки імена та бали (Проекція)
// @route   GET /api/assignments/simple
const getSimpleAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({}, 'name score -_id');
        res.status(200).json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Додати бонусні бали студентам з низьким балом
// @route   PUT /api/assignments/bonus
const addBonusPoints = async (req, res) => {
    try {
        // Оновлення всіх студентів з score < 85
        const result = await Assignment.updateMany(
            { score: { $lt: 85 } },
            { $inc: { score: 5 } }
        );
        res.status(200).json({ message: 'Бонусні бали нараховано', result });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Видалити студента з найнижчим балом
// @route   DELETE /api/assignments/lowest
const deleteLowestScore = async (req, res) => {
    try {
        const lowest = await Assignment.findOne().sort({ score: 1 });

        if (lowest) {
            await lowest.deleteOne();
            res.status(200).json({ message: `Студента ${lowest.name} (бал: ${lowest.score}) видалено` });
        } else {
            res.status(404).json({ message: 'Студентів не знайдено' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Отримати статистику (Агрегація: середній бал > 75)
// @route   GET /api/assignments/stats
const getStats = async (req, res) => {
    try {
        const stats = await Assignment.aggregate([
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
        ]);
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Пошук за іменем з використанням індексу
// @route   GET /api/assignments/search
const searchByName = async (req, res) => {
    try {
        const { name } = req.query; // Наприклад: ?name=А
        if (!name) return res.status(400).json({ message: 'Параметр name обов\'язковий' });

        const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`^${escapedName}`);

        // Використовуємо explain, якщо передано параметр debug=true
        if (req.query.debug) {
            const explanation = await Assignment.find({ name: regex }).explain('executionStats');
            return res.status(200).json({ explanation });
        }

        const result = await Assignment.find({ name: regex });
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    setupDatabase,
    getAssignments,
    getSimpleAssignments,
    addBonusPoints,
    deleteLowestScore,
    getStats,
    searchByName
};
