import React, { useState } from "react";
import { X, AlertCircle, FileText } from "lucide-react";

const AnulatePurchase = ({ purchase, onClose, onConfirm }) => {
  const [motivo, setMotivo] = useState("");

  const handleSubmit = () => {
    if (!motivo.trim()) {
      alert("Debes escribir el motivo de la anulación");
      return;
    }
    onConfirm(motivo);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>

      <div
        className="relative rounded-2xl shadow-2xl w-[420px] overflow-hidden"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-center py-5 px-6 relative"
          style={{ backgroundColor: "#1a5276" }}
        >
          <h2
            className="text-xl font-bold tracking-wide text-white"
            style={{ fontFamily: "'Segoe UI', sans-serif" }}
          >
            Anular Compra
          </h2>
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pt-6 pb-7 flex flex-col gap-5">

          {/* Factura info */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1a1a2e", fontFamily: "'Segoe UI', sans-serif" }}
            >
              <span className="flex items-center gap-2">
                <FileText size={15} style={{ color: "#1a5276" }} />
                Número de Factura
              </span>
            </label>
            <div
              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium"
              style={{
                backgroundColor: "#f0f4f8",
                color: "#1a5276",
                border: "1px solid #d0dce8",
                fontFamily: "'Segoe UI', sans-serif"
              }}
            >
              {purchase?.numeroFacturacion ?? "FAC-000123"}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "#1a1a2e", fontFamily: "'Segoe UI', sans-serif" }}
            >
              <span className="flex items-center gap-2">
                <AlertCircle size={15} style={{ color: "#1a5276" }} />
                Motivo
              </span>
            </label>
            <textarea
              placeholder="Escribe el motivo de la anulación..."
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none transition-all"
              style={{
                border: "1.5px solid #d0dce8",
                fontFamily: "'Segoe UI', sans-serif",
                color: "#1a1a2e",
                backgroundColor: "#f9fbfd",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#1a5276")}
              onBlur={(e) => (e.target.style.borderColor = "#d0dce8")}
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-1">
            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all"
              style={{
                backgroundColor: "#c0392b",
                fontFamily: "'Segoe UI', sans-serif",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#a93226")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#c0392b")}
            >
              Confirmar Anulación
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                backgroundColor: "#7f8c8d",
                color: "#ffffff",
                fontFamily: "'Segoe UI', sans-serif",
                letterSpacing: "0.03em",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#6c7a7a")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#7f8c8d")}
            >
              Cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnulatePurchase;