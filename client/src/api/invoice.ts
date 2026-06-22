import api from "./axios";
import type { ApiResponse } from "./types";

export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number | string;
  priceType?: 'flat' | 'percentage';
  total?: number; // Auto-calculated by backend
};

export type Invoice = {
  _id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  gstNumber?: string;
  issuedDate: string;
  items: InvoiceItem[];
  subTotal: number;
  discount?: number;
  totalAmount: number;
  paymentDetails: {
    bankAccount: string;
    upi: string;
    ifscCode: string;
    branchName: string;
    scannerImage: string;
  };
  termsAndConditions?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type InvoiceInput = Omit<Invoice, "_id" | "invoiceNumber" | "subTotal" | "totalAmount" | "createdAt" | "updatedAt"> & {
  invoiceNumber?: string;
};

export async function getInvoices(params?: Record<string, any>): Promise<{ data: Invoice[]; summary: any }> {
  const res = await api.get<ApiResponse<Invoice[]>>("/invoices", { params });
  if (!res.data.success) throw new Error(res.data.message || "Failed to load invoices");
  return {
    data: res.data.data,
    summary: (res.data as any).summary
  };
}

export async function getInvoiceById(id: string): Promise<Invoice> {
  const res = await api.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to load invoice");
  return res.data.data;
}

export async function createInvoice(payload: InvoiceInput): Promise<Invoice> {
  const res = await api.post<ApiResponse<Invoice>>("/invoices", payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to create invoice");
  return res.data.data;
}

export async function updateInvoice(id: string, payload: Partial<InvoiceInput>): Promise<Invoice> {
  const res = await api.put<ApiResponse<Invoice>>(`/invoices/${id}`, payload);
  if (!res.data.success) throw new Error(res.data.message || "Failed to update invoice");
  return res.data.data;
}

export async function deleteInvoice(id: string): Promise<void> {
  const res = await api.delete<ApiResponse<unknown>>(`/invoices/${id}`);
  if (!res.data.success) throw new Error(res.data.message || "Failed to delete invoice");
}
