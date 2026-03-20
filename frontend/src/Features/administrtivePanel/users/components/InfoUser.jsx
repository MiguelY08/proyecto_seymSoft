import { useNavigate, useLocation } from 'react-router-dom';
import { X, SquarePen, IdCard, User, Mail, Phone, ShieldCheck, CalendarDays } from 'lucide-react';
import { useModalAnimation } from '../../../shared/useModalAnimation';

/**
 * Componente InfoUser.
 * Modal de solo lectura para mostrar detalles completos de un usuario.
 * Incluye animaciones de apertura y navegación a edición.
 * @param {object} props - No recibe props directas, usa location.state para datos.
 * @returns {JSX.Element|null} Modal con información del usuario o null si no hay usuario.
 */
function InfoUser() {
  // Obtener datos del usuario desde el estado de navegación
  const location = useLocation();
  const user     = location.state?.user   ?? null;
  const origin   = location.state?.origin ?? null;

  const navigate = useNavigate();
  const { visible, handleClose } = useModalAnimation('/admin/users');

  /**
   * Navega al formulario de edición con los datos del usuario actual.
   */
  const handleEdit = () => {
    navigate('/admin/users/form-user', { state: { user } });
  };

  // Origen para animación del modal (posición del botón que lo abrió)
  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  // No renderizar si no hay usuario
  if (!user) return null;

  // Formatear fecha de creación
  const createdAt = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '—';

  // Iniciales para el avatar
  const initials = (user.name ?? '')
    .trim().split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  // Filas de información (sin "Tipo de cliente")
  const fields = [
    { icon: IdCard,       label: 'Tipo y No. Documento', value: `${user.documentType} ${user.document}` },
    { icon: User,         label: 'Nombre completo',      value: user.name                               },
    { icon: Mail,         label: 'Correo electrónico',   value: user.email                              },
    { icon: Phone,        label: 'Teléfono / Celular',   value: user.phone                              },
    { icon: ShieldCheck,  label: 'Tipo de usuario',      value: user.role ?? 'Nulo'                     },
    { icon: CalendarDays, label: 'Registrado desde',     value: createdAt                               },
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
        {/* Header del modal — sin cambios */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#004D77] shrink-0">
          <h2 className="text-white font-semibold text-lg">Detalles</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* ── Cuerpo ─────────────────────────────────────────────────────── */}
        <div className="px-6 pt-6 pb-4 flex flex-col gap-5 overflow-y-auto">

          {/* Avatar + nombre + estado */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#004D77]/10 border-2 border-[#004D77]/20 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#004D77] tracking-tight leading-none">
                {initials}
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-base font-semibold text-gray-800 leading-tight truncate">
                {user.name}
              </p>
              <span className={`self-start px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                user.active
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-500 border-red-200'
              }`}>
                {user.active ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>

          {/* Separador */}
          <div className="h-px bg-gray-100" />

          {/* Lista de campos */}
          <div className="flex flex-col gap-3">
            {fields.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#004D77]/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#004D77]/60" strokeWidth={1.8} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide leading-none">
                    {label}
                  </span>
                  <span className="text-sm font-medium text-gray-800 break-all leading-snug">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — sin cambios */}
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