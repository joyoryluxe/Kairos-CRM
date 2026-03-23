import api from "./axios";

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  googleCalendarConnected?: boolean;
};

export const getMe = async (): Promise<{ success: boolean; user: User }> => {
  const response = await api.get("/auth/me");
  return response.data;
};

export const updateProfile = async (
  payload: { name?: string; email?: string; password?: string }
): Promise<{ success: boolean; user: User }> => {
  const response = await api.put("/auth/profile", payload);
  return response.data;
};
