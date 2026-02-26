import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, SquarePen, Trash2, Users, Plus } from 'lucide-react';
import { useAlert } from '../../../shared/alerts/useAlert';

// ─── Resaltador de texto ──────────────────────────────────────────────────────
function highlight(text, term) {
  if (!term || !term.trim()) return text;
  const regex = new RegExp(`(${term.trim()})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <mark key={i} className="bg-[#004d7726] text-[#004D77] rounded px-0.5">{part}</mark>
      : part
  );
}

// ─── Resaltador para estado activo/inactivo ───────────────────────────────────
function highlightEstado(activo, term) {
  const estadoTexto  = activo ? 'Activo' : 'Inactivo';
  const termosEstado = ['activo', 'activos', 'inactivo', 'inactivos'];
  const termLower    = term.toLowerCase().trim();
  const isMatch      = termosEstado.includes(termLower) &&
                       estadoTexto.toLowerCase().startsWith(termLower.replace(/s$/, ''));
  if (!isMatch) return null;
  return (
    <mark className="bg-[#004d7726] text-[#004D77] rounded px-0.5">
      {estadoTexto}
    </mark>
  );
}

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange, search }) {
  const { showConfirm, showSuccess } = useAlert();
  const estadoResaltado = highlightEstado(activo, search);

  const handleClick = () => {
    if (activo) {
      showConfirm('warning', '¿Está seguro que desea desactivar este usuario?', '', {
        confirmButtonText: 'Desactivar',
        cancelButtonText:  'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          onChange();
          showSuccess('Usuario desactivado', 'El usuario ha sido desactivado exitosamente.');
        }
      });
    } else {
      onChange();
      showSuccess('Usuario activado', 'El usuario ha sido activado exitosamente.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-0.5">

      {/* Etiqueta resaltada si coincide con la búsqueda */}
      {estadoResaltado && (
        <span className="text-[9px] font-semibold">{estadoResaltado}</span>
      )}

      <button
        onClick={handleClick}
        className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
          activo ? 'bg-green-500' : 'bg-red-400'
        }`}
      >
        <span className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}>
          {activo ? 'A' : 'I'}
        </span>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-5.75' : 'left-0.5'
        }`} />
      </button>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ isSearching }) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 gap-4">
      <div className="w-20 h-20 rounded-full bg-[#004D77]/10 flex items-center justify-center">
        <Users className="w-10 h-10 text-[#004D77]/40" strokeWidth={1.5} />
      </div>
      {isSearching ? (
        <>
          <p className="text-base font-semibold text-gray-500">No se encontraron resultados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Ningún usuario coincide con la búsqueda. Intenta con otro término.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-semibold text-gray-500">No hay usuarios registrados</p>
          <p className="text-sm text-gray-400 text-center max-w-xs">
            Aún no se han registrado usuarios en el sistema. Crea el primero para comenzar.
          </p>
          <button
            onClick={() => navigate('/admin/users/form-user')}
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

// ─── UsersTable ───────────────────────────────────────────────────────────────
function UsersTable({ data = [], onDelete, onToggle, search = '', totalData = 0, offset = 0 }) {
  const navigate = useNavigate();
  const { showConfirm, showSuccess, showWarning } = useAlert();

  const handleDelete = (row) => {
    if (row.activo) {
      showWarning(
        'No es posible eliminar este usuario',
        'Debes desactivar el usuario antes de poder eliminarlo.'
      );
      return;
    }
    showConfirm('warning', '¿Está seguro que desea eliminar este usuario?', 'No se podrá revertir la acción.', {
      confirmButtonText: 'Eliminar',
      cancelButtonText:  'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete?.(row);
        showSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente.');
      }
    });
  };

  if (data.length === 0) {
    return <EmptyState isSearching={totalData > 0 && search.trim().length > 0} />;
  }

  return (
    <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
      <table className="min-w-max w-full">
        <thead className="bg-[#004D77] text-white">
          <tr>
            <th className="sticky left-0 z-10 bg-[#004D77] px-3 py-2.5 text-center text-xs font-semibold">#</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Tipo</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Documento</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Correo electrónico</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Teléfono</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Rol</th>
            <th className="px-3 py-2.5 text-center text-xs font-semibold">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
            return (
              <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>
                <td className={`sticky left-0 z-10 ${rowBg} px-3 py-1.5 text-center text-xs text-gray-500 font-medium`}>
                  {offset + index + 1}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.tipo, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.documento, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">
                  {highlight(row.nombre, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.correo, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.telefono, search)}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">
                  {highlight(row.rol, search)}
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                    <button
                      onClick={() => navigate('/admin/users/info-user', { state: { user: row } })}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Información"
                    >
                      <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => navigate('/admin/users/form-user', { state: { user: row } })}
                      className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
                    <ActiveToggle
                      activo={row.activo}
                      onChange={() => onToggle?.(row.id)}
                      search={search}
                    />
                    <button
                      onClick={() => handleDelete(row)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                    </button>
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