import React, { useState } from 'react';
import { Info, SquarePen, Trash2, Search, Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import FormClient from './FormClient';
import InfoClient from './InfoClient';

const sampleData = [
  { id: 1,  tipo: 'CC',  numero: '1094827365',  nombre: 'Carlos Ramírez Gómez',             correo: 'carlos.ramirez@gmail.com',        telefono: '3204568790', tipoCliente: 'Detal',     activo: true  },
  { id: 2,  tipo: 'CE',  numero: '1029384756',  nombre: 'Ana Lucía Torres',                 correo: 'ana.torres@hotmail.com',          telefono: '3129087645', tipoCliente: 'Mayorista', activo: true  },
  { id: 3,  tipo: 'NIT', numero: '901457892-3', nombre: 'Papelera El Punto S.A.S',          correo: 'contacto@papeleraelpunto.co',     telefono: '6013459876', tipoCliente: 'Mayorista', activo: true  },
  { id: 4,  tipo: 'CC',  numero: '1002938475',  nombre: 'Jorge Enrique Ríos',               correo: 'jorge.rios@yahoo.com',            telefono: '3115698234', tipoCliente: 'Detla',     activo: true  },
  { id: 5,  tipo: 'CC',  numero: '1109876543',  nombre: 'Natalia Castaño López',            correo: 'natalia.castano@gmail.com',       telefono: '3208796541', tipoCliente: 'Mayorista', activo: true  },
  { id: 6,  tipo: 'NIT', numero: '901237845-9', nombre: 'Distribuciones Andina Ltda.',      correo: 'ventas@andinaltda.co',            telefono: '6043218790', tipoCliente: 'Mayorista', activo: true  },
  { id: 7,  tipo: 'CE',  numero: '1039847265',  nombre: 'Pedro Alvarado Mendoza',           correo: 'pedro.alvarado@gmail.com',        telefono: '3117659870', tipoCliente: 'Detal',     activo: true  },
  { id: 8,  tipo: 'CC',  numero: '1092736452',  nombre: 'Laura Restrepo Ortiz',             correo: 'laura.restrepo@gmail.com',        telefono: '3149087234', tipoCliente: 'Detal',     activo: false },
  { id: 9,  tipo: 'NIT', numero: '901984563-2', nombre: 'Industrias Bolívar S.A.',          correo: 'contacto@industriasbolivar.co',   telefono: '6019087654', tipoCliente: 'Mayorista', activo: false },
  { id: 10, tipo: 'CC',  numero: '1087654321',  nombre: 'Ricardo Peña Salazar',             correo: 'ricardo.pena@gmail.com',          telefono: '3008765432', tipoCliente: 'Mayorista', activo: true  },
  { id: 11, tipo: 'NIT', numero: '900456732-1', nombre: 'Comercializadora La Estrella',     correo: 'ventas@laestrella.co',            telefono: '6047659876', tipoCliente: 'Mayorista', activo: false },
  { id: 12, tipo: 'CE',  numero: '1045678932',  nombre: 'María Fernanda Gaitán',            correo: 'maria.gaitan@hotmail.com',        telefono: '3124567890', tipoCliente: 'Detal',     activo: true  },
  { id: 13, tipo: 'NIT', numero: '901765432-5', nombre: 'Papeles & Cía S.A.S',              correo: 'contacto@papelesycia.com',        telefono: '6044567890', tipoCliente: 'Mayorista', activo: true  },
  { id: 14, tipo: 'CC',  numero: '1098765432',  nombre: 'David Alejandro Suárez',           correo: 'david.suarez@gmail.com',          telefono: '3109876543', tipoCliente: 'Detal',     activo: true  },
  { id: 15, tipo: 'NIT', numero: '901567321-8', nombre: 'Oficina Express Ltda.',            correo: 'contacto@oficinaexpress.com',     telefono: '6017654321', tipoCliente: 'Mayorista', activo: true  },
  { id: 16, tipo: 'CC',  numero: '1008765432',  nombre: 'Camila Orozco Vargas',             correo: 'camila.orozco@gmail.com',         telefono: '3147659876', tipoCliente: 'Detal',     activo: true  },
];

const RECORDS_PER_PAGE = 15;

function ActiveToggle({ activo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-5 rounded-full transition-colors duration-300 cursor-pointer shrink-0 ${
        activo ? 'bg-green-500' : 'bg-red-400'
      }`}
    >
      <span
        className={`absolute top-1/2 -translate-y-1/2 text-white text-[9px] font-bold transition-all duration-300 ${
          activo ? 'left-1.5' : 'right-1.5'
        }`}
      >
        {activo ? 'A' : 'I'}
      </span>
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${
          activo ? 'left-[23px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

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
          currentPage === 1
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
      </button>

      {getVisiblePages().map((page, i) =>
        page === '...' ? (
          <span key={`d-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400 text-xs">
            ...
          </span>
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
          currentPage === totalPages
            ? 'text-gray-300 cursor-not-allowed'
            : 'text-[#004D77] hover:bg-[#004D77]/10 cursor-pointer'
        }`}
      >
        <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}

function Clients({ data: initialData = sampleData, onDelete }) {
  const [data, setData]                       = useState(initialData);
  const [search, setSearch]                   = useState('');
  const [currentPage, setCurrentPage]         = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient, setSelectedClient]   = useState(null);

  const handleToggle = (id) => {
    setData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, activo: !row.activo } : row))
    );
  };

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleInfo = (client) => {
    setSelectedClient(client);
    setIsInfoModalOpen(true);
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const handleDownload = () => {
    console.log('Descargando clientes...');
  };

  const handleSave = (formData) => {
    if (selectedClient) {
      setData((prev) =>
        prev.map((row) =>
          row.id === selectedClient.id
            ? {
                ...row,
                tipo: formData.tipo,
                numero: formData.numero,
                nombre: `${formData.nombres} ${formData.apellidos}`.trim(),
                correo: formData.correo,
                telefono: formData.telefono,
                tipoCliente: formData.tipoCliente,
              }
            : row
        )
      );
    } else {
      const newClient = {
        id: data.length + 1,
        tipo: formData.tipo,
        numero: formData.numero,
        nombre: `${formData.nombres} ${formData.apellidos}`.trim(),
        correo: formData.correo,
        telefono: formData.telefono,
        tipoCliente: formData.tipoCliente,
        activo: true,
      };
      setData((prev) => [...prev, newClient]);
    }
    setIsFormModalOpen(false);
  };

  const filtered = data.filter((row) => {
    const q = search.toLowerCase();
    return (
      row.nombre.toLowerCase().includes(q) ||
      row.numero.toLowerCase().includes(q) ||
      row.tipo.toLowerCase().includes(q) ||
      row.correo.toLowerCase().includes(q) ||
      row.tipoCliente.toLowerCase().includes(q)
    );
  });

  // Paginación
  const totalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;
  const endIndex = startIndex + RECORDS_PER_PAGE;
  const currentData = filtered.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen flex flex-col gap-3 p-3 sm:p-4">

      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <div className="relative w-full sm:w-72 md:w-96">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-4 pr-10 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20 outline-none bg-white text-gray-700 placeholder-gray-400"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={2} />
        </div>

        {/* Botones con nuevo estilo */}
        <div className="flex items-center gap-2 shrink-0">
          

          <button
            onClick={handleNewClient}
            title="Nuevo cliente"
            className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-semibold border border-sky-700 rounded-lg text-[#004D77] bg-white hover:bg-sky-50 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
          >
            <span className="hidden sm:inline">Nuevo cliente</span>
            <Plus className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Tabla sin scroll */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="w-full min-w-max">
          <thead className="bg-[#004D77] text-white">
            <tr>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">#</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Tipo</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Numero</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Nombre</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Correo electrónico</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Teléfono</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Tipo cliente</th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold">Funciones</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((row, index) => {
              const rowBg = index % 2 === 0 ? 'bg-white' : 'bg-gray-100';
              return (
                <tr key={row.id} className={`transition-colors duration-150 ${rowBg}`}>
                  <td className={`px-3 py-1.5 text-center text-xs text-gray-500 font-medium`}>
                    {row.id}
                  </td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.tipo}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.numero}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-800 whitespace-nowrap">{row.nombre}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.correo}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.telefono}</td>
                  <td className="px-3 py-1.5 text-center text-xs text-gray-700 whitespace-nowrap">{row.tipoCliente}</td>
                  <td className="px-3 py-1.5">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <button
                        onClick={() => handleInfo(row)}
                        className="text-gray-400 hover:text-[#004D77] transition-colors cursor-pointer"
                        title="Información"
                      >
                        <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => handleEdit(row)}
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

            {currentData.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer: registros + paginador */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{currentData.length}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{filtered.length}</span>
        </p>

        <div className="bg-white shadow-md rounded-xl px-3 py-2">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Modal FormClient */}
      <FormClient
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        client={selectedClient}
        onSave={handleSave}
      />

      {/* Modal InfoClient */}
      <InfoClient
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        client={selectedClient}
      />

    </div>
  );
}

export default Clients;