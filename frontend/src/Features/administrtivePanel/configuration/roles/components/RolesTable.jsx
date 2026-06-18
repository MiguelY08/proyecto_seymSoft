import React from "react";
import { Info, SquarePen, Trash2 } from "lucide-react";

import { useAlert } from "../../../../shared/alerts/useAlert";
import { usePermissions } from "../hooks/usePermissions";

import {
  deleteRole,
  toggleRoleStatus,
} from "../services/rolesServices";

// ─────────────────────────────────────────────────────
// FUNCIÓN CENTRALIZADA: VALIDAR ROL PROTEGIDO
// ─────────────────────────────────────────────────────
// Soporta "Administrador" y "Administrator" (case-insensitive)

const isProtectedRole = (roleName) => {
  const protectedRoles = ["administrador", "administrator"];
  return protectedRoles.includes(roleName?.toLowerCase());
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

export default function RolesTable({

  roles = [],
  onEdit,
  onView,

  //  NUEVO
  reloadRoles,

  search = ""

}) {

  const {

    hasPermission

  } = usePermissions();

  const {

    showConfirm,
    showSuccess,
    showWarning,
    showError

  } = useAlert();

  // ─────────────────────────────
  // EDITAR
  // ─────────────────────────────

  const handleEditRole = (role) => {

    if (isProtectedRole(role.name)) {

      showWarning(
        "Rol protegido",
        "El rol Administrador no puede ser editado."
      );

      return;
    }

    onEdit(role);
  };

  // ─────────────────────────────
  // ACTIVAR / DESACTIVAR
  // ─────────────────────────────

  const handleToggleActive = async (role) => {

    try {

      if (isProtectedRole(role.name)) {

        showWarning(
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

      // ✅ FIX REAL
      await toggleRoleStatus(

        role.id,

        Boolean(role.active)

      );

      // ✅ RECARGAR TABLA
      await reloadRoles();

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

      showError(

        "Error",

        "No fue posible actualizar el estado del rol"

      );

    }

  };

  // ─────────────────────────────
  // ELIMINAR
  // ─────────────────────────────

  const handleDeleteRole = async (role) => {

    try {

      if (isProtectedRole(role.name)) {

        showWarning(
          "Rol protegido",
          "Este rol no puede eliminarse"
        );

        return;

      }

      if (role.active) {

        showWarning(
          "Rol activo",
          "Debes desactivar el rol antes de eliminarlo"
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

      showError(

        "Error",

        error.response?.data?.message
        ||
        "No fue posible eliminar el rol"

      );

    }

  };

  // ─────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────

  if (!roles.length) {

    return (

      <div className="text-center py-10 text-gray-500">

        No hay roles disponibles

      </div>

    );

  }

  // ─────────────────────────────
  // UI
  // ─────────────────────────────

  return (

    <div className="flex-1 overflow-x-auto rounded-xl shadow-md font-lexend">

      <table className="min-w-max w-full">

        <thead className="bg-[#004D77] text-white">

          <tr>

            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              #
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Nombre del Rol
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Descripción
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Fecha Creación
            </th>

            <th className="px-3 py-2.5 text-center text-xs font-semibold">
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

                  <td className="px-3 py-2 text-center text-xs">

                    {index + 1}

                  </td>

                  <td className="px-3 py-2 text-center text-xs font-semibold">

                    {highlight(
                      role.name,
                      search
                    )}

                  </td>

                  <td className="px-3 py-2 text-center text-xs">

                    {highlight(
                      role.description,
                      search
                    )}

                  </td>

                  <td className="px-3 py-2 text-center text-xs">

                    {

                      highlight(

                        formatDate(
                          role.createdAt
                        ),

                        search

                      )

                    }

                  </td>

                  <td className="px-3 py-2">

                    <div className="flex items-center justify-center gap-3">

                      {

                        hasPermission(
                          "roles.activar_desactivar"
                        )

                        &&

                        <button
                          onClick={() =>
                            handleToggleActive(role)
                          }
                          className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer ${
                            role.active
                              ? "bg-green-500"
                              : "bg-red-400"
                          }`}
                        >

                          <span
                            className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
                              role.active
                                ? "left-1.5"
                                : "right-1.5"
                            }`}
                          >

                            {role.active ? "A" : "I"}

                          </span>

                          <span
                            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                              role.active
                                ? "left-6"
                                : "left-0.5"
                            }`}
                          />

                        </button>

                      }

                      {

                        hasPermission(
                          "roles.ver_informacion"
                        )

                        &&

                        <Info
                          size={16}
                          onClick={() =>
                            onView(role)
                          }
                          className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                        />

                      }

                      {

                        hasPermission(
                          "roles.editar"
                        )

                        &&

                        <SquarePen
                          size={16}
                          onClick={() =>
                            handleEditRole(role)
                          }
                          className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-[#004D77]"
                        />

                      }

                      {

                        hasPermission(
                          "roles.eliminar"
                        )

                        &&

                        <Trash2
                          size={16}
                          onClick={() =>
                            handleDeleteRole(role)
                          }
                          className="text-gray-400 cursor-pointer hover:scale-110 transition hover:text-red-500"
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

  );

}