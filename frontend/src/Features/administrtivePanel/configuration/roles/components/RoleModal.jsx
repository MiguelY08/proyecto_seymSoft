import { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck, SquarePen, UserPlus, X } from "lucide-react";

import Spinner from "../../../../shared/spinner/Spinner";

import PermissionsGrid from "./PermissionsGrid";

import { validateRole } from "../validators/roleValidation";
import {
  getFirstValidationError,
  getRoleErrorInfo,
} from "../helpers/roleErrorMapper";

import { useAlert } from "../../../../shared/alerts/useAlert";

import {
  getPermissions,
  mapearPermisosParaApi,
  validateRoleBeforeSave,
  validateRoleName,
  validateRolePermissions,
} from "../services/rolesServices";

export default function RoleModal({
  isOpen,
  onClose,
  onSave,
  roleData,
  mode = "create",
}) {
  const { showSuccess, showWarning, showError } = useAlert();

  const isView = mode === "view";

  const today = new Date().toISOString();

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = dateValue instanceof Date ? dateValue : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      timeZone: "UTC",
    });
  };

  const [nombre, setNombre] = useState("");

  const [descripcion, setDescripcion] = useState("");

  const [permisosSistema, setPermisosSistema] = useState([]);

  const [permisosRol, setPermisosRol] = useState([]);

  const [errors, setErrors] = useState({});

  const [loadingPermissions, setLoadingPermissions] = useState(false);

  const [saving, setSaving] = useState(false);

  const [checkingName, setCheckingName] = useState(false);

  const [checkingPermissions, setCheckingPermissions] = useState(false);

  const submitLockRef = useRef(false);

  const nameValidationRef = useRef(0);

  const permissionValidationRef = useRef(0);

  const [nameAvailable, setNameAvailable] = useState(true);

  const [permissionsValid, setPermissionsValid] = useState(true);

  const validateCurrentRole = (data) => validateRole(data, { mode });

  const getPermissionsPayload = (permissions) =>
    mapearPermisosParaApi(
      {
        name: nombre,
        description: descripcion,
        permisos: permissions,
      },
      permisosSistema,
    ).permissions;

  const getRemoteValidationData = (response) =>
    response?.data || response || {};

  const getValidationMessage = (data, defaultMessage) => {
    if (data?.name?.valid === false) {
      return data?.name?.message || defaultMessage;
    }

    if (data?.permissions?.valid === false) {
      return data?.permissions?.message || defaultMessage;
    }

    if (data?.valid === false) {
      return data?.message || defaultMessage;
    }

    return defaultMessage;
  };

  const getInputStyle = (hasError) =>
    `w-full mt-2 rounded-lg px-3 sm:px-4 py-2 text-sm outline-none transition-colors border ${
      hasError
        ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200"
        : "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
    }`;

  const validateRoleNameRemote = async (name) => {
    const response = await validateRoleName({
      name,
      id: mode === "edit" ? roleData?.id : undefined,
    });

    return getRemoteValidationData(response);
  };

  const validateRolePermissionsRemote = async (permissions) => {
    const response = await validateRolePermissions({
      id: mode === "edit" ? roleData?.id : undefined,
      permissions,
    });

    return getRemoteValidationData(response);
  };

  // ─────────────────────────────
  // CARGAR MÓDULOS Y PRIVILEGIOS
  // ─────────────────────────────

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoadingPermissions(true);

        const data = await getPermissions();

        setPermisosSistema(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error cargando permisos:", error);

        setPermisosSistema([]);

        const errorInfo = getRoleErrorInfo(error, "permissions");

        showError(errorInfo.title, errorInfo.message);
      } finally {
        setLoadingPermissions(false);
      }
    };

    if (isOpen) {
      loadPermissions();
    }
  }, [isOpen, showError]);

  useEffect(() => {
    if (!isOpen || mode === "view") return;

    const localNameError = validateCurrentRole({
      name: nombre,
      description: descripcion,
      permissions: permisosRol,
    }).name;

    if (!nombre.trim() || localNameError) {
      setNameAvailable(true);
      nameValidationRef.current += 1;
      return;
    }

    const currentRequestId = ++nameValidationRef.current;

    const timer = window.setTimeout(async () => {
      try {
        setCheckingName(true);

        const data = await validateRoleNameRemote(nombre.trim());

        if (currentRequestId !== nameValidationRef.current) {
          return;
        }

        const available = data?.available ?? data?.name?.valid ?? true;

        setNameAvailable(available);

        setErrors((prev) => ({
          ...prev,
          name: available
            ? localNameError || ""
            : getValidationMessage(data, "El nombre ya está en uso"),
        }));
      } catch (error) {
        console.error("Error validando nombre de rol:", error);
      } finally {
        if (currentRequestId === nameValidationRef.current) {
          setCheckingName(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
    };
  }, [nombre, isOpen, mode, roleData]);

  // ─────────────────────────────
  // INICIALIZAR FORMULARIO
  // ─────────────────────────────

  useEffect(() => {
    if (!isOpen) return;

    if (!permisosSistema.length) return;

    // ✅ LIMPIAR SIEMPRE PRIMERO
    setNombre("");
    setDescripcion("");
    setPermisosRol([]);
    setErrors({});

    // ─────────────────────────
    // CREAR
    // ─────────────────────────

    if (mode === "create") {
      const permisosIniciales = permisosSistema.map((modulo) => {
        const accionesIniciales = {};

        modulo.acciones.forEach((accion) => {
          accionesIniciales[accion.key] = false;
        });

        return {
          id: modulo.id,

          selectedActions: accionesIniciales,
        };
      });

      setPermisosRol(permisosIniciales);

      return;
    }

    // ─────────────────────────
    // EDITAR / VER
    // ─────────────────────────

    if ((mode === "edit" || mode === "view") && roleData) {
      setNombre(roleData.name || "");

      setDescripcion(roleData.description || "");

      const permisosMapeados = permisosSistema.map((modulo) => {
        // ✅ INICIALIZAR TODO FALSE
        const accionesIniciales = {};

        modulo.acciones.forEach((accion) => {
          accionesIniciales[accion.key] = false;
        });

        // ✅ MARCAR SOLO LOS DEL ROL
        (roleData.permisos || []).forEach((permiso) => {
          if (permiso.id_module === modulo.id) {
            const accionEncontrada = modulo.acciones.find(
              (acc) => acc.id_privilege === permiso.id_privilege,
            );

            if (accionEncontrada) {
              accionesIniciales[accionEncontrada.key] = true;
            }
          }
        });

        return {
          id: modulo.id,

          selectedActions: accionesIniciales,
        };
      });

      setPermisosRol(permisosMapeados);
    }
  }, [isOpen, mode, roleData, permisosSistema]);

  if (!isOpen) return null;

  // ─────────────────────────────
  // INPUTS
  // ─────────────────────────────

  const handleNombreChange = (value) => {
    setNombre(value);
    setNameAvailable(true);

    const validation = validateCurrentRole({
      name: value,

      description: descripcion,

      permissions: permisosRol,
    });

    setErrors((prev) => ({
      ...prev,

      name: validation.name || "",
    }));
  };

  const handleDescripcionChange = (value) => {
    setDescripcion(value);

    const validation = validateCurrentRole({
      name: nombre,

      description: value,

      permissions: permisosRol,
    });

    setErrors((prev) => ({
      ...prev,

      description: validation.description || "",
    }));
  };

  const handlePermissionsChange = async (permisos) => {
    setPermisosRol(permisos);

    const validation = validateCurrentRole({
      name: nombre,

      description: descripcion,

      permissions: permisos,
    });

    setErrors((prev) => ({
      ...prev,

      permissions: validation.permissions || "",
    }));

    setPermissionsValid(true);

    const currentRequestId = ++permissionValidationRef.current;

    try {
      setCheckingPermissions(true);

      const payloadPermissions = getPermissionsPayload(permisos);

      const data = await validateRolePermissionsRemote(payloadPermissions);

      if (currentRequestId !== permissionValidationRef.current) {
        return;
      }

      const valid = data?.valid ?? true;

      setPermissionsValid(valid);

      setErrors((prev) => ({
        ...prev,
        permissions:
          validation.permissions ||
          (valid
            ? ""
            : data?.permissions?.message ||
              data?.message ||
              "Uno o más permisos no son válidos"),
      }));
    } catch (error) {
      console.error("Error validando permisos de rol:", error);
    } finally {
      if (currentRequestId === permissionValidationRef.current) {
        setCheckingPermissions(false);
      }
    }
  };

  // ─────────────────────────────
  // SUBMIT
  // ─────────────────────────────

  const handleSubmit = async () => {
    if (isView || saving || submitLockRef.current) return;

    submitLockRef.current = true;

    const validationErrors = validateCurrentRole({
      name: nombre,

      description: descripcion,

      permissions: permisosRol,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      const validationAlert = getFirstValidationError(validationErrors);

      await showWarning(validationAlert.title, validationAlert.message);

      submitLockRef.current = false;

      return;
    }

    try {
      setSaving(true);

      const remoteValidation = await validateRoleBeforeSave(
        {
          id: roleData?.id,
          name: nombre,
          description: descripcion,
          permisos: permisosRol,
        },
        permisosSistema,
      );

      const remoteData = getRemoteValidationData(remoteValidation);

      const nameValid =
        remoteData?.available ?? remoteData?.name?.valid ?? true;
      const permissionsValidRemote = remoteData?.permissions?.valid ?? true;
      const formValid =
        remoteData?.valid !== false && nameValid && permissionsValidRemote;

      if (!formValid) {
        const message = getValidationMessage(
          remoteData,
          "No se pudo validar el rol antes de guardar",
        );

        setErrors((prev) => ({
          ...prev,
          name: !nameValid ? message : prev.name,
          permissions: !permissionsValidRemote ? message : prev.permissions,
        }));

        await showWarning("Validación de rol", message);

        submitLockRef.current = false;
        setSaving(false);
        return;
      }
    } catch (error) {
      console.error("Error validando rol antes de guardar:", error);
      setSaving(false);
      submitLockRef.current = false;
      return;
    }

    const payload = {
      id: roleData?.id,

      name: nombre,

      description: descripcion,

      active: roleData?.active ?? true,

      createdAt: roleData?.createdAt || today,

      permisos: permisosRol,
    };

    try {
      setSaving(true);

      const response = await onSave(payload);

      if (response?.success) {
        if (mode === "create") {
          showSuccess(
            "Rol creado",

            "El rol fue registrado correctamente",
          );
        }

        if (mode === "edit") {
          showSuccess(
            "Rol actualizado",

            "Los cambios del rol fueron guardados",
          );
        }

        // ✅ LIMPIAR
        setNombre("");
        setDescripcion("");
        setPermisosRol([]);
        setErrors({});

        onClose();
      }
    } catch (error) {
      console.error("Error guardando rol:", error);

      const errorInfo = getRoleErrorInfo(
        error,
        mode === "edit" ? "update" : "create",
      );

      setErrors((previous) => ({
        ...previous,
        ...errorInfo.fieldErrors,
      }));

      const showAlert = errorInfo.type === "error" ? showError : showWarning;

      showAlert(errorInfo.title, errorInfo.message);
    } finally {
      setSaving(false);

      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:p-4">
      <div className="absolute inset-0 hidden bg-black/40 backdrop-blur-sm sm:block" />

      <div className="relative z-10 flex h-dvh w-full flex-col overflow-hidden bg-white font-lexend shadow-2xl sm:h-auto sm:max-h-[90vh] sm:max-w-6xl sm:rounded-xl">
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:rounded-t-xl sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                {mode === "create" ? (
                  <UserPlus className="h-5 w-5 text-white" strokeWidth={1.8} />
                ) : mode === "edit" ? (
                  <SquarePen className="h-5 w-5 text-white" strokeWidth={1.8} />
                ) : (
                  <ShieldCheck className="h-5 w-5 text-white" strokeWidth={1.8} />
                )}
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">
                  {mode === "create" && "Crear rol"}
                  {mode === "edit" && "Editar rol"}
                  {mode === "view" && "Ver rol"}
                </h2>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Cerrar formulario de rol"
              className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label className="text-sm font-medium">Nombre del Rol</label>

              <input
                value={nombre}
                disabled={isView || saving}
                maxLength={20}
                onChange={(e) => handleNombreChange(e.target.value)}
                className={getInputStyle(Boolean(errors.name))}
              />

              {errors.name ? (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              ) : (
                checkingName &&
                nombre.trim() && (
                  <p className="mt-1 text-xs text-[#004D77]">
                    Validando nombre...
                  </p>
                )
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Fecha de Creación</label>

              <input
                value={formatDate(roleData?.createdAt || today)}
                disabled
                className="w-full mt-2 bg-gray-200 rounded-lg px-3 sm:px-4 py-2 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">
                Descripción (opcional)
              </label>

              <textarea
                rows="4"
                value={descripcion}
                disabled={isView || saving}
                maxLength={100}
                onChange={(e) => handleDescripcionChange(e.target.value)}
                className="w-full mt-2 border border-gray-400 rounded-lg px-3 sm:px-4 py-2 text-sm focus:outline-blue-600"
              />

              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">
              Permisos y Privilegios
            </h3>

            {loadingPermissions ? (
              <Spinner message="Cargando permisos..." className="min-h-62.5" />
            ) : (
              <PermissionsGrid
                permisosSistema={permisosSistema}
                permisosRol={permisosRol}
                onChange={handlePermissionsChange}
                readOnly={isView}
              />
            )}

            {errors.permissions && (
              <p className="text-red-500 text-xs mt-2">{errors.permissions}</p>
            )}
          </div>
        </div>

        {mode !== "view" && (
          <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              Cerrar
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                saving ||
                loadingPermissions ||
                permisosSistema.length === 0 ||
                nameAvailable === false
              }
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : mode === "create" ? (
                <UserPlus className="h-4 w-4" strokeWidth={1.8} />
              ) : (
                <SquarePen className="h-4 w-4" strokeWidth={1.8} />
              )}
              {saving ? "Guardando..." : mode === "create" ? "Crear rol" : "Guardar cambios"}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
