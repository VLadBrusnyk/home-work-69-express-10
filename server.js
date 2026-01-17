require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Підключення до бази даних
connectDB();

// Middleware для парсингу JSON
app.use(express.json());

// Маршрути
app.use('/api/assignments', assignmentRoutes);

// Базовий маршрут
app.get('/', (req, res) => {
    res.send('API працює. Використовуйте /api/assignments для доступу до даних.');
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на порту ${PORT}`);
});
