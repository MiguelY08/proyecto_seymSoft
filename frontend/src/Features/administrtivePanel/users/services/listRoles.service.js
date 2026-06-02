import apiClient from "../../../../setting/apiClient.js";

export const listRoles = async () => {
  const response = await apiClient.get("/roles/listar");

  return (response.data.data || []).map((role) => ({
    id: role.id_role,
    name: role.name_role,
    description: role.description,
    active: role.id_status === 1,
    isAdmin: role.is_admin,
    totalPermissions: role.total_permissions,
  }))
  .filter(
    (role) => 
      role.active &&
      role.totalPermissions > 0
  );
};

export default listRoles;
