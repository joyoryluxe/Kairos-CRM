import api from "./axios";

export const getMe = async (): Promise<{ success: boolean; user: any }> => {
  const response = await api.get("/auth/me");
  return response.data;
};
