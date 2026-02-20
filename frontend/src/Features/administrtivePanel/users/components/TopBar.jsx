import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus } from 'lucide-react';
import { swalConfirm, swalTimer } from '../../../shared/Alerts.js';

// ─── TopBar ───────────────────────────────────────────────────────────────────
function TopBar({ search, onSearchChange, onDownload }) {
  const navigate = useNavigate();

  const handleDownload = () => {
    swalConfirm('question', '¿Desea descargar los usuarios?', '', {
      confirmButtonText: 'Descargar',
      cancelButtonText:  'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {

        // Aquí irá la lógica real de descarga
        onDownload?.();

        swalTimer('success', 'Se ha iniciado la descarga.', '', 5000, {
          html: `¿No ha iniciado la descarga?
                 <a href="#" id="swal-retry" class="font-semibold underline text-teal-700">
                   Click aquí para reintentar
                 </a>`,
          didOpen: () => {
            document.getElementById('swal-retry')?.addEventListener('click', (e) => {
              e.preventDefault();
              onDownload?.();
            });
          },
        });

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