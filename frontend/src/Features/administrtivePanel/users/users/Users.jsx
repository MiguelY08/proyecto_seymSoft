import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Info, SquarePen, Trash2, Search, Download, Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const sampleData = [
  { id: 1,  tipo: 'CC',  documento: '1023984712',  nombre: 'Daniel Martínez Salazar',     correo: 'daniel.ms@gmail.com',              telefono: '3148650920', rol: 'Administrador', activo: true  },
  { id: 2,  tipo: 'CC',  documento: '1089456721',  nombre: 'Natalia García Pardo',        correo: 'natalia.ms@gmail.com',             telefono: '3156428790', rol: 'Administrador', activo: false },
  { id: 3,  tipo: 'CC',  documento: '1032165987',  nombre: 'Sebastián López Herrera',     correo: 'seb.lopezh@hotmail.com',           telefono: '3204846751', rol: 'Empleado',      activo: false },
  { id: 4,  tipo: 'CE',  documento: '1076543219',  nombre: 'Valentina Ortiz Ramírez',     correo: 'vale.ortiz@gmail.com',             telefono: '3112987645', rol: 'Empleado',      activo: true  },
  { id: 5,  tipo: 'CC',  documento: '1009874563',  nombre: 'Juan David Restrepo Ruiz',    correo: 'juandavidr@gmail.com',             telefono: '3017546892', rol: 'Empleado',      activo: true  },
  { id: 6,  tipo: 'CC',  documento: '1098234567',  nombre: 'Camila Rodríguez Gómez',      correo: 'camilardg@gmail.com',              telefono: '3129087645', rol: 'Empleado',      activo: true  },
  { id: 7,  tipo: 'CC',  documento: '1094827365',  nombre: 'Carlos Ramírez Gómez',        correo: 'carlos.ramirez@gmail.com',         telefono: '3204568790', rol: 'Cliente',       activo: true  },
  { id: 8,  tipo: 'CE',  documento: '1029384756',  nombre: 'Ana Lucía Torres',            correo: 'ana.torres@hotmail.com',           telefono: '3129087645', rol: 'Cliente',       activo: true  },
  { id: 9,  tipo: 'NIT', documento: '901457892-3', nombre: 'Papelera El Punto S.A.S',     correo: 'contacto@papeleraelpunto.c...',    telefono: '6013459876', rol: 'Cliente',       activo: false },
  { id: 10, tipo: 'CC',  documento: '1002938475',  nombre: 'Jorge Ríos',                  correo: 'jorge.rios@yahoo.com',             telefono: '3115698234', rol: 'Cliente',       activo: true  },
  { id: 11, tipo: 'CC',  documento: '1109876543',  nombre: 'Natalia Castaño López',       correo: 'natalia.castano@gmail.com',        telefono: '3208796541', rol: 'Cliente',       activo: true  },
  { id: 12, tipo: 'NIT', documento: '901237845-9', nombre: 'Distribuciones Andina Ltda.', correo: 'ventas@andinaltda.co',             telefono: '6043218790', rol: 'Cliente',       activo: true  },
  { id: 13, tipo: 'CE',  documento: '1039847265',  nombre: 'Pedro Alvarado Mendoza',      correo: 'pedro.alvarado@gmail.com',         telefono: '3117659870', rol: 'Cliente',       activo: true  },
  { id: 14, tipo: 'CC',  documento: '1092736452',  nombre: 'Laura Restrepo Ortiz',        correo: 'laura.restrepo@gmail.com',         telefono: '3149087234', rol: 'Cliente',       activo: false },
  { id: 15, tipo: 'NIT', documento: '901984563-2', nombre: 'Industrias Bolívar S.A.',     correo: 'contacto@industriasbolivar.c...',  telefono: '6019087654', rol: 'Cliente',       activo: false },
  { id: 16, tipo: 'CC',  documento: '1087654321',  nombre: 'Ricardo Peña Salazar',        correo: 'ricardo.pena@gmail.com',           telefono: '3008765432', rol: 'Cliente',       activo: true  },
];

const RECORDS_PER_PAGE = 16;
const TOTAL_RECORDS    = 80;
const TOTAL_PAGES      = Math.ceil(TOTAL_RECORDS / RECORDS_PER_PAGE);

// ─── Toggle activo/inactivo ───────────────────────────────────────────────────
function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
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

// ─── Paginador ────────────────────────────────────────────────────────────────
function Pagination({ currentPage, totalPages, onPageChange }) {
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, '...', totalPages];
    if (currentPage >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === page
                ? 'bg-[#004D77] text-white shadow-sm'
                : 'text-gray-600 hover:bg-[#004D77]/10 hover:text-[#004D77]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
          currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Users ────────────────────────────────────────────────────────────────────
function Users({ data: initialData = sampleData, onDelete, onDownload }) {
  const [data, setData]               = useState(initialData);
  const [search, setSearch]           = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate                      = useNavigate();

  const handleToggle = (id) => {
    setData((prev) => prev.map((row) => row.id === id ? { ...row, activo: !row.activo } : row));
  };

  return (
    <div className="h-full flex flex-col gap-3 p-3 sm:p-4">

      {/* ── Barra superior ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 shrink-0">

        {/* Buscador */}
        <div className="relative flex-1 sm:flex-none sm:w-72 md:w-96">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
        </div>

        {/* Botones */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onDownload}
            title="Descargar"
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm border border-[#004D77] rounded-lg text-[#004D77] hover:bg-[#004D77] hover:text-white transition-colors cursor-pointer bg-white"
          >
            <span className="hidden sm:inline">Descargar</span>
            <Download className="w-4 h-4" strokeWidth={1.8} />
          </button>
          <button
            onClick={() => navigate('/users/form-user')}
            title="Nuevo usuario"
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm border border-[#004D77] rounded-lg text-[#004D77] hover:bg-[#004D77] hover:text-white transition-colors cursor-pointer bg-white"
          >
            <span className="hidden sm:inline">Nuevo usuario</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* ── Tabla ────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto rounded-xl shadow-md min-h-0">
        <table className="min-w-max w-full">
          <thead className="bg-[#004D77] text-white">
            <tr>
              {/* Columna # — sticky */}
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

                  {/* Columna # — sticky */}
                  <td className={`sticky left-0 z-10 ${rowBg} px-3 py-1.5 text-center text-xs text-gray-500 font-medium`}>
                    {row.id}
                  </td>

                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.tipo}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.documento}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">{row.nombre}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.correo}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.telefono}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.rol}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => navigate('/users/info-user', { state: { user: row } })}
                        className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                        title="Información"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => navigate('/users/form-user', { state: { user: row } })}
                        className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <SquarePen className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                      <ActiveToggle activo={row.activo} onChange={() => handleToggle(row.id)} />
                      <button
                        onClick={() => onDelete?.(row)}
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

      {/* ── Footer: registros + paginador ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{RECORDS_PER_PAGE}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{TOTAL_RECORDS}</span>
        </p>

        <div className="bg-white shadow-md rounded-xl px-3 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={TOTAL_PAGES}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <Outlet />
    </div>
  );
}

export default Users;