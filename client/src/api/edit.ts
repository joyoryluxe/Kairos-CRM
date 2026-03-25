import api from "./axios";
import type { ApiResponse } from "./types";

export type EditType = string;
export type EditStatus = 'Pending' | 'In Progress' | 'Done' | 'Delivered';
export type EditPriority = 'Low' | 'Medium' | 'High';

export type Edit = {
  _id: string;
  title: string;
  type: EditType;
  clientName: string;
  status: EditStatus;
  priority: EditPriority;
  receivedDate: string;
  deadline: string;
  notes?: string;
  photoClipCount: number;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export type EditInput = Omit<Edit, "_id" | "user" | "createdAt" | "updatedAt">;

export async function getEdits(params?: Record<string, any>): Promise<Edit[]> {
  const res = await api.get<ApiResponse<Edit[]>>("/edits", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load edits");
  return res.data.data;
}

export async function getEditById(id: string): Promise<Edit> {
  const res = await api.get<ApiResponse<Edit>>(`/edits/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load edit record");
  return res.data.data;
}

export async function createEdit(payload: EditInput): Promise<Edit> {
  const res = await api.post<ApiResponse<Edit>>("/edits", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create edit");
  return res.data.data;
}

export async function updateEdit(id: string, payload: Partial<EditInput>): Promise<Edit> {
  const res = await api.patch<ApiResponse<Edit>>(`/edits/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update edit");
  return res.data.data;
}

export async function deleteEdit(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/edits/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete edit");
}

export async function getEditStats(): Promise<any[]> {
  const res = await api.get<ApiResponse<any[]>>("/edits/stats");
  if (!res.data.success) throw new Error(res.data.message || "Failed to load edit stats");
  return res.data.data;
}
