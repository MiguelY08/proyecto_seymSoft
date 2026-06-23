const FIELD_MAP = {
  name_role: "name",
  description: "description",
  permissions: "permissions",
};

const OPERATION_DEFAULTS = {
  load: ["No se pudieron cargar los roles", "No fue posible consultar los roles."],
  permissions: ["No se pudieron cargar los permisos", "No fue posible consultar los permisos disponibles."],
  detail: ["No se pudo consultar el rol", "No fue posible obtener la información del rol."],
  create: ["No se pudo crear el rol", "El rol no pudo ser registrado."],
  update: ["No se pudo actualizar el rol", "Los cambios no pudieron guardarse."],
  status: ["No se pudo cambiar el estado", "El estado del rol no pudo actualizarse."],
  delete: ["No se pudo eliminar el rol", "El rol no pudo eliminarse."],
};

const getIssueMessage = (issue) =>
  typeof issue === "string" ? issue : issue?.message;

const extractIssues = (data) =>
  [data?.errors, data?.details, data?.error?.errors, data?.error?.details]
    .find(Array.isArray) || [];

const mapFieldErrors = (issues) =>
  issues.reduce((result, issue) => {
    const path = Array.isArray(issue?.path)
      ? issue.path.find((part) => typeof part === "string")
      : issue?.field;
    const field = FIELD_MAP[path];
    const message = getIssueMessage(issue);

    if (field && message && !result[field]) result[field] = message;
    return result;
  }, {});

const inferTitle = (message, fallbackTitle) => {
  const normalized = message.toLowerCase();

  if (normalized.includes("ya existe un rol")) return "Nombre de rol duplicado";
  if (normalized.includes("empleados asociados")) return "Rol asignado a empleados";
  if (normalized.includes("administrator")) return "Rol protegido";
  if (normalized.includes("no existe")) return "Rol no encontrado";
  if (normalized.includes("permiso") || normalized.includes("privilegio")) return "Permisos inválidos";
  if (normalized.includes("módulo") || normalized.includes("modulo")) return "Módulo inválido";
  if (normalized.includes("estado")) return "Estado no válido";

  return fallbackTitle;
};

export const getRoleErrorInfo = (error, operation = "load") => {
  const [fallbackTitle, fallbackMessage] =
    OPERATION_DEFAULTS[operation] || OPERATION_DEFAULTS.load;
  const data = error?.response?.data;
  const status = error?.response?.status;
  const issues = extractIssues(data);
  const fieldErrors = mapFieldErrors(issues);

  if (error?.isNetworkError || !error?.response) {
    return {
      title: "Sin conexión con el servidor",
      message: error?.userMessage || "Verifica tu conexión e intenta nuevamente.",
      fieldErrors,
      type: "error",
    };
  }

  if (status === 401) {
    return {
      title: "Sesión no válida",
      message: data?.message || "Tu sesión expiró. Inicia sesión nuevamente.",
      fieldErrors,
      type: "warning",
    };
  }

  if (status === 403) {
    return {
      title: "Acción no permitida",
      message: data?.message || "No tienes permisos para realizar esta acción.",
      fieldErrors,
      type: "warning",
    };
  }

  const message =
    issues.map(getIssueMessage).find(Boolean) ||
    data?.message ||
    error?.message ||
    fallbackMessage;

  const normalizedMessage =
    message.toLowerCase();

  if (
    normalizedMessage.includes("ya existe un rol") ||
    normalizedMessage.includes("administrator")
  ) {
    fieldErrors.name ||= message;
  }

  if (
    normalizedMessage.includes("permiso") ||
    normalizedMessage.includes("privilegio") ||
    normalizedMessage.includes("módulo") ||
    normalizedMessage.includes("modulo")
  ) {
    fieldErrors.permissions ||= message;
  }

  return {
    title: inferTitle(message, fallbackTitle),
    message,
    fieldErrors,
    type: status >= 500 ? "error" : "warning",
  };
};

export const getFirstValidationError = (errors = {}) => {
  if (errors.name) return { title: "Nombre de rol inválido", message: errors.name };
  if (errors.description) return { title: "Descripción inválida", message: errors.description };
  if (errors.permissions) return { title: "Permisos requeridos", message: errors.permissions };

  return { title: "Información inválida", message: "Revisa los datos ingresados." };
};
