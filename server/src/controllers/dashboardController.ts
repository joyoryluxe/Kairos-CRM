


import { Request, Response } from 'express';
import Maternity from '../models/Maternity';
import Influencer from '../models/Influencer';
import CorporateEvent from '../models/CorporateEvent';
import StudioExpense from '../models/StudioExpense';
import Lead from '../models/Lead';

// ── helpers ────────────────────────────────────────────────────────────────

/**
 * Ensures a date value is returned as a proper ISO 8601 string.
 * FullCalendar + timeZone="Asia/Kolkata" needs ISO strings — not
 * raw Date objects or ambiguous local strings.
 */
const toISO = (value: any): string | null => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

const calcStats = (records: any[] = []) =>
  records.reduce(
    (acc, curr) => {
      try {
        const total = Number(curr.total) || 0;
        const advance = Number(curr.advance) || 0;
        const balance = Number(curr.balance) || total - advance || 0;
        const expenses = Number(curr.expenses) || 0;
        
        acc.totalRevenue += total;
        acc.totalAdvance += advance;
        acc.totalBalance += balance;
        acc.totalExpenses += expenses;
        acc.totalProfit += (total - expenses);
      } catch (e) {
        console.error('Error calculating record stats:', e);
      }
      return acc;
    },
    { totalRevenue: 0, totalAdvance: 0, totalBalance: 0, totalExpenses: 0, totalProfit: 0 },
  );

const safeToObject = (doc: any, type: string) => {
  try {
    return { ...(doc.toObject ? doc.toObject() : doc), type };
  } catch {
    return { ...doc, type };
  }
};

// ── controller ─────────────────────────────────────────────────────────────

export const getDashboardOverview = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : null;
    const end = endDate ? new Date(endDate as string) : null;
    const isFiltered = !!(start || end);

    const isInRange = (dateVal: any) => {
      if (!dateVal) return false;
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return false;
      if (start && d < start) return false;
      if (end && d > end) return false;
      return true;
    };

    const query = {};

    const [allMaternities, allInfluencers, allCorporateEvents, allStudioExpenses, allLeads] = await Promise.all([
      Maternity.find(query),
      Influencer.find(query),
      CorporateEvent.find(query),
      StudioExpense.find(query),
      Lead.find(query),
    ]);

    // Filter by date range — timestamps (createdAt/updatedAt) exist at runtime via
    // Mongoose { timestamps: true } but aren't in the TS interface. We use bracket
    // notation to access them safely without `as any` casts (which trip up esbuild).
    const getDate = (doc: any, ...fields: string[]) => {
      for (const f of fields) {
        if (doc[f]) return doc[f];
      }
      return null;
    };

    // const maternities = isFiltered
    //   ? allMaternities.filter(m => isInRange(getDate(m, 'shootDateAndTime', 'updatedAt', 'createdAt')))
    //   : allMaternities;
    // const influencers = isFiltered
    //   ? allInfluencers.filter(i => isInRange(getDate(i, 'shootDateAndTime', 'updatedAt', 'createdAt')))
    //   : allInfluencers;
    // const corporateEvents = isFiltered
    const matchesFilter = (doc: any, shootField: string) => {
      if (!isFiltered) return true;
      if (isInRange(doc.createdAt)) return true;
      if (isInRange(doc[shootField])) return true;
      if (Array.isArray(doc.payments) && doc.payments.some((p: any) => isInRange(p.date))) return true;
      return false;
    };

    const maternities = allMaternities.filter(m => matchesFilter(m, 'shootDateAndTime'));
    const influencers = allInfluencers.filter(i => matchesFilter(i, 'shootDateAndTime'));
    const corporateEvents = allCorporateEvents.filter(c => matchesFilter(c, 'eventDateAndTime'));
    
    const studioExpenses = allStudioExpenses.filter(e => {
      if (!isFiltered) return true;
      return isInRange(e.date) || isInRange((e as any).createdAt);
    });
    
    const leads = allLeads.filter(l => {
      if (!isFiltered) return true;
      return isInRange((l as any).createdAt) || isInRange(l.inquiryDate);
    });

    // ── financial totals ──────────────────────────────────────────────────

    const maternityStats = calcStats(maternities);
    const influencerStats = calcStats(influencers);
    const corporateStats = calcStats(corporateEvents);

    // Only count revenue/profit for Booked leads
    const bookedLeads = leads.filter(l => l.status === 'Booked');
    const leadStats = bookedLeads.reduce((acc, curr) => {
      const budget = Number(curr.budget) || 0;
      acc.totalRevenue += budget;
      acc.totalProfit += budget;
      return acc;
    }, { totalRevenue: 0, totalProfit: 0 });

    const studioExpensesTotal = studioExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    const globalTotals = {
      totalRevenue: maternityStats.totalRevenue + influencerStats.totalRevenue + corporateStats.totalRevenue,
      totalAdvance: maternityStats.totalAdvance + influencerStats.totalAdvance + corporateStats.totalAdvance,
      totalBalance: maternityStats.totalBalance + influencerStats.totalBalance + corporateStats.totalBalance,
      totalExpenses: maternityStats.totalExpenses + influencerStats.totalExpenses + corporateStats.totalExpenses + studioExpensesTotal,
      totalProfit: (maternityStats.totalProfit + influencerStats.totalProfit + corporateStats.totalProfit) - studioExpensesTotal,
      studioExpensesTotal,
    };

    const categorySplit = [
      { name: 'Maternity', revenue: maternityStats.totalRevenue, color: '#f472b6' },
      { name: 'Influencer', revenue: influencerStats.totalRevenue, color: '#60a5fa' },
      { name: 'Corporate', revenue: corporateStats.totalRevenue, color: '#4ade80' },
      { name: 'Leads (Booked)', revenue: leadStats.totalRevenue, color: '#3b82f6' },
    ];

    // ── notifications ─────────────────────────────────────────────────────

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const allRecords: any[] = [
      ...maternities.map(m => safeToObject(m, 'Maternity')),
      ...influencers.map(i => safeToObject(i, 'Influencer')),
      ...corporateEvents.map(c => safeToObject(c, 'Corporate')),
    ];

    const leadNotifications = leads
      .filter(l => l.nextFollowUpDate && l.status !== 'Booked' && l.status !== 'Lost')
      .map(l => {
        const followUp = new Date(l.nextFollowUpDate as any);
        followUp.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((followUp.getTime() - today.getTime()) / 86_400_000);

        let priority: 'Moderate' | 'High' | 'Critical' | 'Expired';
        if (diffDays < 0) priority = 'Expired';
        else if (diffDays <= 1) priority = 'Critical';
        else if (diffDays <= 3) priority = 'High';
        else if (diffDays <= 7) priority = 'Moderate';
        else return null;

        return {
          id: l._id,
          clientName: l.clientName,
          type: 'leads',
          deadline: l.nextFollowUpDate,
          daysRemaining: diffDays,
          priority,
        };
      });

    const deliveryNotifications = allRecords
      .filter(r => r?.deliveryDeadline && r.status !== 'Completed' && r.status !== 'Cancelled')
      .map(r => {
        try {
          const deadline = new Date(r.deliveryDeadline);
          if (isNaN(deadline.getTime())) return null;

          deadline.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadline.getTime() - today.getTime()) / 86_400_000);

          let priority: 'Moderate' | 'High' | 'Critical' | 'Expired';
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
      });

    const birthDateReminders = maternities
      .filter(m => m.birthDate && m.status !== 'Cancelled' && m.status !== 'Completed')
      .map(m => {
        try {
          const birthDate = new Date(m.birthDate!);
          if (isNaN(birthDate.getTime())) return null;

          // Calculate next occurrence (ignoring year)
          const nextBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());

          // If birthday already passed this year, look at next year
          if (nextBirthday < today) {
            nextBirthday.setFullYear(today.getFullYear() + 1);
          }

          const diffDays = Math.ceil((nextBirthday.getTime() - today.getTime()) / 86_400_000);

          if (diffDays > 7) return null;

          let priority: 'Moderate' | 'High' | 'Critical';
          if (diffDays <= 1) priority = 'Critical';
          else if (diffDays <= 3) priority = 'High';
          else priority = 'Moderate';

          return {
            id: m._id,
            clientName: m.clientName || 'Unknown Client',
            babyName: m.babyName || 'Baby',
            date: m.birthDate,
            daysRemaining: diffDays,
            priority,
          };
        } catch (e) {
          console.error('Error processing birthDate reminder:', e);
          return null;
        }
      })
      .filter(Boolean)
      .sort((a, b) => (a?.daysRemaining ?? 0) - (b?.daysRemaining ?? 0));

    const notifications = [...deliveryNotifications, ...leadNotifications]
      .filter(Boolean)
      .sort((a: any, b: any) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));

    // ── calendar events ───────────────────────────────────────────────────

    const categoryColor: Record<string, string> = {
      Maternity: '#f472b6',
      Influencer: '#60a5fa',
      Corporate: '#4ade80',
      Lead: '#3b82f6',
    };

    const calendarEvents: any[] = [];
    const recentlyCompleted: any[] = [];
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const todayMax = new Date(today);
    todayMax.setHours(23, 59, 59, 999);

    allRecords.forEach(r => {
      if (!r) return;

      const { type, clientName = 'Unknown Client', status, _id, updatedAt } = r;
      // Calendar should only show active things. 
      // 'Completed' can stay on calendar if it's in the past? 
      // User says "records of its shooting date or deadline is upcoming then shows properly"
      // So let's show all SHOOTS (even completed ones if user wants to see past schedule?)
      // Usually, calendar shows everything. But let's follow user "upcoming" hint.

      const isCancelled = status === 'Cancelled';
      const color = categoryColor[type] ?? '#94a3b8';

      if (!isCancelled) {
        // ── shoot / event ──
        const shootISO = toISO(r.shootDateAndTime ?? r.eventDateAndTime);
        if (shootISO) {
          calendarEvents.push({
            id: `${_id}-shoot`,
            title: `${clientName}`,
            start: shootISO,
            backgroundColor: status === 'Completed' ? '#475569' : color, // Gray out completed
            borderColor: status === 'Completed' ? '#475569' : color,
            allDay: false,
            extendedProps: { type, status, recordId: _id, isDeadline: false },
          });
        }

        // ── delivery deadline ──
        const deadlineISO = toISO(r.deliveryDeadline);
        if (deadlineISO) {
          calendarEvents.push({
            id: `${_id}-deadline`,
            title: `${clientName} (D)`,
            start: deadlineISO,
            backgroundColor: status === 'Completed' ? '#475569' : '#ef4444',
            borderColor: status === 'Completed' ? '#475569' : '#ef4444',
            allDay: true,
            extendedProps: { type, status, recordId: _id, isDeadline: true },
          });
        }
      }

      // 2. Recently Completed / Cancelled (last 7 days)
      if (status === 'Completed' || status === 'Cancelled') {
        const updateDate = new Date(updatedAt);
        if (updateDate >= sevenDaysAgo && updateDate <= todayMax) {
          recentlyCompleted.push({
            id: _id,
            clientName,
            type,
            status,
            total: r.total || 0,
            balance: r.balance || 0,
            paymentStatus: (r.balance || 0) <= 0 ? 'Done' : 'Due',
            date: updatedAt
          });
        }
      }
    });

    // Add Leads to calendar
    leads.forEach(l => {
      if (l.eventDate && l.status !== 'Booked' && l.status !== 'Lost') {
        const eventISO = toISO(l.eventDate);
        if (eventISO) {
          calendarEvents.push({
            id: `${l._id}-leadevent`,
            title: `Potential: ${l.clientName}`,
            start: eventISO,
            backgroundColor: '#3b82f633', // faded blue
            borderColor: '#3b82f6',
            allDay: true,
            extendedProps: { type: 'Lead', status: l.status, recordId: l._id, isDeadline: false },
          });
        }
      }
    });

    // ── upcoming week data ───────────────────────────────────────────────

    const upcomingShoots = allRecords
      .filter(r => (r?.shootDateAndTime || r?.eventDateAndTime) && r.status !== 'Cancelled')
      .map(r => {
        const date = new Date(r.shootDateAndTime ?? r.eventDateAndTime);
        if (isNaN(date.getTime())) return null;
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
        // Show everything from today onwards
        if (diffDays >= 0) {
          return {
            id: r._id,
            clientName: r.clientName || 'Unknown Client',
            type: r.type,
            date: r.shootDateAndTime ?? r.eventDateAndTime,
            daysRemaining: diffDays,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));

    const upcomingDeadlines = allRecords
      .filter(r => r?.deliveryDeadline && r.status !== 'Cancelled')
      .map(r => {
        const date = new Date(r.deliveryDeadline);
        if (isNaN(date.getTime())) return null;
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
        // Show all upcoming deadlines
        if (diffDays >= 0) {
          return {
            id: r._id,
            clientName: r.clientName || 'Unknown Client',
            type: r.type,
            date: r.deliveryDeadline,
            daysRemaining: diffDays,
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.daysRemaining ?? 0) - (b.daysRemaining ?? 0));

    recentlyCompleted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      data: {
        globalTotals,
        categorySplit,
        notifications,
        calendarEvents,
        upcomingShoots,
        upcomingDeadlines,
        recentlyCompleted,
        leadStats: {
          total: leads.length,
          new: leads.filter(l => l.status === 'New').length,
          contacted: leads.filter(l => l.status === 'Contacted').length,
          booked: bookedLeads.length,
          lost: leads.filter(l => l.status === 'Lost').length
        },
        birthDateReminders,
        studioExpenses: studioExpenses
      },
    });
  } catch (error: any) {
    console.error('DASHBOARD ERROR:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};