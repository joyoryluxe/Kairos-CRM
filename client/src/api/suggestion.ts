import api from './axios';

export const getFieldSuggestions = async (model: string, field: string, query: string): Promise<string[]> => {
  const { data } = await api.get(`/suggestions/${model}/${field}`, {
    params: { q: query }
  });
  return data.data;
};
