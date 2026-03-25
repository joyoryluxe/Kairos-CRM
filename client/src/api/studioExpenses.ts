import axios from './axios';

export interface StudioExpense {
  _id: string;
  amount: number;
  date: string;
  category: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudioExpenseInput {
  amount: number;
  date: string;
  category: string;
  notes?: string;
}

export const getStudioExpenses = async (params?: any) => {
  const response = await axios.get('/studio-expenses', { params });
  return response.data.data as StudioExpense[];
};

export const createStudioExpense = async (payload: StudioExpenseInput) => {
  const response = await axios.post('/studio-expenses', payload);
  return response.data.data as StudioExpense;
};

export const updateStudioExpense = async (id: string, payload: Partial<StudioExpenseInput>) => {
  const response = await axios.put(`/studio-expenses/${id}`, payload);
  return response.data.data as StudioExpense;
};

export const deleteStudioExpense = async (id: string) => {
  const response = await axios.delete(`/studio-expenses/${id}`);
  return response.data;
};
