import React, { useState, useEffect } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';

function CompletePay({ isOpen, onClose, total, deliveryMethod }) {
  const [timeLeft, setTimeLeft] = useState(48 * 60 * 60); // 48 horas en segundos
  const [proofFile, setProofFile] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
    }
  };

  const handleSubmit = () => {
    console.log('Comprobante enviado:', proofFile);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-lg shadow-2xl relative z-10 w-full max-w-md animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b">
          <h2 className="text-sm font-bold text-gray-900">Completar pago</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido */}
        <div className="px-4 py-3 space-y-3">
          {/* Alerta de tiempo */}
          <div className="bg-orange-50 border border-orange-200 rounded-md p-2 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-orange-800 leading-tight">
              Tiene <span className="font-semibold">{formatTime(timeLeft)}</span> para pagar antes de que el pedido sea cancelado
            </p>
          </div>

          {/* Total a pagar */}
          <div className="text-center py-1">
            <p className="text-[11px] text-gray-600 mb-0.5">Total a pagar</p>
            <p className="text-2xl font-bold text-gray-900 mb-0.5">{total.toLocaleString()} COP</p>
            <p className="text-[11px] text-gray-500">
              Método de envío: {deliveryMethod === 'delivery' ? 'Domicilio' : 'Recoger en tienda'}
            </p>
          </div>

          {/* Código QR */}
          <div>
            <p className="text-[11px] text-center text-gray-700 mb-1.5 font-medium">
              Escanee el código QR para pagar
            </p>
            <div className="flex items-center justify-center">
              {/* QR Code placeholder */}
              <div className="w-32 h-32 bg-[#3E5266] rounded-md flex items-center justify-center border-2 border-gray-300">
                <div className="text-center">
                  <p className="text-white text-xs font-medium">QR Code</p>
                  <p className="text-white text-[10px]">Placeholder</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información bancaria */}
          <div>
            <p className="text-[10px] text-gray-500 text-center leading-tight">
              Cuenta bancaria: 1234567890 - Bancolombia - Cuenta de Ahorros
            </p>
          </div>

          {/* Subir comprobante */}
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1.5">
              Comprobante de transferencia
            </p>
            <label className="block">
              <input
                type="file"
                accept="image/*,.pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-md p-4 cursor-pointer hover:border-[#004D77] hover:bg-gray-50 transition-all">
                <div className="flex flex-col items-center gap-1.5">
                  <Upload className="w-7 h-7 text-gray-400" />
                  <p className="text-[11px] text-gray-600 text-center leading-tight">
                    {proofFile ? proofFile.name : 'Haga clic para subir el comprobante'}
                  </p>
                  <p className="text-[9px] text-gray-400">
                    PNG, JPG o JPEG (máx. 10MB)
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Footer con botones */}
        <div className="px-4 pb-3 flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!proofFile}
            className="flex-1 px-3 py-2 bg-[#004D77] text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs"
          >
            Enviar comprobante
          </button>
        </div>
      </div>
    </div>
  );
}

export default CompletePay;