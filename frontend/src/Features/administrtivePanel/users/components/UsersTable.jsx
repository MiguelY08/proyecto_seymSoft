
import { useNavigate } from "react-router-dom";
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
import Spinner from "../../../shared/spinner";

import {
  highlight,
  highlightEstado,
  formatDate
} from "../helpers/usersHelpers";

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
  search

}) {

  const {

    showConfirm,
    showSuccess,
    showError

  } = useAlert();

  const [isLoading,setIsLoading] =
    useState(false);

  const estadoResaltado =
    highlightEstado(
      activo,
      search
    );

  const handleClick = async () => {

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

    <div className="flex flex-col items-center gap-0.5">

      {

        estadoResaltado && (

          <span className="text-[9px] font-semibold">

            {estadoResaltado}

          </span>

        )

      }

      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
          activo
            ? "bg-green-500"
            : "bg-red-400"
        } ${

          isLoading
            ? "opacity-50 cursor-wait"
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
                className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
                  activo
                    ? "left-1.5"
                    : "right-1.5"
                }`}
              >

                {activo ? "A" : "I"}

              </span>

              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                  activo
                    ? "left-5.75"
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
  isSearching
}) {

  const navigate =
    useNavigate();

  return (

    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">

      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">

        <Users
          className="w-10 h-10 text-[#004D77]/40"
          strokeWidth={1.5}
        />

      </div>

      {

        isSearching

          ?

          <>

            <p className="text-base font-semibold text-gray-500">

              No se encontraron resultados

            </p>

            <p className="text-sm text-gray-400 text-center max-w-xs">

              Ningún usuario coincide con la búsqueda.

            </p>

          </>

          :

          <>

            <p className="text-base font-semibold text-gray-500">

              No hay usuarios registrados

            </p>

            <p className="text-sm text-gray-400 text-center max-w-xs">

              Aún no se han registrado usuarios.

            </p>

            <Permission permission="usuarios.crear">

              <button
                onClick={() =>
                  navigate("/admin/users/form-user")
                }
                className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
              >

                <span>
                  Nuevo usuario
                </span>

                <Plus
                  className="w-4 h-4"
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
  search = "",
  totalData = 0,

}) {

  const navigate =
    useNavigate();

  const {

    showConfirm,
    showWarning,
    showError

  } = useAlert();

  const [deletingId,setDeletingId] =
    useState(null);
  const [loadingMessage,setLoadingMessage] =
    useState("");

  const navigateWithSpinner = (
    message,
    to,
    options
  ) => {

    setLoadingMessage(message);

    window.setTimeout(() => {
      navigate(
        to,
        options
      );
    }, 80);

  };

  const handleDelete = async (
    row
  ) => {

    if (
      deletingId === row.id
    ) return;

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

    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">

      {

        loadingMessage && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">

            <Spinner
              message={loadingMessage}
              className="min-h-0"
            />

          </div>

        )

      }

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

              const formattedDate =
                formatDate(
                  row.createdAt
                );

              return (

                <tr
                  key={row.id}
                  className={`transition-colors duration-150 ${rowBg}`}
                >

                  <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">

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

                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">

                    {

                      highlight(
                        row.email,
                        search
                      )

                    }

                  </td>

                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">

                    {

                      highlight(
                        row.phone,
                        search
                      )

                    }

                  </td>

                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">

                    {

                      highlight(
                        formattedDate,
                        search
                      )

                    }

                  </td>

                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">

                    {

                      highlight(
                        row.role?.nameRole || row.role?.name || "Sin rol",
                        search
                      )

                    }

                  </td>

                  <td className="px-3 py-1.5">

                    {

                      isSystemUser

                        ?

                        <div className="flex items-center justify-center">

                          <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-[#004D77] border border-blue-200">

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
                            />

                          </Permission>

                          {/* VER */}

                          <Permission permission="usuarios.ver_informacion">

                            <button
                              onClick={(e)=>{

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                navigateWithSpinner(

                                  "Cargando detalles del usuario...",

                                  "/admin/users/info-user",

                                  {

                                    state: {

                                      user: row,

                                      origin: {

                                        x:
                                          rect.left +
                                          rect.width / 2,

                                        y:
                                          rect.top +
                                          rect.height / 2,

                                      },

                                    },

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

                                const rect =
                                  e.currentTarget.getBoundingClientRect();

                                navigateWithSpinner(

                                  "Cargando edicion del usuario...",

                                  "/admin/users/form-user",

                                  {

                                    state: {

                                      user: row,

                                      origin: {

                                        x:
                                          rect.left +
                                          rect.width / 2,

                                        y:
                                          rect.top +
                                          rect.height / 2,

                                      },

                                    },

                                  }

                                );

                              }}

                              className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                              title="Editar"
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

                              disabled={isDeleting}

                              className={`text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer ${
                                isDeleting
                                  ? "opacity-50 cursor-wait"
                                  : ""
                              }`}

                              title="Eliminar"
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

