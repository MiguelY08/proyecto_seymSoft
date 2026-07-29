import apiClient from "../../../setting/apiClient.js";

export const getProfileSummary = async () => {
  const response = await apiClient.get("/auth/profile");
  return response?.data?.data ?? null;
};

export default {
  getProfileSummary,
};
