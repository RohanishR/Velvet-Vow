const db = require('../config/db');

// @route   GET /api/venues
// @desc    Get all available wedding venues (Optional: filter by city)
// @access  Public
exports.getVenues = async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = 'SELECT venue_id as id, name, location, city, price, image, latitude, longitude FROM Venues';
    let params = [];

    if (city) {
      query += ' WHERE city = ?';
      params.push(city);
    }

    const [venues] = await db.execute(query, params);
    res.status(200).json(venues);
  } catch (err) {
    console.error('Error fetching venues:', err);
    res.status(500).json({ message: 'Server error retrieving venues' });
  }
};

// @route   GET /api/venues/nearby
// @desc    Get venues securely via Haversine 10km GPS radius
// @access  Public
exports.getNearbyVenues = async (req, res) => {
  try {
    const { lat, lon } = req.query;
    const radius = 10; // 10 kilometers

    if (!lat || !lon) {
      return res.status(400).json({ message: 'Latitude and Longitude are strictly required.' });
    }

    const query = `
      SELECT venue_id as id, name, location, city, price, image, latitude, longitude,
      ( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance 
      FROM Venues 
      HAVING distance < ? 
      ORDER BY distance
    `;
    
    // Convert to numbers securely before hitting SQL binding logic
    const safeLat = parseFloat(lat);
    const safeLon = parseFloat(lon);

    const [venues] = await db.execute(query, [safeLat, safeLon, safeLat, radius]);
    res.status(200).json(venues);
  } catch (err) {
    console.error('GPS parsing error:', err);
    res.status(500).json({ message: 'Server error calculating geographical distances.' });
  }
};
