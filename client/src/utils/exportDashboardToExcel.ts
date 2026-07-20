import * as XLSX from 'xlsx';
import type { DashboardStats } from '@/api/dashboard';

export const exportDashboardToExcel = (data: DashboardStats, fileName: string) => {
  if (!data) {
    alert("No data available to export.");
    return;
  }

  const workbook = XLSX.utils.book_new();

  // ─── 1. Financial Overview Sheet ───
  const summaryRows: any[][] = [
    ["EXECUTIVE FINANCIAL SUMMARY"],
    [],
    ["Metric", "Value (INR)"],
    ["Gross Revenue", data.globalTotals?.totalRevenue || 0],
    ["Collected", data.globalTotals?.totalAdvance || 0],
    ["Outstanding Balance", data.globalTotals?.totalBalance || 0],
    ["Net Expenses", data.globalTotals?.totalExpenses || 0],
    ["Total Profit", data.globalTotals?.totalProfit || 0],
    ["Lead Conversion (Booked)", data.leadStats?.booked || 0],
    [],
    ["REVENUE DISTRIBUTION BY MODULE"],
    [],
    ["Module", "Revenue (INR)", "Percentage"]
  ];

  const totalRev = data.globalTotals?.totalRevenue || 0;
  if (data.categorySplit && data.categorySplit.length > 0) {
    data.categorySplit.forEach((cat) => {
      const pct = totalRev > 0 ? `${Math.round((cat.revenue / totalRev) * 100)}%` : "0%";
      summaryRows.push([cat.name, cat.revenue, pct]);
    });
  }

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Financial Overview');

  // ─── 2. Upcoming Queue Sheet ───
  const queueRows: any[][] = [
    ["UPCOMING SCHEDULE QUEUE (NEXT 30 DAYS)"],
    [],
    ["Client Name", "Module Type", "Event Type", "Scheduled Date", "Days Remaining"]
  ];

  if (data.upcomingShoots && data.upcomingShoots.length > 0) {
    data.upcomingShoots.forEach(item => {
      queueRows.push([
        item.clientName,
        item.type,
        "Shoot",
        item.date ? new Date(item.date).toLocaleDateString("en-IN") : "-",
        item.daysRemaining === 0 ? "TODAY" : `${item.daysRemaining} days`
      ]);
    });
  }

  if (data.upcomingDeadlines && data.upcomingDeadlines.length > 0) {
    data.upcomingDeadlines.forEach(item => {
      queueRows.push([
        item.clientName,
        item.type,
        "Deadline",
        item.date ? new Date(item.date).toLocaleDateString("en-IN") : "-",
        item.daysRemaining === 0 ? "TODAY" : `${item.daysRemaining} days`
      ]);
    });
  }

  // Add the sheet even if it only has headers
  const queueSheet = XLSX.utils.aoa_to_sheet(queueRows);
  queueSheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, queueSheet, 'Upcoming Queue');

  // ─── 3. Recent Accomplishments Sheet ───
  const accomplishmentsRows: any[][] = [
    ["RECENTLY COMPLETED SHOOTS / PROJECTS"],
    [],
    ["Client Name", "Module Type", "Total Amount (INR)", "Balance Due (INR)", "Payment Status", "Date Completed"]
  ];
  if (data.recentlyCompleted && data.recentlyCompleted.length > 0) {
    data.recentlyCompleted.forEach(item => {
      accomplishmentsRows.push([
        item.clientName,
        item.type,
        item.total || 0,
        item.balance || 0,
        item.paymentStatus,
        item.date ? new Date(item.date).toLocaleDateString("en-IN") : "-"
      ]);
    });
  }
  const accomplishmentsSheet = XLSX.utils.aoa_to_sheet(accomplishmentsRows);
  accomplishmentsSheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(workbook, accomplishmentsSheet, 'Recent Accomplishments');

  // ─── 4. Studio Ledger (Expenses) Sheet ───
  const ledgerRows: any[][] = [
    ["STUDIO LEDGER (EXPENSES)"],
    [],
    ["Date", "Category", "Amount (INR)", "Memo/Notes"]
  ];
  if (data.studioExpenses && data.studioExpenses.length > 0) {
    data.studioExpenses.forEach(expense => {
      ledgerRows.push([
        expense.date ? new Date(expense.date).toLocaleDateString("en-IN") : "-",
        expense.category || "Other",
        expense.amount || 0,
        expense.notes || "-"
      ]);
    });
  }
  const ledgerSheet = XLSX.utils.aoa_to_sheet(ledgerRows);
  ledgerSheet['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Studio Ledger');

  // ─── 5. Birth Reminders Sheet ───
  const birthRows: any[][] = [
    ["CRITICAL BIRTH REMINDERS (MATERNITY)"],
    [],
    ["Client Name", "Baby Name", "Due Date", "Days Remaining", "Priority"]
  ];
  if (data.birthDateReminders && data.birthDateReminders.length > 0) {
    data.birthDateReminders.forEach(rem => {
      birthRows.push([
        rem.clientName,
        rem.babyName || "-",
        rem.date ? new Date(rem.date).toLocaleDateString("en-IN") : "-",
        rem.daysRemaining === 0 ? "TODAY" : `${rem.daysRemaining} days`,
        rem.priority
      ]);
    });
  }
  const birthSheet = XLSX.utils.aoa_to_sheet(birthRows);
  birthSheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(workbook, birthSheet, 'Birth Reminders');

  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportLedgerToExcel = (expenses: any[], fileName: string) => {
  const workbook = XLSX.utils.book_new();
  const ledgerRows: any[][] = [
    ["STUDIO LEDGER (EXPENSES)"],
    [],
    ["Date", "Category", "Amount (INR)", "Memo/Notes"]
  ];
  if (expenses && expenses.length > 0) {
    expenses.forEach(expense => {
      ledgerRows.push([
        expense.date ? new Date(expense.date).toLocaleDateString("en-IN") : "-",
        expense.category || "Other",
        expense.amount || 0,
        expense.notes || "-"
      ]);
    });
  }
  const ledgerSheet = XLSX.utils.aoa_to_sheet(ledgerRows);
  ledgerSheet['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 35 }];
  XLSX.utils.book_append_sheet(workbook, ledgerSheet, 'Studio Ledger');
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
