const express = require('express');
const router = express.Router();
const { createEvent, getMyEvents, deleteEvent } = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

// Protected Routes (Require JWT tokens)
router.post('/', auth, createEvent);
router.get('/me', auth, getMyEvents);
router.delete('/:id', auth, deleteEvent);

module.exports = router;
