import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

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
    if (!isOpen) return;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative w-full max-w-6xl max-h-[94vh] sm:max-h-[90vh] bg-white rounded-xl shadow-2xl flex flex-col font-lexend z-10">
        <div className="bg-[#0E5676] text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3 rounded-t-xl">
          <h2 className="text-base sm:text-lg font-semibold">
            {mode === "create" && "Crear Rol"}
            {mode === "edit" && "Editar Rol"}
            {mode === "view" && "Ver Rol"}
          </h2>

          <button onClick={onClose} className="shrink-0">
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">
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
          <div className="px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row sm:justify-between gap-3 sm:gap-4 border-t border-gray-100">
            <button
              onClick={onClose}
              disabled={saving}
              className="w-full sm:w-1/3 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                saving ||
                loadingPermissions ||
                permisosSistema.length === 0 ||
                nameAvailable === false
              }
              className="w-full sm:w-1/3 bg-[#004D77] text-white py-2 rounded-lg hover:bg-[#003b5c] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
