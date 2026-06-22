const ROLE_NAME_PATTERN = /^[a-zA-Z][a-zA-Z0-9\s]*$/;

const hasSelectedPermission = (permissions = []) =>
  permissions.some((modulePermission) =>
    Object.values(modulePermission?.selectedActions || {}).some(Boolean)
  );

export const validateRole = (data, { mode = "create" } = {}) => {
  const errors = {};
  const name = data.name?.trim() || "";
  const description = data.description?.trim() || "";

  if (name.length < 5) {
    errors.name = "El nombre debe tener mínimo 5 caracteres";
  } else if (name.length > 20) {
    errors.name = "El nombre no puede superar 20 caracteres";
  } else if (!ROLE_NAME_PATTERN.test(name)) {
    errors.name =
      "El nombre debe iniciar con una letra y solo puede contener letras, números y espacios";
  } else if (name.toLowerCase() === "administrator") {
    errors.name =
      mode === "edit"
        ? "No puedes editar el rol Administrator"
        : "No puedes crear un rol Administrator";
  }

  if (description && description.length < 10) {
    errors.description = "La descripción debe tener mínimo 10 caracteres";
  } else if (description.length > 100) {
    errors.description = "La descripción no puede superar 100 caracteres";
  }

  if (!hasSelectedPermission(data.permissions)) {
    errors.permissions = "Debe asignar al menos un permiso";
  }

  return errors;
};
