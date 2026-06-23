import React, { useState } from "react";
import { AlertCircle, FileText, Loader2, X } from "lucide-react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { validateMotivoCancelacion } from "../validators/returnsValidators";

const AnnulReturn = ({ devolucion, onClose, onConfirm, loading = false }) => {
  const [motivo, setMotivo] = useState("");
  const { showWarning } = useAlert();

  const handleSubmit = () => {
    const error = validateMotivoCancelacion(motivo);

    if (error) {
      showWarning("Campo requerido", error);
      return;
    }

    onConfirm(motivo.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/45 backdrop-blur-sm"
      onClick={loading ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-lg bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative flex items-center justify-center bg-red-700 px-8 py-5">
          <h2 className="text-lg font-semibold tracking-wide text-white">
            Anular devolucion
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/75 transition-colors hover:bg-white/15 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-8 py-7">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <FileText size={15} className="text-[#004D77]" />
                No. devolucion
              </span>
            </label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-[#004D77]">
              {devolucion?.id ?? "-"}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <FileText size={15} className="text-[#004D77]" />
                No. factura
              </span>
            </label>
            <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-gray-700">
              {devolucion?.idCompra ?? devolucion?.invoiceNumber ?? "-"}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800">
              <span className="flex items-center gap-2">
                <AlertCircle size={15} className="text-[#004D77]" />
                Motivo de anulacion
              </span>
            </label>
            <textarea
              value={motivo}
              onChange={(event) => setMotivo(event.target.value)}
              maxLength={250}
              rows={5}
              disabled={loading}
              placeholder="Escribe el motivo de la anulacion..."
              className="w-full resize-none rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-gray-800 outline-none transition-colors focus:border-[#004D77] disabled:cursor-not-allowed disabled:opacity-70"
            />
            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-gray-400">
              <span>Maximo 250 caracteres</span>
              <span>{motivo.length}/250</span>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              onClick={onClose}
              disabled={loading}
              className="w-full rounded-lg bg-gray-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Anulando..." : "Confirmar anulacion"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnulReturn;
