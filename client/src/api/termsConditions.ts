import api from "./axios";
import type { ApiResponse } from "./types";

export type TermsCondition = {
  _id: string;
  category: string;
  terms: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type TermsConditionInput = {
  category: string;
  terms: string[];
};

export async function getTermsConditions(): Promise<TermsCondition[]> {
  const res = await api.get<ApiResponse<TermsCondition[]>>("/terms-conditions");
  if (!res.data.success) throw new Error(res.data.message || "Failed to load terms and conditions");
  return res.data.data;
}

export async function getTermsConditionById(id: string): Promise<TermsCondition> {
  const res = await api.get<ApiResponse<TermsCondition>>(`/terms-conditions/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load terms and conditions");
  return res.data.data;
}

export async function saveTermsCondition(payload: TermsConditionInput): Promise<TermsCondition> {
  const res = await api.post<ApiResponse<TermsCondition>>("/terms-conditions", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to save terms and conditions");
  return res.data.data;
}

export async function deleteTermsCondition(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/terms-conditions/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete terms and conditions");
}
