import { X, SquarePen, User, Mail, Phone, ShieldCheck, CalendarDays } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../access/context/AuthContext';
import { isSelfUser } from '../helpers/selfUser';
import useBodyScrollLock from '../../../shared/hooks/useBodyScrollLock';

/**
 * Modal de solo lectura para mostrar detalles completos de un usuario.
 * Recibe los datos desde la pagina y usa callbacks locales para cerrar o editar.
 */
function InfoUser({
  user = null,
  isOpen = false,
  origin = null,
  onClose,
  onEdit,
}) {
  const { user: authUser } = useAuth();
  useBodyScrollLock(isOpen && Boolean(user));
  const [visible, setVisible] = useState(false);
  const SYSTEM_ID_USER = 999999999;
  const isSystemUser = user?.id === SYSTEM_ID_USER;
  const isSelf = isSelfUser(user, authUser);

  useEffect(() => {
    if (!isOpen || !user) return undefined;

    const animationId = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(animationId);
  }, [isOpen, user]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => onClose?.(), 250);
  };

  /**
   * Navega al formulario de edición con los datos del usuario actual.
   */
  const handleEdit = () => {
    onEdit?.(user, origin);
  };

  // Origen para animación del modal (posición del botón que lo abrió)
  const transformOrigin = origin
    ? `${origin.x}px ${origin.y}px`
    : 'center center';

  // No renderizar si no hay usuario
  if (!isOpen || !user) return null;

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
    { icon: User, label: 'Nombre completo', value: user.name },
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
        <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-6 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-1 ring-[#004D77]">
                <span className="text-base font-bold leading-none tracking-tight text-white">
                  {initials || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#f9f9f9] sm:text-xl">{user.name || 'Usuario sin nombre'}</h2>
                <span className={`mt-2 inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                  user.active
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-red-200 bg-red-50 text-red-500'
                }`}>
                  {user.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar detalle"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
          </div>
        </header>

        {/* Cuerpo */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 pb-5 pt-6 sm:px-6 sm:pb-4">

          {/* Lista de campos */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {fields.map(({ icon: Icon, label, value }) => {
              const isFullWidth = value === user.name || value === user.email;

              return (
              <div key={label} className={`flex min-w-0 items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4 ${isFullWidth ? 'sm:col-span-2' : ''}`}>
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#004D77] ring-1 ring-sky-100">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 pt-0.5">
                  <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    {label}
                  </p>
                  <p className="mt-1 break-words text-sm font-semibold leading-snug text-slate-700">
                    {value}
                  </p>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="flex shrink-0 flex-col-reverse gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
          <button
            onClick={handleClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm transition hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar
          </button>

          {!isSystemUser && !isSelf && (
            <button
              onClick={handleEdit}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#004D77] px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#003b5c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
            >
              <SquarePen className="w-4 h-4" strokeWidth={1.8} />
              Editar usuario
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}

export default InfoUser;
