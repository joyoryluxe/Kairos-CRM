import api from "./axios";
import type { ApiResponse } from "./types";

export interface DashboardStats {
  globalTotals: {
    totalRevenue: number;
    totalAdvance: number;
    totalBalance: number;
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
}

export async function getDashboardOverview(): Promise<DashboardStats> {
  const res = await api.get<ApiResponse<DashboardStats>>("/dashboard/overview");
  if (!res.data.success) throw new Error(res.data.message || "Failed to load dashboard data");
  return res.data.data;
}
