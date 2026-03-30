const express = require('express');
const router = express.Router();
const { createEvent, getMyEvents } = require('../controllers/eventController');
const auth = require('../middleware/authMiddleware');

// Protected Routes (Require JWT tokens)
router.post('/', auth, createEvent);
router.get('/me', auth, getMyEvents);

module.exports = router;
