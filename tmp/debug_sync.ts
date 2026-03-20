import mongoose from 'mongoose';
import Influencer from '../server/src/models/Influencer';
import { User } from '../server/src/models/User';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

async function debug() {
  await mongoose.connect(process.env.MONGO_URI!);
  console.log('Connected to DB');

  const influencers = await Influencer.find({}).limit(5);
  console.log('Influencers:');
  influencers.forEach(i => {
    console.log(`- ${i.clientName}: googleCalendarEventId=${i.googleCalendarEventId}, shootDate=${i.shootDateAndTime}`);
  });

  const user = await User.findOne({}).select('+googleRefreshToken');
  console.log('User connected:', user?.googleCalendarConnected);
  console.log('Has Refresh Token:', !!user?.googleRefreshToken);

  process.exit(0);
}

debug().catch(console.error);
