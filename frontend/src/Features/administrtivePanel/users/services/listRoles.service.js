import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const listRoles = async () => {
  const response = await apiClient.get("/roles/listar");

  return (response.data.data || []).map((role) => ({
    id: role.id_role,
    name: role.name_role,
    description: role.description,
    active: role.id_status === 1,
    isAdmin: role.is_admin,
    totalPermissions: role.total_permissions,
  }));
};

export default listRoles;