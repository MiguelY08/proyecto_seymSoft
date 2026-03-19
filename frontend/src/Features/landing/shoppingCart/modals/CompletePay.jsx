import { AlertCircle, X, Upload } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ── Contador regresivo desde 48h ──────────────────────────────────────────────
const INITIAL_SECONDS = 48 * 60 * 60;

function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { clearInterval(intervalRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const h = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const m = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const s = String(secondsLeft % 60).padStart(2, '0');

  return { h, m, s, expired: secondsLeft === 0 };
}

// ─────────────────────────────────────────────────────────────────────────────

function CompletePay({ isOpen, onClose, totalAmount, deliveryMethod }) {
  const { h, m, s, expired } = useCountdown();
  const [archivo, setArchivo] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('Máximo 10MB.'); return; }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Solo PNG, JPG o JPEG.'); return;
    }
    setArchivo(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Completar pago</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">

          {/* Contador */}
          <div className={`border rounded-lg px-3 py-2 flex items-center gap-2 ${
            expired ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <AlertCircle className={`w-4 h-4 flex-shrink-0 ${expired ? 'text-red-500' : 'text-yellow-600'}`} />
            <p className={`text-xs ${expired ? 'text-red-700 font-semibold' : 'text-yellow-800'}`}>
              {expired
                ? 'El tiempo ha expirado. El pedido será cancelado.'
                : <>Tienes <span className="font-bold tabular-nums">{h}h {m}m {s}s</span> para pagar antes de que el pedido sea cancelado.</>
              }
            </p>
          </div>

          {/* Total + QR en fila */}
          <div className="flex items-center gap-6">

            {/* Total y método */}
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-1">Total a pagar</p>
              <p className="text-3xl font-bold text-gray-900">
                $ {totalAmount ? totalAmount.toLocaleString() : '0'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {deliveryMethod === 'domicilio' ? ' Domicilio' : 'Recoger en tienda'}
              </p>
            </div>

            {/* Divisor */}
            <div className="w-px h-24 bg-gray-200" />

            {/* QR */}
            <div className="flex-1 text-center">
              <p className="text-xs text-gray-500 mb-2">Escanea para pagar</p>
              <div className="w-24 h-24 bg-gray-800 rounded-xl mx-auto flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="font-semibold text-xs">QR Code</p>
                  <p className="text-[10px] mt-0.5 opacity-70">Placeholder</p>
                </div>
              </div>
            </div>

          </div>

          {/* Info bancaria */}
          <p className="text-[11px] text-center text-gray-400">
            Cuenta: 1234567890 · Bancolombia · Ahorros
          </p>

          {/* Upload */}
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1.5">Comprobante de transferencia</p>
            <label className="block cursor-pointer">
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl py-4 px-3 text-center hover:border-[#004D77] transition-colors flex items-center justify-center gap-3">
                <Upload className="w-7 h-7 text-gray-400 flex-shrink-0" />
                <div className="text-left">
                  <p className="text-xs text-gray-600">
                    {archivo ? archivo.name : 'Haga clic para subir el comprobante'}
                  </p>
                  <p className="text-[10px] text-gray-400">PNG, JPG o JPEG (máx. 10MB)</p>
                </div>
              </div>
            </label>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onClose}
              className="py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
            > 
              Cancelar
            </button>
            <button
              className="py-2.5 rounded-xl text-white hover:opacity-90 transition-colors text-sm font-medium"
              style={{ backgroundColor: '#004D77' }}
            >
              Enviar comprobante
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default CompletePay;