import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus } from 'lucide-react';
import { useAlert } from '../../../shared/alerts/useAlert';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'pm_users';

// ─── Generador de Excel ───────────────────────────────────────────────────────
const downloadExcel = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  const users  = stored ? JSON.parse(stored) : [];

  if (users.length === 0) return false;

  // ─── Mapear datos a columnas legibles ─────────────────────────────────────
  const rows = users.map((u) => ({
    'ID':                 u.id,
    'Tipo Documento':     u.tipo,
    'Documento':          u.documento,
    'Nombre Completo':    u.nombre,
    'Correo Electrónico': u.correo,
    'Teléfono':           u.telefono,
    'Rol':                u.rol,
    'Estado':             u.activo ? 'Activo' : 'Inactivo',
    'Registrado Desde':   u.registradoDesde ?? '—',
  }));

  const worksheet  = XLSX.utils.json_to_sheet(rows);
  const workbook   = XLSX.utils.book_new();

  // ─── Ancho de columnas ────────────────────────────────────────────────────
  worksheet['!cols'] = [
    { wch: 6  },  // ID
    { wch: 16 },  // Tipo Documento
    { wch: 18 },  // Documento
    { wch: 28 },  // Nombre Completo
    { wch: 30 },  // Correo
    { wch: 14 },  // Teléfono
    { wch: 16 },  // Rol
    { wch: 12 },  // Estado
    { wch: 18 },  // Registrado Desde
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Usuarios');

  const fecha = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  XLSX.writeFile(workbook, `usuarios_${fecha}.xlsx`);

  return true;
};

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ search, onSearchChange }) {
  const navigate = useNavigate();
  const { showConfirm, showTimer, showWarning } = useAlert();

  const handleDownload = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const users  = stored ? JSON.parse(stored) : [];

    // ─── Sin registros no tiene sentido descargar ─────────────────────────
    if (users.length === 0) {
      showWarning('Sin registros', 'No hay usuarios registrados para descargar.');
      return;
    }

    showConfirm('question', '¿Desea descargar los usuarios?', `Se exportarán ${users.length} registro${users.length !== 1 ? 's' : ''} en formato Excel.`, {
      confirmButtonText: 'Descargar',
      cancelButtonText:  'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const success = downloadExcel();
        if (success) {
          showTimer('success', 'Descarga completada', 'El archivo Excel se ha generado exitosamente.', 4000);
        }
      }
    });
  };

  return (
    <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

      {/* Buscador */}
      <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
        <input
          type="text"
          placeholder="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
      </div>

      {/* Botones */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleDownload}
          title="Descargar"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Descargar</span>
          <Download className="w-4 h-4" strokeWidth={1.8} />
        </button>
        <button
          onClick={() => navigate('/admin/users/form-user')}
          title="Nuevo usuario"
          className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
        >
          <span className="hidden sm:inline">Nuevo usuario</span>
          <Plus className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

    </div>
  );
}

export default TopBar;