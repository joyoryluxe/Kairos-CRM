import { Request, Response } from 'express';
import Maternity from '../models/Maternity';
import Influencer from '../models/Influencer';
import CorporateEvent from '../models/CorporateEvent';

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const [maternities, influencers, corporateEvents] = await Promise.all([
      Maternity.find({}),
      Influencer.find({}),
      CorporateEvent.find({}),
    ]);

    // Financial calculations
    const calcStats = (records: any[] = []) => {
      return records.reduce((acc, curr) => {
        try {
          const total = Number(curr.total) || 0;
          const advance = Number(curr.advance) || 0;
          const balance = Number(curr.balance) || (total - advance) || 0;
          acc.totalRevenue += total;
          acc.totalAdvance += advance;
          acc.totalBalance += balance;
        } catch (e) {
          console.error('Error calculating record stats:', e);
        }
        return acc;
      }, { totalRevenue: 0, totalAdvance: 0, totalBalance: 0 });
    };

    const maternityStats = calcStats(maternities);
    const influencerStats = calcStats(influencers);
    const corporateStats = calcStats(corporateEvents);

    const globalTotals = {
      totalRevenue: (maternityStats.totalRevenue || 0) + (influencerStats.totalRevenue || 0) + (corporateStats.totalRevenue || 0),
      totalAdvance: (maternityStats.totalAdvance || 0) + (influencerStats.totalAdvance || 0) + (corporateStats.totalAdvance || 0),
      totalBalance: (maternityStats.totalBalance || 0) + (influencerStats.totalBalance || 0) + (corporateStats.totalBalance || 0),
    };

    const categorySplit = [
      { name: 'Maternity', revenue: maternityStats.totalRevenue, color: '#f472b6' },
      { name: 'Influencer', revenue: influencerStats.totalRevenue, color: '#60a5fa' },
      { name: 'Corporate', revenue: corporateStats.totalRevenue, color: '#4ade80' },
    ];

    // Notification Reminders based on deliveryDeadline
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const safeToObject = (doc: any, type: string) => {
      try {
        const obj = doc.toObject ? doc.toObject() : doc;
        return { ...obj, type };
      } catch (e) {
        console.error(`Error converting ${type} to object:`, e);
        return { ...doc, type };
      }
    };

    const allRecords: any[] = [
      ...maternities.map(m => safeToObject(m, 'Maternity')),
      ...influencers.map(i => safeToObject(i, 'Influencer')),
      ...corporateEvents.map(c => safeToObject(c, 'Corporate')),
    ];

    const notifications = allRecords
      .filter((r: any) => r && r.deliveryDeadline && r.status !== 'Completed' && r.status !== 'Cancelled')
      .map((r: any) => {
        try {
          const deadline = new Date(r.deliveryDeadline);
          if (isNaN(deadline.getTime())) return null;

          deadline.setHours(0, 0, 0, 0);
          const diffTime = deadline.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let priority: 'Moderate' | 'High' | 'Critical' | 'Expired' = 'Moderate';
          
          if (diffDays < 0) priority = 'Expired';
          else if (diffDays <= 1) priority = 'Critical';
          else if (diffDays <= 3) priority = 'High';
          else if (diffDays <= 7) priority = 'Moderate';
          else return null;

          return {
            id: r._id,
            clientName: r.clientName || 'Unknown Client',
            type: r.type,
            deadline: r.deliveryDeadline,
            daysRemaining: diffDays,
            priority,
          };
        } catch (e) {
          console.error('Error processing notification:', e);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.daysRemaining || 0) - (b.daysRemaining || 0));

    res.json({
      success: true,
      data: {
        globalTotals,
        categorySplit,
        notifications,
      },
    });
  } catch (error: any) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
