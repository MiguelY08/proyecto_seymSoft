import { createElement, useEffect } from "react";
import {
  AlertTriangle, Barcode, CalendarDays, CheckCircle2, ClipboardList,
  Layers3, PackageX, X, XCircle,
} from "lucide-react";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";

const formatDate = (value) => {
  if (!value) return "Sin fecha registrada";
  const source = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const date = new Date(source);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("es-CO", {
        day: "2-digit", month: "long", year: "numeric",
      }).format(date);
};

const DetailCard = ({ icon, label, value, accent = "blue" }) => {
  const colors = accent === "amber"
    ? "bg-amber-50 text-amber-700 ring-amber-100"
    : "bg-sky-50 text-[#004D77] ring-sky-100";

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm sm:p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${colors}`}>
        {createElement(icon, { className: "h-5 w-5", strokeWidth: 2 })}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold text-slate-700">{value}</p>
      </div>
    </div>
  );
};

const ViewDetailsPN = ({ report, onClose }) => {
  const { handleOutsideClick } = useOutsideCloseWarning(onClose, { hasUnsavedChanges: false });
  useEffect(() => {
    const handleKeyDown = (event) => event.key === "Escape" && onClose();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!report) return null;

  const isCancelled = String(report.estado).toLowerCase().includes("anulad");
  const StatusIcon = isCancelled ? XCircle : CheckCircle2;
  const affectedQuantity = Number(report.cantidadAfectada) || 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={handleOutsideClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="non-conforming-detail-title"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)] ring-1 ring-white/20"
      >
        <header className="relative overflow-hidden bg-gradient-to-br from-[#003b5c] via-[#004D77] to-[#0877a8] px-5 py-5 text-white sm:px-7 sm:py-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-white/10" />
          <div className="pointer-events-none absolute -bottom-20 right-20 h-36 w-36 rounded-full bg-sky-300/10" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#004D77] ring-[#004D77] ring-1">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#f9f9f9]">Control de calidad</p>
                <h2 id="non-conforming-detail-title" className="mt-0.5 text-lg font-bold sm:text-xl text-[#f9f9f9]">
                  Detalle del producto no conforme
                </h2>
              </div>
            </div>
            <button
              type="button" onClick={onClose} aria-label="Cerrar detalle"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="overflow-y-auto">
          <div className="border-b border-slate-200 bg-white px-5 py-5 sm:px-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Producto reportado</p>
                <h3 className="mt-1 break-words text-xl font-extrabold leading-tight text-slate-800 sm:text-2xl">
                  {report.nombre || "Producto sin nombre"}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                  <Barcode className="h-4 w-4 text-[#004D77]" />
                  <span className="font-medium">{report.codigoBarras || "Sin código de barras"}</span>
                </div>
              </div>
              <span className={`inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 ${
                isCancelled ? "bg-red-50 text-red-700 ring-red-200" : "bg-emerald-50 text-emerald-700 ring-emerald-200"
              }`}>
                <StatusIcon className="h-3.5 w-3.5" />
                {report.estado || "Activo"}
              </span>
            </div>
          </div>

          <div className="space-y-4 px-5 py-5 sm:px-7 sm:py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <DetailCard icon={Layers3} label="Categoría" value={report.categoria || "Sin categoría"} />
              <DetailCard icon={CalendarDays} label="Fecha de detección" value={formatDate(report.fechaDeteccion)} />
              <DetailCard
                icon={PackageX} label="Cantidad afectada" accent="amber"
                value={`${affectedQuantity} unidad${affectedQuantity === 1 ? "" : "es"}`}
              />
              <DetailCard icon={AlertTriangle} label="Tipo de registro" value="Producto no conforme" accent="amber" />
            </div>

            <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-amber-700">Motivo del reporte</p>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                    {report.motivo || "No se registró un motivo para este reporte."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex justify-end border-t border-slate-200 bg-white px-5 py-4 sm:px-7">
          <button
            type="button" onClick={onClose}
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#004D77] bg-white px-6 py-2.5 text-sm font-bold text-[#004D77] shadow-sm hover:bg-sky-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#004D77]/40 focus:ring-offset-2 sm:w-auto"
          >
            Cerrar detalle
          </button>
        </footer>
      </section>
    </div>
  );
};

export default ViewDetailsPN;
