import api from "./axios";
import type { ApiResponse } from "./types";

export type Influencer = {
  _id: string;
  clientName: string;
  phoneNumber: string;
  email?: string;
  instaId?: string;
  referredBy?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  shootName?: string;
  shootDateAndTime?: string;
  deliveryDeadline?: string;
  package?: string;
  packagePrice?: number;
  extras?: Array<{ description: string; amount: number }>;
  extrasTotal?: number;
  expenses?: number;
  payments?: Array<{ amount: number; date: string; note?: string }>;
  advance?: number;
  total?: number;
  balance?: number;
  profit?: number;
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getInfluencers(params?: Record<string, string>): Promise<{ data: Influencer[]; summary: any }> {
  const res = await api.get<ApiResponse<Influencer[]>>("/influencer", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load influencers");
  return {
    data: res.data.data,
    summary: (res.data as any).summary
  };
}

export async function getInfluencerById(id: string): Promise<Influencer> {
  const res = await api.get<ApiResponse<Influencer>>(`/influencer/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load influencer record");
  return res.data.data;
}

export type InfluencerInput = Omit<Influencer, "_id" | "createdAt" | "updatedAt">;

export async function createInfluencer(payload: InfluencerInput): Promise<Influencer> {
  const res = await api.post<ApiResponse<Influencer>>("/influencer", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create influencer record");
  return res.data.data;
}

export async function updateInfluencer(id: string, payload: Partial<InfluencerInput>): Promise<Influencer> {
  const res = await api.put<ApiResponse<Influencer>>(`/influencer/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update influencer record");
  return res.data.data;
}

export async function deleteInfluencer(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/influencer/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete influencer record");
}


