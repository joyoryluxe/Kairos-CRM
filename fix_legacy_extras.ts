import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || '';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    const collection = db.collection('corporateevents'); // Collection names are typically lowercase plural or as defined in model
    
    // Find records where 'extras' is a number (BSON type 1 or 16/18)
    // 1: double, 16: string, 18: long
    const cursor = collection.find({ extras: { $type: ['number', 'double', 'int', 'long'] } });
    const malformedEvents = await cursor.toArray();

    console.log(`Found ${malformedEvents.length} events with malformed 'extras' field.`);

    for (const event of malformedEvents) {
      console.log(`Fixing event ${event._id} (${event.clientName}): converting extras (${event.extras}) to [].`);
      await collection.updateOne(
        { _id: event._id },
        { $set: { extras: [] } }
      );
    }

    // Also check for arrays that contain non-objects, like [0] or [""]
    const cursor2 = collection.find({ $and: [ { extras: { $type: 'array' } }, { extras: { $not: { $all: [ { $type: 'object' } ] } } } ] });
    // Note: The $not $all $type: 'object' check might be tricky. Let's do it in JS.
    const arrayEvents = await collection.find({ extras: { $type: 'array' } }).toArray();
    let arrayFixCount = 0;
    for (const event of arrayEvents) {
      if (Array.isArray(event.extras) && event.extras.length > 0) {
        const needsFix = event.extras.some((e: any) => typeof e !== 'object' || e === null);
        if (needsFix) {
          console.log(`Fixing event ${event._id} (${event.clientName}): extras array contained non-objects. Cleaning up.`);
          const cleanedExtras = event.extras.filter((e: any) => typeof e === 'object' && e !== null);
          await collection.updateOne(
            { _id: event._id },
            { $set: { extras: cleanedExtras } }
          );
          arrayFixCount++;
        }
      }
    }

    console.log(`Migration complete.`);
    console.log(`Successfully fixed ${malformedEvents.length} records that were numbers.`);
    console.log(`Successfully cleaned up ${arrayFixCount} records with malformed array elements.`);

    await mongoose.disconnect();
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
