import api from "./axios";
import type { ApiResponse } from "./types";
import type { StudioExpense } from "./studioExpenses";

export interface DashboardStats {
  globalTotals: {
    totalRevenue: number;
    totalAdvance: number;
    totalBalance: number;
    totalExpenses: number;
    totalProfit: number;
    studioExpensesTotal?: number;
  };
  categorySplit: Array<{
    name: string;
    revenue: number;
    color: string;
  }>;
  notifications: Array<{
    id: string;
    clientName: string;
    type: string;
    deadline: string;
    daysRemaining: number;
    priority: "Normal" | "Moderate" | "High" | "Critical" | "Expired";
  }>;
  calendarEvents: any[];
  upcomingShoots: Array<{
    id: string;
    clientName: string;
    type: string;
    date: string;
    daysRemaining: number;
  }>;
  upcomingDeadlines: Array<{
    id: string;
    clientName: string;
    type: string;
    date: string;
    daysRemaining: number;
  }>;
  recentlyCompleted: Array<{
    id: string;
    clientName: string;
    type: string;
    status: string;
    total: number;
    balance: number;
    paymentStatus: "Done" | "Due";
    date: string;
  }>;
  leadStats?: {
    total: number;
    new: number;
    contacted: number;
    booked: number;
    lost: number;
  };
  birthDateReminders: Array<{
    id: string;
    clientName: string;
    babyName: string;
    date: string;
    daysRemaining: number;
    priority: "Moderate" | "High" | "Critical" | "Expired";
  }>;
  studioExpenses?: StudioExpense[];
}

export async function getDashboardOverview(startDate?: string, endDate?: string): Promise<DashboardStats> {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const res = await api.get<ApiResponse<DashboardStats>>("/dashboard/overview", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load dashboard data");
  return res.data.data;
}
