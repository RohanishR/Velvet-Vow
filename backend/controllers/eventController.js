const db = require('../config/db');

// @route   POST /api/events
// @desc    Create a new event
// @access  Private
exports.createEvent = async (req, res) => {
  const { name, members, event_date, contact_number, city, catering_type, event_type } = req.body;
  const customer_id = req.user.id;

  try {
    // Basic backend validation
    if (!name || !members || !event_date || !contact_number || !city || !catering_type || !event_type) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    if (members <= 0) {
      return res.status(400).json({ message: 'Number of members must be greater than 0.' });
    }

    const eventDateObj = new Date(event_date);
    if (eventDateObj <= new Date()) {
      return res.status(400).json({ message: 'Event date must be in the future.' });
    }

    if (!/^\d{10}$/.test(contact_number)) {
      return res.status(400).json({ message: 'Contact number must be exactly 10 digits.' });
    }

    // Insert into DB
    const [result] = await db.execute(
      `INSERT INTO Events 
        (customer_id, name, members, event_date, contact_number, city, catering_type, event_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_id, name, members, event_date, contact_number, city, catering_type, event_type]
    );

    res.status(201).json({
      message: 'Event created successfully!',
      eventId: result.insertId
    });
  } catch (err) {
    console.error('Error creating event: ', err);
    res.status(500).json({ message: 'Server Error creating event.' });
  }
};

// @route   GET /api/events/me
// @desc    Get events for the logged in user
// @access  Private
exports.getMyEvents = async (req, res) => {
  try {
    const customer_id = req.user.id;

    // Fetch events related to user
    const [events] = await db.execute(
      'SELECT * FROM Events WHERE customer_id = ? ORDER BY event_date ASC',
      [customer_id]
    );

    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events: ', err);
    res.status(500).json({ message: 'Server Error fetching events.' });
  }
};

// @route   DELETE /api/events/:id
// @desc    Delete an event securely
// @access  Private
exports.deleteEvent = async (req, res) => {
  try {
    const event_id = req.params.id;
    const customer_id = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM Events WHERE event_id = ? AND customer_id = ?',
      [event_id, customer_id]
    );

    if(result.affectedRows === 0) {
        return res.status(404).json({ message: 'Event not found or unauthorized.' });
    }

    res.status(200).json({ message: 'Event successfully deleted.' });
  } catch (err) {
    console.error('Error deleting event: ', err);
    res.status(500).json({ message: 'Server error trying to delete event.' });
  }
};
