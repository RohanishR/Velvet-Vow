const db = require('./config/db');

async function updateImages() {
  try {
    const updates = [
      { id: 1, image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800' }, // Leela Palace
      { id: 2, image: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&q=80&w=800' }, // ITC Grand
      { id: 3, image: 'https://images.unsplash.com/photo-1510076857177-7470076d4098?auto=format&fit=crop&q=80&w=800' }, // Green Meadows
      { id: 4, image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800' }, // Sree Amruthaa
      { id: 5, image: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=800' }  // Rajah Annamalai
    ];

    for (let u of updates) {
      await db.execute('UPDATE Venues SET image = ? WHERE venue_id = ?', [u.image, u.id]);
    }
    console.log("Images mapped successfully to the database!");
    process.exit(0);
  } catch (err) {
    console.error("Error setting images:", err);
    process.exit(1);
  }
}

updateImages();
