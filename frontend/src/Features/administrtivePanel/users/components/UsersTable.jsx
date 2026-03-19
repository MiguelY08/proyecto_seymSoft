import { useNavigate } from "react-router-dom";
import { Info, SquarePen, Trash2, Users, Plus, ShoppingBag } from "lucide-react";
import { useAlert } from "../../../shared/alerts/useAlert";
import { highlight, highlightEstado } from "../helpers/usersHelpers";
import { usePermissions } from "../../configuration/roles/hooks/usePermissions";

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange, search }) {
  const { showConfirm, showSuccess } = useAlert();
  const estadoResaltado = highlightEstado(activo, search);

  /**
   * Maneja el clic en el toggle, con confirmación para desactivar.
   */
  const handleClick = () => {
    if (activo) {
      showConfirm(
        "warning",
        "¿Está seguro que desea desactivar este usuario?",
        "",
        {
          confirmButtonText: "Desactivar",
          cancelButtonText: "Cancelar",
        },
      ).then((result) => {
        if (result.isConfirmed) {
          onChange();
          showSuccess(
            "Usuario desactivado",
            "El usuario ha sido desactivado exitosamente.",
          );
        }
      });
    } else {
      onChange();
      showSuccess(
        "Usuario activado",
        "El usuario ha sido activado exitosamente.",
      );
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      {estadoResaltado && (
        <span className="text-[9px] font-semibold">{estadoResaltado}</span>
      )}
      <button
        onClick={handleClick}
        className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
          activo ? "bg-green-500" : "bg-red-400"
        }`}
      >
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
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

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
          {/* hasPermission("usuarios.crear") && ( */}
          <button
            onClick={() => navigate("/admin/users/form-user")}
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            <span>Nuevo usuario</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
          {/* ) */}
        </>
      )}
    </div>
  );
}

// ─── UsersTable ───────────────────────────────────────────────────────────────
function UsersTable({
  data = [],
  onDelete,
  onToggle,
  search = "",
  totalData = 0,
}) {
  const navigate = useNavigate();
  const { showConfirm, showSuccess, showWarning } = useAlert();
  const { hasPermission } = usePermissions();

  /**
   * Maneja eliminación de usuario con validaciones y confirmación.
   * Verifica si está activo y si tiene ventas asociadas.
   * @param {object} row - Datos del usuario a eliminar.
   */
  const handleDelete = (row) => {
    if (row.active) {
      showWarning(
        "No es posible eliminar este usuario",
        "Debes desactivar el usuario antes de poder eliminarlo.",
      );
      return;
    }

    // Verificar ventas asociadas desde localStorage
    const ventas = (() => {
      try {
        const stored = localStorage.getItem("pm_sales");
        return stored ? JSON.parse(stored) : [];
      } catch {
        return [];
      }
    })();

    const ventasAsociadas = ventas.filter(
      (v) =>
        String(v.clienteId) === String(row.id) ||
        String(v.vendedorId) === String(row.id),
    );

    const tieneVentas = ventasAsociadas.length > 0;
    const roles = ventasAsociadas.reduce((acc, v) => {
      if (String(v.clienteId) === String(row.id)) acc.add("cliente");
      if (String(v.vendedorId) === String(row.id)) acc.add("vendedor");
      return acc;
    }, new Set());

    const rolesTexto = [...roles].join(" y ");
    const clienteNote = row.isClient
      ? ' Además, su perfil de cliente será eliminado y sus créditos y pagos quedarán registrados bajo el Cliente de Caja.'
      : '';

    const subtitulo = tieneVentas
      ? `Este usuario aparece como ${rolesTexto} en ${ventasAsociadas.length} venta(s) registrada(s). Al eliminarlo, esas ventas mostrarán "Usuario eliminado".${clienteNote} Esta acción no se podrá revertir.`
      : `No se podrá revertir la acción.${clienteNote}`;

    showConfirm(
      "warning",
      "¿Está seguro que desea eliminar este usuario?",
      subtitulo,
      { confirmButtonText: "Eliminar", cancelButtonText: "Cancelar" },
    ).then((result) => {
      if (result.isConfirmed) {
        onDelete?.(row);
        showSuccess(
          "Usuario eliminado",
          "El usuario ha sido eliminado exitosamente.",
        );
      }
    });
  };

  // Renderizar estado vacío si no hay datos
  if (data.length === 0) {
    return (
      <EmptyState isSearching={totalData > 0 && search.trim().length > 0} />
    );
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        {/* Header de la tabla con columnas fijas */}
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Tipo y Documento
            </th>
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
              Rol
            </th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">
              Acciones
            </th>
          </tr>
        </thead>

        {/* Cuerpo de la tabla con filas de usuarios */}
        <tbody>
          {data.map((row, index) => {
            const rowBg = index % 2 === 0 ? "bg-white" : "bg-gray-100";
            return (
              <tr
                key={row.id}
                className={`transition-colors duration-150 ${rowBg}`}
              >
                {/* Datos del usuario con resaltado de búsqueda */}
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  <span className="font-medium">
                    {highlight(row.documentType, search)}
                  </span>{" "}
                  {highlight(row.document, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  <div className="flex items-center justify-center gap-1.5">
                    {highlight(row.name, search)}
                    {row.isClient && (
                      <span
                        title="También es cliente"
                        className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#004D77]/10 shrink-0"
                      >
                        <ShoppingBag className="w-2.5 h-2.5 text-[#004D77]" strokeWidth={2} />
                      </span>
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
                  {highlight(row.role, search)}
                </td>
                {/* Acciones: info, editar, toggle activo, eliminar */}
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    {/* {hasPermission("usuarios.ver") && ( */}
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
                      <Info
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        strokeWidth={1.5}
                      />
                    </button>
                    {/* )} */}

                    {/* {hasPermission("usuarios.editar") && ( */}
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
                      <SquarePen
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        strokeWidth={1.5}
                      />
                    </button>
                    {/* )} */}

                    {/* {hasPermission("usuarios.cambiar_estado") && ( */}
                    <ActiveToggle
                      activo={row.active}
                      onChange={() => onToggle?.(row.id)}
                      search={search}
                    />
                    {/* )} */}

                    {/* {hasPermission("usuarios.eliminar") && ( */}
                    <button
                      onClick={() => handleDelete(row)}
                      className="text-gray-400 hover:scale-110 hover:text-red-500 transition cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                        strokeWidth={1.5}
                      />
                    </button>
                    {/* )} */}
                  </div>
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