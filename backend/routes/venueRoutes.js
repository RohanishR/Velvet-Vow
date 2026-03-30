const express = require('express');
const router = express.Router();
const { getVenues, getNearbyVenues } = require('../controllers/venueController');

router.get('/nearby', getNearbyVenues);
router.get('/', getVenues);

module.exports = router;
