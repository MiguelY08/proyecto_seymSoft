import { useNavigate, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';

function InfoUser() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = location.state?.user ?? null;

  const handleClose = () => navigate('/admin/users');

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">Detalles</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-2 flex flex-col divide-y divide-gray-100">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex flex-col py-3 gap-0.5">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                {label}
              </span>
              <span className="text-sm font-medium text-gray-800">
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoUser;