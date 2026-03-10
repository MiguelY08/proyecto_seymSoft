import { useNavigate, useLocation } from 'react-router-dom';
import { X, SquarePen } from 'lucide-react';
import { useModalAnimation } from '../../../shared/useModalAnimation';

function InfoUser() {
  const location = useLocation();
  const user     = location.state?.user   ?? null;
  const origin   = location.state?.origin ?? null;

  const navigate = useNavigate();
  const { visible, handleClose } = useModalAnimation('/admin/users');

  const handleEdit = () => {
    navigate('/admin/users/form-user', { state: { user } });
  };

  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  if (!user) return null;

  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  const rows = [
    { label: 'Tipo y No. Documento', value: `${user.documentType} ${user.document}` },
    { label: 'Nombre completo',      value: user.name                               },
    { label: 'Correo electrónico',   value: user.email                              },
    { label: 'Teléfono - Celular',   value: user.phone                              },
    { label: 'Tipo de usuario',      value: user.role ?? 'Nulo'                     },
    { label: 'Tipo de cliente',      value: user.clientType ?? 'Detal'              },
    { label: 'Estado actual',        value: user.active ? 'Activo' : 'Inactivo'     },
    { label: 'Registrado desde',     value: createdAt                               },
  ];

  return (
    <div
      onClick={handleClose}
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`bg-white rounded-lg shadow-2xl w-full max-w-xs sm:max-w-sm md:max-w-md overflow-hidden flex flex-col
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
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
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handleEdit}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-[#004D77] hover:bg-[#003a5c] rounded-lg transition-colors cursor-pointer"
          >
            <SquarePen className="w-4 h-4" strokeWidth={1.8} />
            Editar usuario
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoUser;