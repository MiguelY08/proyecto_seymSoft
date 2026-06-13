import { CalendarDays, ShieldCheck, Sparkles, UserCircle2 } from "lucide-react";
import { useAuth } from "../access/context/AuthContext";
import { usePermissions } from "../administrtivePanel/configuration/roles/hooks/usePermissions";
import IndicatorsPage from "../administrtivePanel/performance/indicators/pages/IndicatorsPage";

const DashboardPage = () => {
  const { user, role } = useAuth();
  const { hasPermission } = usePermissions();

  const canViewMetrics = hasPermission("dashboard.ver");

  const fullName = user?.fullName || user?.name || "Usuario";
  const roleName = role?.nameRole || role?.name || role?.role || "Sin rol";
  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (canViewMetrics) {
    return <IndicatorsPage />;
  }

  return (
    <div className="font-lexend min-h-full bg-[#f6f9fc] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex min-h-[calc(100vh-7rem)] max-w-5xl items-center">
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-[#004D77] px-6 py-8 text-white sm:px-10">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
              <Sparkles size={24} strokeWidth={1.8} />
            </div>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Bienvenido a SeymSoft
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
              Bienvenido al sistema de gestión empresarial. Desde aquí podrás acceder
              a los módulos habilitados según tu rol y permisos.
            </p>
          </div>

          <div className="grid gap-4 px-6 py-6 sm:grid-cols-3 sm:px-10">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004D77]/10 text-[#004D77]">
                <UserCircle2 size={20} strokeWidth={1.8} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Usuario
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {fullName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004D77]/10 text-[#004D77]">
                <ShieldCheck size={20} strokeWidth={1.8} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Rol
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {roleName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#004D77]/10 text-[#004D77]">
                <CalendarDays size={20} strokeWidth={1.8} />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Fecha actual
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                {today}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 px-6 py-5 sm:px-10">
            <p className="text-sm leading-6 text-slate-600">
              Nos alegra tenerte de vuelta. Usa el menu lateral para continuar
              con tus actividades y consultar solo las herramientas autorizadas
              para tu perfil.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
