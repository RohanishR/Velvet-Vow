const db = require('./config/db');

async function insertTempVenues() {
    try {
        // Grab the first available Vendor to logically own these venues safely!
        const [vendors] = await db.execute("SELECT user_id FROM Users WHERE role = 'vendor' LIMIT 1");
        
        if(vendors.length === 0) {
            console.log("NO_VENDOR_FOUND");
            process.exit(0);
        }
        
        const vendorId = vendors[0].user_id;

        const venues = [
            [vendorId, 'Chennai', 'Leela Palace Banquet', 'Adyar', 13.0487, 80.2824, '₹3,00,000'],
            [vendorId, 'Chennai', 'ITC Grand Chola Hall', 'Guindy', 13.0100, 80.2200, '₹5,00,000'],
            [vendorId, 'Chennai', 'Green Meadows Resort', 'Palavakkam', 12.9500, 80.2500, '₹1,80,000'],
            [vendorId, 'Chennai', 'Sree Amruthaa Palace', 'Aminjikarai', 13.0800, 80.2400, '₹1,20,000'],
            [vendorId, 'Chennai', 'Rajah Annamalai Hall', 'Esplanade', 13.0900, 80.2700, '₹2,00,000']
        ];

        for (const v of venues) {
             await db.execute(
                 'INSERT INTO Venues (vendor_id, city, name, location, latitude, longitude, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
                 v
             );
        }
        
        console.log("SUCCESS");
        process.exit(0);
    } catch(err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

insertTempVenues();
