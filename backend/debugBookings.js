const db = require('./config/db');

async function debugBookings() {
    try {
        const query = `
          SELECT 
            b.booking_id, 
            b.status, 
            v.name AS hallName, 
            u.name AS customerName, 
            b.event_date AS eventDate
          FROM Bookings b
          JOIN Events e ON b.event_id = e.event_id
          JOIN Users u ON e.customer_id = u.user_id
          JOIN Venues v ON b.venue_id = v.venue_id
        `;
        const [requests] = await db.execute(query);
        const [rawBookings] = await db.execute("SELECT * FROM Bookings");
        const fs = require('fs');
        fs.writeFileSync('debug.json', JSON.stringify({ joined: requests, raw: rawBookings }, null, 2));
        process.exit(0);
    } catch(err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}
debugBookings();
