import api from "./axios";
import type { ApiResponse } from "./types";

export type Maternity = {
  _id: string;
  clientName: string;
  phoneNumber: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  babyName?: string;
  birthDate?: string;
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
  status?: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getMaternities(): Promise<Maternity[]> {
  const res = await api.get<ApiResponse<Maternity[]>>("/maternity");
  if (!res.data.success) throw new Error(res.data.message || "Failed to load maternities");
  return res.data.data;
}

export type MaternityInput = Omit<Maternity, "_id" | "createdAt" | "updatedAt">;

export async function createMaternity(payload: MaternityInput): Promise<Maternity> {
  const res = await api.post<ApiResponse<Maternity>>("/maternity", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create maternity record");
  return res.data.data;
}

export async function updateMaternity(id: string, payload: Partial<MaternityInput>): Promise<Maternity> {
  const res = await api.put<ApiResponse<Maternity>>(`/maternity/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update maternity record");
  return res.data.data;
}

export async function deleteMaternity(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/maternity/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete maternity record");
}


