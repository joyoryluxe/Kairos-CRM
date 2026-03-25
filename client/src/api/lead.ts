import api from "./axios";
import type { ApiResponse } from "./types";

export type LeadStatus = 'New' | 'Contacted' | 'Interested' | 'Negotiation' | 'Booked' | 'Lost';
export type LeadSource = 'Instagram' | 'Linkdin' | 'Referral' | 'Ads' | 'Other' | string;
export type LeadEventType = 'Wedding' | 'Pre-wedding' | 'Maternity' | 'Event Shoot' | 'Other' | string;

export type Lead = {
  _id: string;
  clientName: string;
  phoneNumber: string;
  email?: string;
  source: LeadSource;
  inquiryDate: string;
  eventType: LeadEventType;
  eventDate?: string;
  eventLocation?: string;
  budget?: number;
  status: LeadStatus;
  notes?: string;
  lastContactedDate?: string;
  nextFollowUpDate?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadInput = Omit<Lead, "_id" | "user" | "createdAt" | "updatedAt">;

export async function getLeads(params?: Record<string, any>): Promise<Lead[]> {
  const res = await api.get<ApiResponse<Lead[]>>("/leads", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load leads");
  return res.data.data;
}

export async function getLeadById(id: string): Promise<Lead> {
  const res = await api.get<ApiResponse<Lead>>(`/leads/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load lead record");
  return res.data.data;
}

export async function createLead(payload: LeadInput): Promise<Lead> {
  const res = await api.post<ApiResponse<Lead>>("/leads", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create lead");
  return res.data.data;
}

export async function updateLead(id: string, payload: Partial<LeadInput>): Promise<Lead> {
  const res = await api.put<ApiResponse<Lead>>(`/leads/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update lead");
  return res.data.data;
}

export async function deleteLead(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/leads/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete lead");
}

export async function getLeadStats(): Promise<{ statusStats: any[]; sourceStats: any[] }> {
  const res = await api.get<ApiResponse<{ statusStats: any[]; sourceStats: any[] }>>("/leads/stats");
  if (!res.data.success) throw new Error(res.data.message || "Failed to load lead stats");
  return res.data.data;
}
