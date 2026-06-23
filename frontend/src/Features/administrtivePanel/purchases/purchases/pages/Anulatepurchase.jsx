// features/administrtivePanel/purchases/purchases/components/Anulatepurchase.jsx
import React, { useState } from "react";
import { useAlert } from "../../../../shared/alerts/useAlert";
import { X, AlertCircle, FileText } from "lucide-react";

const AnulatePurchase = ({ purchase, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState("");
  const { showWarning } = useAlert();

  const handleSubmit = () => {
    if (!motivo.trim()) {
      showWarning("Campo requerido", "Debes escribir el motivo de la anulación.");
      return;
    }
    onConfirm(motivo);
  };

  const isAlreadyAnnulled = purchase?.estado === "Anulada";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4" style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}>
      <div className="relative rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" style={{ backgroundColor: "#ffffff" }}>
        <div className="flex items-center justify-center py-6 px-8 relative" style={{ backgroundColor: isAlreadyAnnulled ? "#6c757d" : "#a93226" }}>
          <h2 className="text-xl font-bold tracking-wide text-white" style={{ fontFamily: "'Segoe UI', sans-serif" }}>
            {isAlreadyAnnulled ? "Compra ya Anulada" : "Anular Compra"}
          </h2>
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-10 pt-7 pb-8 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1a1a2e", fontFamily: "'Segoe UI', sans-serif" }}>
              <span className="flex items-center gap-2">
                <FileText size={15} style={{ color: "#1a5276" }} />
                Número de Factura
              </span>
            </label>
            <div className="w-full rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: "#f0f4f8", color: "#1a5276", border: "1px solid #d0dce8", fontFamily: "'Segoe UI', sans-serif" }}>
              {purchase?.numeroFacturacion ?? "FAC-000123"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "#1a1a2e", fontFamily: "'Segoe UI', sans-serif" }}>
              <span className="flex items-center gap-2">
                <AlertCircle size={15} style={{ color: "#1a5276" }} />
                Estado Actual
              </span>
            </label>
            <div className="w-full rounded-xl px-4 py-2.5 text-sm font-medium" style={{ backgroundColor: purchase?.estado === "Anulada" ? "#fee2e2" : "#e8f5e9", color: purchase?.estado === "Anulada" ? "#b91c1c" : "#2e7d32", border: `1px solid ${purchase?.estado === "Anulada" ? "#fecaca" : "#c8e6c9"}`, fontFamily: "'Segoe UI', sans-serif" }}>
              {purchase?.estado ?? "Completada"}
            </div>
          </div>

          {!isAlreadyAnnulled && (
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#1a1a2e", fontFamily: "'Segoe UI', sans-serif" }}>
                <span className="flex items-center gap-2">
                  <AlertCircle size={15} style={{ color: "#1a5276" }} />
                  Motivo de Anulación
                </span>
              </label>
              <textarea
                placeholder="Escribe el motivo de la anulación..."
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={5}
                className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
                style={{ border: "1.5px solid #d0dce8", fontFamily: "'Segoe UI', sans-serif", color: "#1a1a2e", backgroundColor: "#f9fbfd" }}
                onFocus={(e) => (e.target.style.borderColor = "#1a5276")}
                onBlur={(e) => (e.target.style.borderColor = "#d0dce8")}
              />
              <p className="text-xs text-gray-400 mt-1">Máximo 250 caracteres</p>
            </div>
          )}

          {isAlreadyAnnulled && purchase?.motivoAnulacion && (
            <div className="rounded-xl px-4 py-3 text-sm" style={{ backgroundColor: "#fff1f2", border: "1px solid #fecaca", color: "#b91c1c" }}>
              <p className="font-semibold mb-1">Motivo de anulación registrado:</p>
              <p>{purchase.motivoAnulacion}</p>
              {purchase.fechaAnulacion && (
                <p className="text-xs mt-2 text-gray-500">Fecha de anulación: {purchase.fechaAnulacion}</p>
              )}
            </div>
          )}

          <div className="flex gap-3 mt-1">
            {!isAlreadyAnnulled ? (
              <>
                <button onClick={handleSubmit} className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all" style={{ backgroundColor: "#c0392b", fontFamily: "'Segoe UI', sans-serif", letterSpacing: "0.03em" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a93226")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")}>
                  Confirmar Anulación
                </button>
                <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: "#7f8c8d", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", letterSpacing: "0.03em" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6c7a7a")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7f8c8d")}>
                  Cancelar
                </button>
              </>
            ) : (
              <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold transition-all" style={{ backgroundColor: "#004D77", color: "#ffffff", fontFamily: "'Segoe UI', sans-serif", letterSpacing: "0.03em" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003a5c")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#004D77")}>
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnulatePurchase;