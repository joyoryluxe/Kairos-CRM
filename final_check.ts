import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || '';

async function check() {
  try {
    console.log('Connecting to MongoDB for final check...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    if (!db) throw new Error('DB not connected');

    const collection = db.collection('corporateevents');
    
    const count = await collection.countDocuments({ extras: { $type: ['number', 'double', 'int', 'long'] } });
    console.log(`Remaining documents with numeric extras: ${count}`);

    const arrayEvents = await collection.find({ extras: { $type: 'array' } }).toArray();
    let malformedInArray = 0;
    for (const event of arrayEvents) {
      if (Array.isArray(event.extras) && event.extras.some((e: any) => typeof e !== 'object' || e === null)) {
        malformedInArray++;
      }
    }
    console.log(`Remaining documents with malformed array elements: ${malformedInArray}`);

    await mongoose.disconnect();
    
    if (count > 0 || malformedInArray > 0) {
        console.error('Verification failed: legacy data still exists.');
        process.exit(1);
    }
    console.log('Verification successful!');
  } catch (err) {
    console.error('Check script failed:', err);
    process.exit(1);
  }
}

check();
