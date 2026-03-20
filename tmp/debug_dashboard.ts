import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Maternity from '../server/src/models/Maternity';
import Influencer from '../server/src/models/Influencer';
import CorporateEvent from '../server/src/models/CorporateEvent';

dotenv.config({ path: path.resolve(__dirname, '../server/.env') });

async function debug() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('Connected.');

    const [maternities, influencers, corporateEvents] = await Promise.all([
      Maternity.find({}),
      Influencer.find({}),
      CorporateEvent.find({}),
    ]);

    console.log(`Fetched: ${maternities.length} maternities, ${influencers.length} influencers, ${corporateEvents.length} corporateEvents`);

    // Financial calculations
    const calcStats = (records: any[]) => {
      console.log('Calculating stats for records...');
      return (records || []).reduce((acc, curr) => {
        try {
          const total = Number(curr.total) || 0;
          const advance = Number(curr.advance) || 0;
          const balance = Number(curr.balance) || (total - advance) || 0;
          acc.totalRevenue += total;
          acc.totalAdvance += advance;
          acc.totalBalance += balance;
          return acc;
        } catch (e: any) {
          console.error(`Error in calcStats for record ${curr._id}:`, e.message);
          return acc;
        }
      }, { totalRevenue: 0, totalAdvance: 0, totalBalance: 0 });
    };

    const maternityStats = calcStats(maternities);
    const influencerStats = calcStats(influencers);
    const corporateStats = calcStats(corporateEvents);

    console.log('Maternity Stats:', maternityStats);
    console.log('Influencer Stats:', influencerStats);
    console.log('Corporate Stats:', corporateStats);

    // Notification Reminders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allRecords: any[] = [
      ...maternities.map(m => ({ ...m.toObject(), type: 'Maternity' })),
      ...influencers.map(i => ({ ...i.toObject(), type: 'Influencer' })),
      ...corporateEvents.map(c => ({ ...c.toObject(), type: 'Corporate' })),
    ];

    console.log('Processing notifications...');
    const notifications = allRecords
      .filter((r: any) => r.deliveryDeadline && r.status !== 'Completed' && r.status !== 'Cancelled')
      .map((r: any) => {
        try {
          const deadline = new Date(r.deliveryDeadline);
          if (isNaN(deadline.getTime())) {
             console.warn(`Invalid deadline for record ${r._id}: ${r.deliveryDeadline}`);
             return null;
          }
          deadline.setHours(0, 0, 0, 0);
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let priority: 'Normal' | 'Moderate' | 'High' | 'Critical' = 'Normal';
          if (diffDays <= 1) priority = 'Critical';
          else if (diffDays <= 2) priority = 'Moderate';
          else if (diffDays <= 7) priority = 'Normal';
          else return null;

          return {
            id: r._id,
            clientName: r.clientName,
            type: r.type,
            deadline: r.deliveryDeadline,
            daysRemaining: diffDays,
            priority,
          };
        } catch (e: any) {
          console.error(`Error in notification map for record ${r._id}:`, e.message);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.daysRemaining - b.daysRemaining);

    console.log(`Success! Notifications count: ${notifications.length}`);
    process.exit(0);
  } catch (err: any) {
    console.error('DEBUG CRASHED:', err);
    process.exit(1);
  }
}

debug();
