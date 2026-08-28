import React from "react";
import { Info, Loader2, Plus, ShieldCheck, SquarePen, Trash2 } from "lucide-react";

import { useAlert } from "../../../../shared/alerts/useAlert";
import { usePermissions } from "../hooks/usePermissions";
import { getRoleErrorInfo } from "../helpers/roleErrorMapper";

import {
  deleteRole,
  toggleRoleStatus,
} from "../services/rolesServices";

// ─────────────────────────────────────────────────────
// FUNCIÓN CENTRALIZADA: VALIDAR ROL PROTEGIDO
// ─────────────────────────────────────────────────────
// Soporta "Administrador" y "Administrator" (case-insensitive)

const isProtectedRole = (role) => {
  const protectedRoles = ["administrador", "administrator"];
  return Boolean(
    role?.isAdmin ||
    protectedRoles.includes(role?.name?.toLowerCase())
  );
};

const highlight = (text, term) => {

  if (!term || !term.trim()) {
    return text;
  }

  const regex =
    new RegExp(`(${term.trim()})`, "gi");

  const parts =
    String(text).split(regex);

  return parts.map((part, index) =>

    regex.test(part)

      ? (
        <mark
          key={index}
          className="bg-[#004d7726] text-[#004D77] rounded px-0.5"
        >
          {part}
        </mark>
      )

      : part

  );

};

const formatDate = (dateString) => {
  if (!dateString) {
    return "";
  }

  return new Date(dateString).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const highlightRoleStatus = (active, term) => {
  const statusText = active ? "Activo" : "Inactivo";
  const normalizedTerm = String(term || "").trim().toLowerCase();
  const statusTerms = ["activo", "activos", "inactivo", "inactivos"];

  if (
    !statusTerms.includes(normalizedTerm) ||
    !statusText.toLowerCase().startsWith(normalizedTerm.replace(/s$/, ""))
  ) {
    return null;
  }

  return (
    <mark className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
      {statusText}
    </mark>
  );
};

function RoleActiveToggle({
  active,
  disabled = false,
  loading = false,
  onClick,
  search = "",
}) {
  const highlightedStatus = highlightRoleStatus(active, search);

  return (
    <div className="flex flex-col items-center gap-1">
      {highlightedStatus && (
        <span className="text-[10px] font-semibold">{highlightedStatus}</span>
      )}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled || loading}
        className={`relative h-6 w-12 shrink-0 rounded-full transition-colors duration-300 ${
          active ? "bg-green-500" : "bg-red-400"
        } ${
          disabled || loading
            ? `opacity-50 ${loading ? "cursor-wait" : "cursor-not-allowed"}`
            : "cursor-pointer"
        }`}
      >
        {loading ? (
          <Loader2 className="absolute inset-0 m-auto h-4.5 w-4.5 animate-spin text-white" />
        ) : (
          <>
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-[10px] font-bold text-white transition-all duration-300 ${
                active ? "left-1.5" : "right-1.5"
              }`}
            >
              {active ? "A" : "I"}
            </span>
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all duration-300 ${
                active ? "left-6" : "left-0.5"
              }`}
            />
          </>
        )}
      </button>
    </div>
  );
}

function EmptyState({ isSearching, canCreate, onCreateRole }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-4 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#004D77]/10">
        <ShieldCheck className="h-8 w-8 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-sm font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">Ningún rol coincide con la búsqueda.</p>
        </>
      ) : (
        <>
          <p className="text-sm font-semibold text-gray-500">No hay roles registrados</p>
          <p className="max-w-xs text-center text-xs text-gray-400">Aún no se han registrado roles.</p>
          {canCreate && (
            <button
              type="button"
              onClick={onCreateRole}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border bg-[#004D77] px-2 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#003a5c] sm:px-3"
            >
              <span>Nuevo rol</span>
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function RolesTable({

  roles = [],
  onEdit,
  onView,

  //  NUEVO
  reloadRoles,

  search = "",
  isSearching = false,
  onCreateRole,

}) {

  const pendingActionRef =
    React.useRef(null);

  const [
    pendingActionKey,
    setPendingActionKey
  ] = React.useState(null);

  const hasPendingAction =
    Boolean(pendingActionKey);

  const {

    hasPermission

  } = usePermissions();

  const canCreate = hasPermission("roles.crear");

  const {

    showConfirm,
    showSuccess,
    showWarning,
    showError

  } = useAlert();

  // ─────────────────────────────
  // EDITAR
  // ─────────────────────────────

  const handleEditRole = async (role) => {

    const actionKey =
      `edit-${role.id}`;

    if (pendingActionRef.current) {
      return;
    }

    pendingActionRef.current =
      actionKey;

    setPendingActionKey(
      actionKey
    );

    if (isProtectedRole(role)) {

      await showWarning(
        "Rol protegido",
        "El rol Administrador no puede ser editado."
      );

      pendingActionRef.current =
        null;

      setPendingActionKey(
        null
      );

      return;
    }

    await onEdit(role);

    pendingActionRef.current =
      null;

    setPendingActionKey(
      null
    );
  };

  const handleViewRole = async (role) => {

    const actionKey =
      `view-${role.id}`;

    if (pendingActionRef.current) {
      return;
    }

    pendingActionRef.current =
      actionKey;

    setPendingActionKey(
      actionKey
    );

    await onView(role);

    pendingActionRef.current =
      null;

    setPendingActionKey(
      null
    );
  };

  // ─────────────────────────────
  // ACTIVAR / DESACTIVAR
  // ─────────────────────────────

  const handleToggleActive = async (role) => {

    const actionKey =
      `toggle-${role.id}`;

    if (pendingActionRef.current) {
      return;
    }

    pendingActionRef.current =
      `confirm-${role.id}`;

    try {

      if (isProtectedRole(role)) {

        await showWarning(
          "Rol protegido",
          "Este rol no puede desactivarse"
        );

        return;

      }

      const action =
        role.active
          ? "desactivar"
          : "activar";

      const result =
        await showConfirm(

          "warning",

          `${

            action === "desactivar"

              ? "Desactivar"

              : "Activar"

          } rol`,

          `¿Deseas ${action} el rol "${role.name}"?`

        );

      if (!result.isConfirmed) {
        return;
      }

      pendingActionRef.current =
        actionKey;

      setPendingActionKey(
        actionKey
      );

      // ✅ FIX REAL
      await toggleRoleStatus(

        role.id,

        Boolean(role.active)

      );

      // ✅ RECARGAR TABLA
      await reloadRoles({
        showSpinner: false
      });

      showSuccess(

        "Estado actualizado",

        `El rol fue ${

          action === "desactivar"

            ? "desactivado"

            : "activado"

        } correctamente`

      );

    } catch (error) {

      console.error(error);

      const errorInfo =
        getRoleErrorInfo(error, "status");

      const showAlert =
        errorInfo.type === "error"
          ? showError
          : showWarning;

      showAlert(
        errorInfo.title,
        errorInfo.message
      );

    } finally {

      pendingActionRef.current =
        null;

      setPendingActionKey(
        null
      );

    }

  };

  // ─────────────────────────────
  // ELIMINAR
  // ─────────────────────────────

  const handleDeleteRole = async (role) => {

    const actionKey =
      `delete-${role.id}`;

    if (pendingActionRef.current) {
      return;
    }

    pendingActionRef.current =
      actionKey;

    setPendingActionKey(
      actionKey
    );

    try {

      if (isProtectedRole(role)) {

        await showWarning(
          "Rol protegido",
          "Este rol no puede eliminarse"
        );

        return;

      }

      const result =
        await showConfirm(

          "warning",

          "Eliminar rol",

          `¿Deseas eliminar el rol "${role.name}"?`

        );

      if (!result.isConfirmed) {
        return;
      }

      await deleteRole(
        role.id
      );

      // ✅ RECARGAR
      await reloadRoles();

      showSuccess(

        "Rol eliminado",

        "El rol fue eliminado correctamente"

      );

    } catch (error) {

      console.error(error);

      const errorInfo =
        getRoleErrorInfo(error, "delete");

      const showAlert =
        errorInfo.type === "error"
          ? showError
          : showWarning;

      showAlert(
        errorInfo.title,
        errorInfo.message
      );

    } finally {

      pendingActionRef.current =
        null;

      setPendingActionKey(
        null
      );

    }

  };

  // ─────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────

  if (!roles.length) {

    return (

      <EmptyState
        isSearching={isSearching}
        canCreate={canCreate}
        onCreateRole={onCreateRole}
      />

    );

  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (

    <div className="font-lexend">

      <div className="grid gap-3 md:hidden">

        {

          roles.map((role, index) => {

            return (

              <div
                key={role.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-gray-400">
                      #{index + 1}
                    </p>
                    <h3 className="mt-1 break-words text-sm font-semibold text-[#004D77]">
                      {highlight(role.name, search)}
                    </h3>
                  </div>

                  {

                    hasPermission(
                      "roles.activar_desactivar"
                    )

                    &&

                    <RoleActiveToggle
                      active={role.active}
                      disabled={
                        hasPendingAction &&
                        pendingActionKey !== `toggle-${role.id}`
                      }
                      loading={pendingActionKey === `toggle-${role.id}`}
                      search={search}
                      onClick={() =>
                        handleToggleActive(role)
                      }
                    />

                  }
                </div>

                <div className="mt-3 space-y-2 text-xs text-gray-600">
                  <p className="break-words">
                    <span className="font-semibold text-gray-500">Descripción:</span>{" "}
                    {highlight(role.description || "Sin descripción", search)}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-500">Fecha creación:</span>{" "}
                    {highlight(formatDate(role.createdAt), search)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-end gap-4 border-t border-gray-100 pt-3">

                  {

                    hasPermission(
                      "roles.ver_informacion"
                    )

                    &&

                    <Info
                      size={18}
                      onClick={() =>
                        handleViewRole(role)
                      }
                      className={`text-gray-400 transition ${
                        hasPendingAction
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer hover:scale-110 hover:text-[#004D77]"
                      }`}
                    />

                  }

                  {

                    hasPermission(
                      "roles.editar"
                    )

                    &&

                    <SquarePen
                      size={18}
                      onClick={() =>
                        handleEditRole(role)
                      }
                      className={`text-gray-400 transition ${
                        hasPendingAction
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer hover:scale-110 hover:text-[#004D77]"
                      }`}
                    />

                  }

                  {

                    hasPermission(
                      "roles.eliminar"
                    )

                    &&

                    <Trash2
                      size={18}
                      onClick={() =>
                        handleDeleteRole(role)
                      }
                      className={`text-gray-400 transition ${
                        hasPendingAction
                          ? "opacity-60 cursor-not-allowed"
                          : "cursor-pointer hover:scale-110 hover:text-red-500"
                      }`}
                    />

                  }

                </div>

              </div>

            );

          })

        }

      </div>

      <div className="hidden md:block flex-1 overflow-x-auto rounded-xl shadow-md">

      <table className="min-w-[760px] w-full">

        <thead className="bg-[#004D77] text-white">

          <tr>

            <th className="px-4 py-3 text-center text-sm font-semibold">
              #
            </th>

            <th className="px-4 py-3 text-center text-sm font-semibold">
              Nombre del Rol
            </th>

            <th className="px-4 py-3 text-center text-sm font-semibold">
              Descripción
            </th>

            <th className="px-4 py-3 text-center text-sm font-semibold">
              Fecha Creación
            </th>

            <th className="px-4 py-3 text-center text-sm font-semibold">
              Acciones
            </th>

          </tr>

        </thead>

        <tbody>

          {

            roles.map((role, index) => {

              const rowBg =
                index % 2 === 0
                  ? "bg-white"
                  : "bg-gray-100";

              return (

                <tr
                  key={role.id}
                  className={`${rowBg} hover:bg-blue-50 cursor-pointer transition-colors`}
                >

                  <td className="px-4 py-2.5 text-center text-sm text-gray-700 font-medium">

                    {index + 1}

                  </td>

                  <td className="px-3 py-2 text-center text-xs font-semibold max-w-[180px] break-words">

                    {highlight(
                      role.name,
                      search
                    )}

                  </td>

                  <td className="px-3 py-2 text-center text-xs max-w-[260px] break-words">

                    {highlight(
                      role.description,
                      search
                    )}

                  </td>

                  <td className="px-4 py-2.5 text-center text-sm text-gray-700">

                    {

                      highlight(

                        formatDate(
                          role.createdAt
                        ),

                        search

                      )

                    }

                  </td>

                  <td className="px-4 py-2.5">

                    <div className="flex items-center justify-center gap-2">

                      {

                        hasPermission(
                          "roles.activar_desactivar"
                        )

                        &&

                        <RoleActiveToggle
                          active={role.active}
                          disabled={
                            hasPendingAction &&
                            pendingActionKey !== `toggle-${role.id}`
                          }
                          loading={pendingActionKey === `toggle-${role.id}`}
                          search={search}
                          onClick={() =>
                            handleToggleActive(role)
                          }
                        />

                      }

                      {

                        hasPermission(
                          "roles.ver_informacion"
                        )

                        &&

                        <Info
                          size={20}
                          onClick={() =>
                            handleViewRole(role)
                          }
                          className={`text-gray-400 transition ${
                            hasPendingAction
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 hover:text-[#004D77]"
                          }`}
                        />

                      }

                      {

                        hasPermission(
                          "roles.editar"
                        )

                        &&

                        <SquarePen
                          size={20}
                          onClick={() =>
                            handleEditRole(role)
                          }
                          className={`text-gray-400 transition ${
                            hasPendingAction
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 hover:text-[#004D77]"
                          }`}
                        />

                      }

                      {

                        hasPermission(
                          "roles.eliminar"
                        )

                        &&

                        <Trash2
                          size={20}
                          onClick={() =>
                            handleDeleteRole(role)
                          }
                          className={`text-gray-400 transition ${
                            hasPendingAction
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 hover:text-red-500"
                          }`}
                        />

                      }

                    </div>

                  </td>

                </tr>

              );

            })

          }

        </tbody>

      </table>

      </div>
    </div>

  );

}
