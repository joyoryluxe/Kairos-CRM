import mongoose from 'mongoose';
import CorporateEvent from './server/src/models/CorporateEvent';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://joyoryluxe:Joyory123@joyoryluxe.4rnfwin.mongodb.net/kairos-crm';

async function verify() {
  try {
    console.log('Connecting to MongoDB for verification...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected successfully.');

    const events = await CorporateEvent.find({});
    console.log(`Verifying ${events.length} corporate events by attempting to save each...`);

    let successCount = 0;
    let failCount = 0;

    for (const event of events) {
      try {
        console.log(`Saving event ${event._id} (${event.clientName})...`);
        await event.save();
        successCount++;
        console.log(`Success: ${event._id}`);
      } catch (err: any) {
        console.error(`Validation failed for event ${event._id} (${event.clientName}):`);
        console.error(err);
        failCount++;
      }
    }

    console.log(`Verification complete. Total events: ${events.length}, Success: ${successCount}, Fail: ${failCount}`);
    await mongoose.disconnect();
    
    if (failCount > 0) {
        process.exit(1);
    }
  } catch (err) {
    console.error('Verification script failed:', err);
    process.exit(1);
  }
}

verify();
