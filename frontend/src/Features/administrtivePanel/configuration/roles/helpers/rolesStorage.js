const ROLES_KEY = "app_roles";

export const getRolesStorage = () => {
  const roles = localStorage.getItem(ROLES_KEY);
  return roles ? JSON.parse(roles) : [];
};

export const saveRolesStorage = (roles) => {
  localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
};