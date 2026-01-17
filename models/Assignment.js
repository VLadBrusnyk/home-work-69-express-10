const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true // Завдання 3: Унікальний індекс
    },
    subject: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
