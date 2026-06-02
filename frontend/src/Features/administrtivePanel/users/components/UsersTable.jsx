import { useNavigate } from "react-router-dom";
import { Info, SquarePen, Trash2, Users, Plus, ShoppingBag, Loader2 } from "lucide-react";
import { useState } from "react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { highlight, highlightEstado, formatDate } from "../helpers/usersHelpers";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";

// Usuario - Cliente del sistema
const SYSTEM_ID_USER = 999999999;

// ─── Toggle activo/inactivo (sin cambios) ──────────────────────────────────
function ActiveToggle({ activo, onChange, search }) {
  const { showConfirm, showSuccess, showWarning, showError } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const estadoResaltado = highlightEstado(activo, search);

  const handleClick = async () => {
    if (isLoading) return;
    const mensajeConfirm = activo
      ? "¿Está seguro que desea desactivar este usuario?"
      : "¿Está seguro que desea activar este usuario?";
    const confirm = await showConfirm("warning", mensajeConfirm, "", {
      confirmButtonText: activo ? "Desactivar" : "Activar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm?.isConfirmed) return;
    setIsLoading(true);
    try {
      await onChange();
      showSuccess(
        `Usuario ${activo ? "desactivado" : "activado"}`,
        `El usuario ha sido ${activo ? "desactivado" : "activado"} exitosamente.`
      );
    } catch (error) {
      const mensaje = error.response?.data?.message || error.message || "Error al cambiar el estado.";
      showError("Error", mensaje);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      {estadoResaltado && (
        <span className="text-[9px] font-semibold">{estadoResaltado}</span>
      )}
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
          activo ? "bg-green-500" : "bg-red-400"
        } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
      >
        {isLoading ? (
          <Loader2 className="absolute inset-0 m-auto w-4 h-4 text-white animate-spin" />
        ) : (
          <>
            <span
              className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
                activo ? "left-1.5" : "right-1.5"
              }`}
            >
              {activo ? "A" : "I"}
            </span>
            <span
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
                activo ? "left-5.75" : "left-0.5"
              }`}
            />
          </>
        )}
      </button>
    </div>
  );
}

// ─── Empty State (sin cambios) ────────────────────────────────────────────
function EmptyState({ isSearching }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <Users className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">
            No se encontraron resultados
          </p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ningún usuario coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">
            No hay usuarios registrados
          </p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Aún no se han registrado usuarios en el sistema. Crea el primero
            para comenzar.
          </p>
          <button
            onClick={() => navigate("/admin/users/form-user")}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            <span>Nuevo usuario</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </>
      )}
    </div>
  );
}

// ─── UsersTable con columna de fecha de creación ──────────────────────────────────
function UsersTable({
  data = [],
  onDelete,
  onToggle,
  search = "",
  totalData = 0,
}) {
  const navigate = useNavigate();
  const { showConfirm, showWarning, showError } = useAlert();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (row) => {
    if (deletingId === row.id) return;

    if (row.active) {
      showWarning(
        "No es posible eliminar este usuario",
        "Debes desactivar el usuario antes de poder eliminarlo."
      );
      return;
    }

    if (row.role) {
      showWarning(
        "No es posible eliminar este usuario",
        "Este usuario tiene un rol asignado. Primero debes quitarle el rol para poder eliminarlo."
      );
      return;
    }

    const confirm = await showConfirm(
      "warning",
      "¿Está seguro que desea eliminar este usuario?",
      "Esta acción no se puede revertir. Si el usuario tiene registros asociados (ventas, créditos, etc.), el sistema lo impedirá.",
      {
        confirmButtonText: "Eliminar",
        cancelButtonText: "Cancelar",
      }
    );

    if (!confirm?.isConfirmed) return;

    setDeletingId(row.id);

    try {
      await onDelete(row);
    } catch (error) {
      const mensaje =
        error.response?.data?.message ||
        error.message ||
        "Error al eliminar el usuario.";

      showError("Error", mensaje);
    } finally {
      setDeletingId(null);
    }
  };

  if (data.length === 0) {
    return <EmptyState isSearching={totalData > 0 && search.trim().length > 0} />;
  }

  // Imprimir usuario del sistema primero
  const sortedData = [...data].sort((a, b) => {
    if (a.id === SYSTEM_ID_USER) return -1;
    if (b.id === SYSTEM_ID_USER) return 1;
    return 0;
  });

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Correo electrónico</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Teléfono</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Registrado desde</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Rol</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => {
            const rowBg = index % 2 === 0 ? "bg-gray-100 hover:bg-blue-50" : "bg-white hover:bg-blue-50";
            const isDeleting = deletingId === row.id;
            const isSystemUser = row.id === SYSTEM_ID_USER;
            const formattedDate = formatDate(row.createdAt);
            return (
              <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    {highlight(row.name, search)}

                    {row.isClient && (
                      <div className="relative group">
                        <div className="w-5 h-5 rounded-full bg-[#004D77]/15 flex items-center justify-center hover:bg-[#004D77]/25 transition-all duration-200 cursor-help">
                          <ShoppingBag
                            className="w-3 h-3 text-[#004D77] group-hover:scale-110 transition-transform duration-200"
                            strokeWidth={1.8}
                          />
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-gray-800 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 font-medium">
                          También es cliente
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-gray-800 rotate-45"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.email, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.phone, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(formattedDate, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.role?.nameRole || "Sin rol (Null)", search)}
                </td>
                <td className="px-3 py-1.5">
                  {isSystemUser ? (
                    <div className="flex items-center justify-center">
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-blue-100 text-[#004D77] border border-blue-200">
                        Sistema
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          navigate("/admin/users/info-user", {
                            state: {
                              user: row,
                              origin: {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2,
                              },
                            },
                          });
                        }}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Información"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          navigate("/admin/users/form-user", {
                            state: {
                              user: row,
                              origin: {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2,
                              },
                            },
                          });
                        }}
                        className="text-gray-400 hover:scale-110 hover:text-[#004D77] transition cursor-pointer"
                        title="Editar"
                      >
                        <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                      <ActiveToggle
                        activo={row.active}
                        onChange={() => onToggle(row.id)}
                        search={search}
                      />
                      <button
                        onClick={() => handleDelete(row)}
                        disabled={isDeleting}
                        className={`text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer ${
                          isDeleting ? "opacity-50 cursor-wait" : ""
                        }`}
                        title="Eliminar"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UsersTable;