import api from "./axios";
import type { ApiResponse } from "./types";

export type PackageCategory = "Maternity" | "Influencer" | "Corporate" | "General";

export type Package = {
  _id: string;
  name: string;
  category: PackageCategory;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PackageInput = Omit<Package, "_id" | "createdAt" | "updatedAt">;

export async function getPackages(category?: PackageCategory): Promise<Package[]> {
  const params: Record<string, string> = {};
  if (category) params.category = category;
  const res = await api.get<ApiResponse<Package[]>>("/packages", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load packages");
  return res.data.data;
}

export async function getActivePackages(category?: PackageCategory): Promise<Package[]> {
  const params: Record<string, string> = { activeOnly: "true" };
  if (category) params.category = category;
  const res = await api.get<ApiResponse<Package[]>>("/packages", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load packages");
  return res.data.data;
}

export async function createPackage(payload: PackageInput): Promise<Package> {
  const res = await api.post<ApiResponse<Package>>("/packages", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create package");
  return res.data.data;
}

export async function updatePackage(id: string, payload: Partial<PackageInput>): Promise<Package> {
  const res = await api.put<ApiResponse<Package>>(`/packages/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update package");
  return res.data.data;
}

export async function deletePackage(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/packages/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete package");
}
