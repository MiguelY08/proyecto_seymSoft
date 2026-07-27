import { useNavigate, useLocation } from 'react-router-dom';
import { X, SquarePen, User, Mail, Phone, ShieldCheck, CalendarDays } from 'lucide-react';
import { useModalAnimation } from '../../../shared/useModalAnimation';
import { useAuth } from '../../../access/context/AuthContext';
import { isSelfUser } from '../helpers/selfUser';

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
  const { user: authUser } = useAuth();
  const SYSTEM_ID_USER = 999999999;
  const isSystemUser = user?.id === SYSTEM_ID_USER;
  const isSelf = isSelfUser(user, authUser);
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

  // Valor a mostrar para el rol (si es null o vacío, se muestra "Sin rol" o "Nulo")
  const roleDisplay = user.role?.nameRole || user.role?.name || 'Sin rol';

  // Filas de información (se eliminó el campo de documento)
  const fields = [
    { icon: User,         label: 'Nombre completo',      value: user.name                               },
    { icon: Mail,         label: 'Correo electrónico',   value: user.email                              },
    { icon: Phone,        label: 'Teléfono / Celular',   value: user.phone || 'No registrado'           },
    { icon: ShieldCheck,  label: 'Tipo de usuario',      value: roleDisplay                             },
    { icon: CalendarDays, label: 'Registrado desde',     value: createdAt                               },
  ];

  return (
    <div
      style={{ transition: 'opacity 250ms ease' }}
      className={`fixed inset-0 z-50 flex items-stretch justify-center bg-white sm:items-center sm:bg-black/40 sm:p-4 sm:backdrop-blur-sm
        ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          transformOrigin,
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 200ms ease',
        }}
        className={`flex h-dvh w-full flex-col overflow-hidden bg-white shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:max-w-sm sm:rounded-lg md:max-w-md
          ${visible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}
      >
        {/* Header del modal */}
        <div className="flex items-center justify-between bg-[#004D77] px-4 py-4 shrink-0 sm:px-6">
          <h2 className="text-white font-semibold text-lg">Detalles</h2>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-5 pt-6 sm:px-6 sm:pb-4">

          {/* Avatar + nombre + estado */}
          <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:gap-4 sm:text-left">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#004D77]/20 bg-[#004D77]/10 sm:h-14 sm:w-14">
              <span className="text-2xl font-bold leading-none tracking-tight text-[#004D77] sm:text-lg">
                {initials}
              </span>
            </div>
            <div className="flex min-w-0 flex-col items-center gap-1 sm:items-start">
              <p className="max-w-full text-lg font-semibold leading-tight text-gray-800 sm:text-base sm:truncate">
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
              <div key={label} className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/70 p-3 sm:border-0 sm:bg-transparent sm:p-0">
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

        {/* Footer */}
        <div className="flex shrink-0 flex-col-reverse gap-2 border-t border-gray-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            onClick={handleClose}
            className="w-full rounded-lg bg-gray-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-600 cursor-pointer sm:w-auto sm:py-2"
          >
            Cerrar
          </button>

          {!isSystemUser && !isSelf && (
            <button
              onClick={handleEdit}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#004D77] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#003a5c] cursor-pointer sm:w-auto sm:py-2"
            >
              <SquarePen className="w-4 h-4" strokeWidth={1.8} />
              Editar usuario
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default InfoUser;
