import mongoose from 'mongoose';
import CorporateEvent from './server/src/models/CorporateEvent';
import { env } from './server/src/config/env';

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('Connected to MongoDB');

    const events = await CorporateEvent.find({});
    console.log(`Found ${events.length} corporate events`);

    for (const event of events) {
      if (!Array.isArray(event.extras)) {
        console.log(`Event ${event._id} has non-array extras:`, event.extras);
        continue;
      }

      for (let i = 0; i < event.extras.length; i++) {
        const extra = event.extras[i];
        if (typeof extra !== 'object' || extra === null) {
          console.log(`Event ${event._id} has malformed extra at index ${i}:`, extra);
        }
      }
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (err) {
    console.error(err);
  }
}

check();
