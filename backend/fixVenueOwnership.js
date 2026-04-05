const db = require('./config/db');

async function fixVenues() {
    try {
        console.log("Looking for your latest Vendor account...");
        // Grab the most recently created Vendor
        const [vendors] = await db.execute("SELECT user_id, name FROM Users WHERE role = 'vendor' ORDER BY user_id DESC LIMIT 1");
        
        if(vendors.length === 0) {
            console.log("No vendors found in the database!");
            process.exit(0);
        }
        
        const latestVendor = vendors[0];
        console.log(`Found your latest vendor account: ${latestVendor.name} (ID: ${latestVendor.user_id})`);

        console.log("Re-assigning all venues to this vendor...");
        // Update all venues to be owned by this new vendor
        await db.execute('UPDATE Venues SET vendor_id = ?', [latestVendor.user_id]);
        
        console.log("✅ Success! All venues are now owned by " + latestVendor.name);
        console.log("Your Customer Dashboard will now accurately show their details upon booking.");
        process.exit(0);
    } catch(err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

fixVenues();
