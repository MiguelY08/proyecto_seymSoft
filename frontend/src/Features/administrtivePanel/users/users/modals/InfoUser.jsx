import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

function InfoUser() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user      = location.state?.user ?? null;

  const handleClose = () => navigate('/users');

  if (!user) return null;

  const rows = [
    { label: 'Tipo y No. Documento', value: `${user.tipo} ${user.documento}` },
    { label: 'Nombre completo',      value: user.nombre                       },
    { label: 'Correo electrónico',   value: user.correo                       },
    { label: 'Teléfono - Celular',   value: user.telefono                     },
    { label: 'Tipo de usuario',      value: user.rol                          },
    { label: 'Estado actual',        value: user.activo ? 'Activo' : 'Inactivo' },
    { label: 'Registrado desde',     value: user.registradoDesde ?? '—'       },
  ];

  return (
    // ── Backdrop ──────────────────────────────────────────────────────────
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      {/* ── Modal ───────────────────────────────────────────────────────── */}
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-[#004D77]">
          <h2 className="text-white font-semibold text-base sm:text-lg">Detalles</h2>
          <button
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-6 py-2 flex flex-col divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-2.5 sm:py-3 gap-0.5 sm:gap-4"
            >
              <span className="text-xs sm:text-sm font-semibold text-gray-700 shrink-0">
                {label}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 sm:text-gray-600 sm:text-right break-all">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-0 pb-4 sm:pb-0 mt-2 sm:mt-0">
          <button
            onClick={handleClose}
            className="w-full py-3 sm:py-3.5 bg-gray-400 hover:bg-gray-500 text-white font-semibold text-sm transition-colors duration-200 cursor-pointer sm:rounded-none rounded-xl"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoUser;