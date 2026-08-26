import { createElement, useEffect } from "react";
import {
  AlertTriangle, Barcode, CalendarDays, CheckCircle2, ClipboardList,
  Layers3, PackageX, XCircle,
} from "lucide-react";
import { useOutsideCloseWarning } from "../../../../shared/hooks/useOutsideCloseWarning";
import PurchaseModalHeader from "../../../../shared/PurchaseModalHeader";

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
      className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-white sm:items-center sm:justify-center sm:bg-slate-950/50 sm:p-6 sm:backdrop-blur-sm"
      onMouseDown={handleOutsideClick}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="non-conforming-detail-title"
        className="flex h-dvh w-full flex-col overflow-hidden bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.35)] sm:h-auto sm:max-h-[92vh] sm:max-w-2xl sm:rounded-2xl sm:ring-1 sm:ring-white/20"
      >
        <PurchaseModalHeader
          icon={ClipboardList}
          eyebrow="Control de calidad"
          title="Detalle del producto no conforme"
          titleId="non-conforming-detail-title"
          onClose={onClose}
          closeLabel="Cerrar detalle"
        />

        <div className="min-h-0 flex-1 overflow-y-auto">
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
