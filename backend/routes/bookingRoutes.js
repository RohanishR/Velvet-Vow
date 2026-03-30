const express = require('express');
const router = express.Router();
const { createBooking, getVendorBookings, updateBookingStatus, getCustomerBookings } = require('../controllers/bookingController');
const auth = require('../middleware/authMiddleware');

// Protected Routes
router.post('/', auth, createBooking); // Customer
router.get('/customer', auth, getCustomerBookings); // Customer
router.get('/vendor', auth, getVendorBookings); // Vendor
router.put('/:id/status', auth, updateBookingStatus); // Vendor

module.exports = router;
