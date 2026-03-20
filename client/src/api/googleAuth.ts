import api from "./axios";

export const getGoogleAuthUrl = async (): Promise<{ url: string }> => {
  const response = await api.get("/google-auth/url");
  return response.data;
};

export const syncAllRecords = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.post("/google-auth/sync-all");
  return response.data;
};
