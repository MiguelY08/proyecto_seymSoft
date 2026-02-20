import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, SquarePen, Trash2 } from 'lucide-react';
import { swalConfirm, swalSuccess } from '../../../shared/Alerts.js';

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

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange }) {
  const handleClick = () => {
    if (activo) {
      swalConfirm('warning', '¿Está seguro que desea desactivar este usuario?', '', {
        confirmButtonText: 'Desactivar',
        cancelButtonText:  'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          onChange();
          swalSuccess('Usuario desactivado', 'El usuario ha sido desactivado exitosamente.');
        }
      });
    } else {
      onChange();
      swalSuccess('Usuario activado', 'El usuario ha sido activado exitosamente.');
    }
  };

  return (
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
  );
}

// ─── UsersTable ───────────────────────────────────────────────────────────────
function UsersTable({ data = [], onDelete, onToggle, search = '' }) {
  const navigate = useNavigate();

  const handleDelete = (row) => {
    swalConfirm('warning', '¿Está seguro que desea eliminar este usuario?', 'No se podrá revertir la acción.', {
      confirmButtonText: 'Eliminar',
      cancelButtonText:  'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete?.(row);
        swalSuccess('Usuario eliminado', 'El usuario ha sido eliminado exitosamente.');
      }
    });
  };

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
                  {row.id}
                </td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.tipo}</td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{highlight(row.documento, search)}</td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">{highlight(row.nombre, search)}</td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{highlight(row.correo, search)}</td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{highlight(row.telefono, search)}</td>
                <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.rol}</td>
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
                    <ActiveToggle activo={row.activo} onChange={() => onToggle?.(row.id)} />
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