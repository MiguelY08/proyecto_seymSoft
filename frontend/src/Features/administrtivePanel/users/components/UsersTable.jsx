
import {
  Info,
  SquarePen,
  Trash2,
  Users,
  Plus,
  ShoppingBag,
  Loader2
} from "lucide-react";

import { useCallback, useRef, useState } from "react";

import { useAlert } from "../../../shared/alerts/useAlert";

import {
  highlight,
  highlightEstado,
  formatDate
} from "../helpers/usersHelpers";
import { isSelfUser } from "../helpers/selfUser";

import Permission from "../../configuration/roles/components/Permission";

// Usuario - Cliente del sistema
const SYSTEM_ID_USER = 999999999;

function useTooltipPos() {
  const [pos, setPos] = useState(null);
  const ref = useRef(null);

  const show = useCallback(() => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const openUp = spaceBelow < 120 && spaceAbove > spaceBelow;

    setPos({
      left: Math.min(rect.left + rect.width / 2 - 80, window.innerWidth - 176),
      top: openUp ? rect.top - 8 : rect.bottom + 8,
      openUp,
    });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return { ref, pos, show, hide };
}

function FloatingTooltip({ pos, children }) {
  if (!pos) return null;

  return (
    <div
      className="fixed z-[9999] min-w-[160px] rounded-xl shadow-2xl p-3 pointer-events-none"
      style={{
        background: "#1e293b",
        left: pos.left,
        top: pos.openUp ? undefined : pos.top,
        bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
      }}
    >
      {children}
    </div>
  );
}

function ClientUserBadge() {
  const { ref, pos, show, hide } = useTooltipPos();

  return (
    <>
      <div
        ref={ref}
        className="w-5 h-5 rounded-full bg-[#004D77]/15 flex items-center justify-center"
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <ShoppingBag
          className="w-3 h-3 text-[#004D77]"
          strokeWidth={1.8}
        />
      </div>

      <FloatingTooltip pos={pos}>
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-1"
          style={{ color: "#94a3b8" }}
        >
          Usuario
        </p>
        <p className="text-xs whitespace-nowrap" style={{ color: "#f1f5f9" }}>
          También es cliente
        </p>
      </FloatingTooltip>
    </>
  );
}

// ─── Toggle activo/inactivo ──────────────────────────────────
function ActiveToggle({

  activo,
  onChange,
  search,
  disabled = false,
  disabledMessage = "No puedes cambiar el estado de este usuario."

}) {

  const {

    showConfirm,
    showSuccess,
    showError,
    showWarning

  } = useAlert();

  const [isLoading,setIsLoading] =
    useState(false);

  const estadoResaltado =
    highlightEstado(
      activo,
      search
    );

  const handleClick = async () => {

    if (disabled) {
      showWarning(
        "Acción no permitida",
        disabledMessage
      );
      return;
    }

    if (isLoading) return;

    if (activo) {
      const confirm =
        await showConfirm(
          "warning",
          "¿Está seguro que desea desactivar este usuario?",
          "",
          {
            confirmButtonText:
              "Desactivar",
            cancelButtonText:
              "Cancelar",
          }
        );
      if (!confirm?.isConfirmed)
        return;
    }
    setIsLoading(true);

    try {
      await onChange();
      showSuccess(
        `Usuario ${
          activo
            ? "desactivado"
            : "activado"
        }`,
        `El usuario ha sido ${
          activo
            ? "desactivado"
            : "activado"
        } exitosamente.`
      );
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Error al cambiar el estado.";
      showError(
        "Error",
        mensaje
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      {
        estadoResaltado && (
          <span className="text-[10px] font-semibold">
            {estadoResaltado}
          </span>
        )
      }

      <button
        onClick={handleClick}
        disabled={isLoading || disabled}
        title={disabled ? disabledMessage : undefined}
        className={`relative w-10 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
          activo
            ? "bg-green-500"
            : "bg-red-400"
        } ${
          isLoading || disabled
            ? `opacity-50 ${isLoading ? "cursor-wait" : "cursor-not-allowed"}`
            : ""
        }`}
      >
        {
          isLoading
            ?
            <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
            :
            <>
              <span
                className={`absolute top-1/2 -translate-y-1/2 text-white text-[10px] font-bold transition-all duration-300 ${
                  activo
                    ? "left-1"
                    : "right-1"
                }`}
              >
                {activo ? "A" : "I"}
              </span>
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                  activo
                    ? "left-[22px]"
                    : "left-0.5"
                }`}
              />
            </>
        }
      </button>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────
function EmptyState({
  isSearching,
  onCreateUser
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 gap-3">
      <div className="w-16 h-16 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <Users
          className="w-8 h-8 text-[#004D77]/40"
          strokeWidth={1.5}
        />
      </div>
      {
        isSearching
          ?
          <>
            <p className="text-sm font-semibold text-gray-500">
              No se encontraron resultados
            </p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Ningún usuario coincide con la búsqueda.
            </p>
          </>
          :
          <>
            <p className="text-sm font-semibold text-gray-500">
              No hay usuarios registrados
            </p>
            <p className="text-xs text-gray-400 text-center max-w-xs">
              Aún no se han registrado usuarios.
            </p>

            <Permission permission="usuarios.crear">
              <button
                onClick={() => onCreateUser?.()}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-xs font-semibold border text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
              >
                <span>
                  Nuevo usuario
                </span>
                <Plus
                  className="w-3.5 h-3.5"
                  strokeWidth={2}
                />
              </button>
            </Permission>
          </>
      }
    </div>
  );
}

// ─── UsersTable ──────────────────────────────────
function UsersTable({
  data = [],
  onDelete,
  onToggle,
  onViewInfo,
  onEdit,
  onCreateUser,
  search = "",
  totalData = 0,
}) {
  const {
    showConfirm,
    showWarning,
    showError
  } = useAlert();

  const [deletingId,setDeletingId] =
    useState(null);

  const handleDelete = async (
    row
  ) => {
    if (
      deletingId === row.id
    ) return;
    if (isSelfUser(row)) {
      showWarning(
        "Acción no permitida",
        "No puedes eliminar tu propio usuario."
      );
      return;
    }
    if (row.active) {
      showWarning(
        "No es posible eliminar este usuario",
        "Debes desactivar el usuario antes de eliminarlo."
      );
      return;
    }
    if (row.role) {
      showWarning(
        "No es posible eliminar este usuario",
        "Este usuario tiene un rol asignado."
      );
      return;
    }

    const confirm =
      await showConfirm(
        "warning",
        "¿Está seguro que desea eliminar este usuario?",
        "Esta acción no se puede revertir.",
        {
          confirmButtonText:
            "Eliminar",
          cancelButtonText:
            "Cancelar",
        }
      );
    if (!confirm?.isConfirmed)
      return;
    setDeletingId(row.id);

    try {
      await onDelete(row);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Error al eliminar el usuario.";
      showError(
        "Error",
        mensaje
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (data.length === 0) {
    return (
      <EmptyState
        isSearching={
          totalData > 0
          &&
          search.trim().length > 0
        }
        onCreateUser={onCreateUser}
      />
    );
  }

  const sortedData =
    [...data].sort((a,b)=>{
      if (a.id === SYSTEM_ID_USER)
        return -1;

      if (b.id === SYSTEM_ID_USER)
        return 1;
      return 0;
    });

  return (
    <div className="flex-1 overflow-x-auto rounded-xl min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Nombre
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Correo electrónico
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Teléfono
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Registrado desde
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Rol
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          {
            sortedData.map((row,index)=>{
              const rowBg =
                index % 2 === 0
                  ? "bg-gray-100 hover:bg-blue-50"
                  : "bg-white hover:bg-blue-50";
              const isDeleting =
                deletingId === row.id;
              const isSystemUser =
                row.id === SYSTEM_ID_USER;
              const isSelf =
                isSelfUser(row);
              const formattedDate =
                formatDate(
                  row.createdAt
                );
              return (
                <tr
                  key={row.id}
                  className={`transition-colors duration-150 ${rowBg}`}
                >
                  <td className="px-3 py-2 text-center text-xs text-gray-800 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {
                        highlight(
                          row.name,
                          search
                        )
                      }
                      {
                        row.isClient && (
                          <ClientUserBadge />
                        )
                      }
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                    {
                      highlight(
                        row.email,
                        search
                      )
                    }
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                    {
                      highlight(
                        row.phone,
                        search
                      )
                    }
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                    {
                      highlight(
                        formattedDate,
                        search
                      )
                    }
                  </td>
                  <td className="px-3 py-2 text-center text-xs text-gray-700 whitespace-nowrap">
                    {
                      highlight(
                        row.role?.nameRole || row.role?.name || "Sin rol",
                        search
                      )
                    }
                  </td>
                  <td className="px-3 py-2">
                    {
                      isSystemUser
                        ?
                        <div className="flex items-center justify-center">
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-100 text-[#004D77] border border-blue-200">
                            Sistema
                          </span>
                        </div>
                        :
                        <div className="flex items-center justify-center gap-1 sm:gap-1.5">

                          {/* ACTIVO */}
                          <Permission permission="usuarios.activar_desactivar">
                            <ActiveToggle
                              activo={row.active}
                              onChange={() =>
                                onToggle(row.id)
                              }
                              search={search}
                              disabled={isSelf}
                              disabledMessage="No puedes activar o desactivar tu propio usuario desde este módulo."
                            />
                          </Permission>

                          {/* VER */}
                          <Permission permission="usuarios.ver_informacion">
                            <button
                              onClick={(e)=>{
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                onViewInfo?.(
                                  row,
                                  {
                                    x:
                                      rect.left +
                                      rect.width / 2,
                                    y:
                                      rect.top +
                                      rect.height / 2,
                                  }
                                );
                              }}
                              className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                              title="Información"
                            >
                              <Info
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                strokeWidth={1.5}
                              />
                            </button>
                          </Permission>

                          {/* EDITAR */}
                          <Permission permission="usuarios.editar">
                            <button
                              onClick={(e)=>{
                                if (isSelf) {
                                  showWarning(
                                    "Acción no permitida",
                                    "No puedes editar tu propio usuario desde este módulo. Usa la sección de perfil."
                                  );
                                  return;
                                }
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                onEdit?.(
                                  row,
                                  {
                                    x:
                                      rect.left +
                                      rect.width / 2,
                                    y:
                                      rect.top +
                                      rect.height / 2,
                                  }
                                );
                              }}
                              disabled={isSelf}
                              className={`text-gray-400 transition ${
                                isSelf
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:scale-110 hover:text-[#004D77] cursor-pointer"
                              }`}
                              title={
                                isSelf
                                  ? "Edita tu cuenta desde la sección de perfil"
                                  : "Editar"
                              }
                            >
                              <SquarePen
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                strokeWidth={1.5}
                              />
                            </button>
                          </Permission>

                          {/* ELIMINAR */}
                          <Permission permission="usuarios.eliminar">
                            <button
                              onClick={() =>
                                handleDelete(row)
                              }
                              disabled={isDeleting || isSelf}
                              className={`text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer ${
                                isDeleting || isSelf
                                  ? `opacity-50 ${isDeleting ? "cursor-wait" : "cursor-not-allowed"}`
                                  : ""
                              }`}
                              title={
                                isSelf
                                  ? "No puedes eliminar tu propio usuario"
                                  : "Eliminar"
                              }
                            >
                              {
                                isDeleting
                                  ?
                                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                                  :
                                  <Trash2
                                    className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                                    strokeWidth={1.5}
                                  />
                              }
                            </button>
                          </Permission>
                        </div>
                    }
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

export default UsersTable;

