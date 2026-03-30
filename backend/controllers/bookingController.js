const db = require('../config/db');

// @route   POST /api/bookings
// @desc    Customer creates a booking precisely tied to an event ID
// @access  Private (Customer)
exports.createBooking = async (req, res) => {
  const { event_id, venue_id, event_date } = req.body;
  const customer_id = req.user.id;

  if (req.user.role !== 'customer') {
    return res.status(403).json({ message: 'Only customers can book venues.' });
  }

  if (!event_id || !venue_id || !event_date) {
    return res.status(400).json({ message: 'Event ID, Venue ID, and Event Date are strictly required.' });
  }

  try {
    // 1. Authenticate this event actually belongs to the user
    // (A malicious user could potentially pass someone else's event_id otherwise)
    const [eventAuth] = await db.execute('SELECT event_id FROM Events WHERE event_id = ? AND customer_id = ?', [event_id, customer_id]);
    if(eventAuth.length === 0) {
      return res.status(403).json({ message: 'Unauthorized event mapping.' });
    }

    // 2. Safely INSERT validating uniqueness via SQL engine natively
    const [result] = await db.execute(
      `INSERT INTO Bookings (event_id, venue_id, event_date, status)
       SELECT ?, ?, ?, 'Pending' FROM DUAL
       WHERE NOT EXISTS (
           SELECT 1 FROM Bookings
           WHERE venue_id = ? AND event_date = ?
       )`,
      [event_id, venue_id, event_date, venue_id, event_date]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'This venue is already fully booked for that specific date!' });
    }

    res.status(201).json({ message: 'Booking request sent successfully!', bookingId: result.insertId });
  } catch (err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ message: 'Server error processing your booking request.' });
  }
};

// @route   GET /api/bookings/vendor
// @desc    Vendor fetches all incoming booking requests across all venues
// @access  Private (Vendor)
exports.getVendorBookings = async (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  try {
    const query = `
      SELECT 
        b.booking_id, 
        b.status, 
        v.name AS hallName, 
        u.name AS customerName, 
        b.event_date AS eventDate,
        v.price AS venuePrice
      FROM Bookings b
      JOIN Events e ON b.event_id = e.event_id
      JOIN Users u ON e.customer_id = u.user_id
      JOIN Venues v ON b.venue_id = v.venue_id
      ORDER BY b.created_at DESC
    `;
    const [requests] = await db.execute(query);
    res.status(200).json(requests);
  } catch (err) {
    console.error('Vendor generic fetch error:', err);
    res.status(500).json({ message: 'Server error fetching vendor booking requests.' });
  }
};

// @route   PUT /api/bookings/:id/status
// @desc    Vendor accepts or rejects a booking globally
// @access  Private (Vendor)
exports.updateBookingStatus = async (req, res) => {
  const booking_id = req.params.id;
  const { status } = req.body;

  if (req.user.role !== 'vendor') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  if (status !== 'Accepted' && status !== 'Rejected') {
    return res.status(400).json({ message: 'Invalid status update.' });
  }

  try {
    const [authCheck] = await db.execute(`
      SELECT b.booking_id FROM Bookings b
      WHERE b.booking_id = ?
    `, [booking_id]);

    if(authCheck.length === 0) {
      return res.status(404).json({ message: 'Booking request not found.' });
    }

    await db.execute('UPDATE Bookings SET status = ? WHERE booking_id = ?', [status, booking_id]);
    
    res.status(200).json({ message: `Booking successfully ${status}.` });
  } catch (err) {
    console.error('Vendor status update error:', err);
    res.status(500).json({ message: 'Server error updating booking status.' });
  }
};

// @route   GET /api/bookings/customer
// @desc    Customer fetches their combined event+booking status
// @access  Private (Customer)
exports.getCustomerBookings = async (req, res) => {
    const customer_id = req.user.id;
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied.' });
    }
    
    try {
        const query = `
            SELECT 
                b.booking_id as id,
                e.name as eventName,
                v.name as hallName,
                b.event_date as eventDate,
                b.status
            FROM Bookings b
            JOIN Events e ON b.event_id = e.event_id
            JOIN Venues v ON b.venue_id = v.venue_id
            WHERE e.customer_id = ?
            ORDER BY b.created_at DESC
        `;
        const [customerBookings] = await db.execute(query, [customer_id]);
        res.status(200).json(customerBookings);
    } catch(err) {
        console.error('Customer booking fetch error:', err);
        res.status(500).json({ message: 'Server error retrieving booking statuses.' });
    }
}
