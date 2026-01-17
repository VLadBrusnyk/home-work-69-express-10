const express = require('express');
const router = express.Router();
const {
    setupDatabase,
    getAssignments,
    getSimpleAssignments,
    addBonusPoints,
    deleteLowestScore,
    getStats,
    searchByName
} = require('../controllers/assignmentController');

router.post('/setup', setupDatabase);
router.get('/', getAssignments);
router.get('/simple', getSimpleAssignments);
router.put('/bonus', addBonusPoints);
router.delete('/lowest', deleteLowestScore);
router.get('/stats', getStats);
router.get('/search', searchByName);

module.exports = router;
