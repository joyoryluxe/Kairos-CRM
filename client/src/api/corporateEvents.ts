import api from "./axios";
import type { ApiResponse } from "./types";

export type CorporateEvent = {
  _id: string;
  clientName: string;
  phoneNumber: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  eventName?: string;
  eventDateAndTime?: string;
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

export async function getCorporateEvents(params?: Record<string, any>): Promise<{ data: CorporateEvent[]; summary: any }> {
  const res = await api.get<ApiResponse<CorporateEvent[]>>("/corporate-events", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load corporate events");
  return {
    data: res.data.data,
    summary: (res.data as any).summary
  };
}

export async function getCorporateEventById(id: string): Promise<CorporateEvent> {
  const res = await api.get<ApiResponse<CorporateEvent>>(`/corporate-events/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load corporate event");
  return res.data.data;
}

export type CorporateEventInput = Omit<CorporateEvent, "_id" | "createdAt" | "updatedAt">;

export async function createCorporateEvent(payload: CorporateEventInput): Promise<CorporateEvent> {
  const res = await api.post<ApiResponse<CorporateEvent>>("/corporate-events", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create corporate event");
  return res.data.data;
}

export async function updateCorporateEvent(id: string, payload: Partial<CorporateEventInput>): Promise<CorporateEvent> {
  const res = await api.put<ApiResponse<CorporateEvent>>(`/corporate-events/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update corporate event");
  return res.data.data;
}

export async function deleteCorporateEvent(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/corporate-events/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete corporate event");
}


