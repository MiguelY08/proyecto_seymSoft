import { AlertCircle, X, Upload, Clock, CreditCard, Store, MapPin } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

/* ── Contador regresivo (idéntico al original) ── */
const INITIAL_SECONDS = 48 * 60 * 60;
function useCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(INITIAL_SECONDS);
  const intervalRef = useRef(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          return 0;
        }
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

/* ── Estilos coherentes (corregido borde upload y hover botones) ── */
const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Nunito:wght@400;600;700;800;900&display=swap');

  .pay-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 16px;
    font-family: 'Nunito', sans-serif;
  }
  .pay-modal-container {
    background: #ffffff;
    border-radius: 28px;
    max-width: 500px;
    width: 100%;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    animation: modalFadeIn 0.3s ease;
  }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to   { opacity: 1; transform: scale(1); }
  }
  .pay-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1.5px solid #e4eff6;
  }
  .pay-modal-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: #0c2a3a;
    margin: 0;
  }
  .pay-close-btn {
    background: #f1f5f9;
    border: none;
    border-radius: 40px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s;
  }
  .pay-close-btn:hover {
    background: #e2e8f0;
    transform: scale(1.05);
  }
  .pay-modal-body {
    padding: 24px;
  }
  .countdown-badge {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fef9e3;
    border: 1px solid #fde68a;
    border-radius: 20px;
    padding: 12px 16px;
    margin-bottom: 24px;
  }
  .countdown-badge.expired {
    background: #fee2e2;
    border-color: #fecaca;
  }
  .countdown-timer {
    font-family: monospace;
    font-weight: 800;
    font-size: 1.2rem;
    letter-spacing: 2px;
    color: #b45309;
  }
  .info-card {
    background: #f8fafc;
    border-radius: 20px;
    padding: 16px;
    margin-bottom: 24px;
    border: 1px solid #e2edf5;
  }
  .total-amount {
    font-size: 2rem;
    font-weight: 900;
    color: #004D77;
    line-height: 1.2;
  }
  .delivery-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: white;
    padding: 4px 12px;
    border-radius: 40px;
    font-size: 0.7rem;
    font-weight: 800;
    color: #1e4060;
    border: 1px solid #e2edf5;
  }
  .qr-placeholder {
    width: 100px;
    height: 100px;
    background: #1e293b;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    text-align: center;
  }
  .bank-info {
    font-size: 0.7rem;
    color: #64748b;
    text-align: center;
    margin-top: 8px;
  }
  /* Área de subida corregida: borde consistente, sin distorsión */
  .upload-area {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    border: 2px dashed #cbd5e1;
    border-radius: 20px;
    padding: 20px 16px;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
    box-sizing: border-box;
  }
  .upload-area:hover {
    border-color: #004D77;
    background: #f0f8ff;
    transform: translateY(-1px);
  }
  .upload-icon {
    color: #94a3b8;
    transition: color 0.2s;
  }
  .upload-area:hover .upload-icon {
    color: #004D77;
  }
  .upload-filename {
    font-size: 0.75rem;
    font-weight: 600;
    color: #0c2a3a;
    word-break: break-all;
    max-width: 100%;
  }
  .upload-hint {
    font-size: 0.65rem;
    color: #94a3b8;
  }
  /* Botones mejorados */
  .btn-cancel {
    background: transparent;
    border: 2px solid #e2edf5;
    border-radius: 40px;
    padding: 12px;
    font-weight: 800;
    font-size: 0.8rem;
    color: #1e4060;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-cancel:hover {
    background: #f1f5f9;
    border-color: #afd0e6;
    transform: translateY(-2px);
  }
  .btn-submit {
    background: #004D77;
    border: none;
    border-radius: 40px;
    padding: 12px;
    font-weight: 800;
    font-size: 0.8rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-submit:hover {
    background: #0c5c88;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 77, 119, 0.2);
  }
  .btn-submit:active, .btn-cancel:active {
    transform: scale(0.97);
  }
`;

let modalStylesInjected = false;
function injectModalStyles() {
  if (modalStylesInjected) return;
  const style = document.createElement('style');
  style.textContent = MODAL_STYLES;
  document.head.appendChild(style);
  modalStylesInjected = true;
}

function CompletePay({ isOpen, onClose, totalAmount, deliveryMethod, deliveryInfo }) {
  injectModalStyles();
  const { h, m, s, expired } = useCountdown();
  const [archivo, setArchivo] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10MB.');
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      alert('Solo se permiten PNG, JPG o JPEG.');
      return;
    }
    setArchivo(file);
  };

  return (
    <div className="pay-modal-overlay" onClick={onClose}>
      <div className="pay-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="pay-modal-header">
          <h2 className="pay-modal-title">Completar pago</h2>
          <button className="pay-close-btn" onClick={onClose}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div className="pay-modal-body">
          {/* Contador */}
          <div className={`countdown-badge ${expired ? 'expired' : ''}`}>
            <Clock size={18} className={expired ? 'text-red-600' : 'text-amber-600'} />
            <div>
              {expired ? (
                <span className="text-red-700 font-bold text-sm">Tiempo expirado · Pedido cancelado</span>
              ) : (
                <span>
                  Tienes <span className="countdown-timer">{h}h {m}m {s}s</span> para pagar
                </span>
              )}
            </div>
          </div>

          {/* Info total y QR */}
          <div className="info-card">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500 mb-1">Total a pagar</p>
                <div className="total-amount">${totalAmount?.toLocaleString() || '0'} COP</div>
                <div className="delivery-chip mt-2">
                  {deliveryMethod === 'domicilio' ? (
                    <><MapPin size={12} /> Domicilio</>
                  ) : (
                    <><Store size={12} /> Recoger en tienda</>
                  )}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">Escanea para pagar</p>
                <div className="qr-placeholder">
                  <CreditCard size={28} strokeWidth={1.5} />
                  <span className="text-[10px] mt-1">QR Demo</span>
                </div>
                <div className="bank-info mt-2">
                  Cuenta: 1234567890 · Bancolombia · Ahorros
                </div>
              </div>
            </div>
          </div>

          {/* Upload comprobante - corregido */}
          <div>
            <p className="text-sm font-bold text-gray-700 mb-2">Comprobante de transferencia</p>
            <label className="upload-area">
              <input type="file" accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" />
              <Upload size={28} className="upload-icon" />
              {archivo ? (
                <span className="upload-filename">{archivo.name}</span>
              ) : (
                <>
                  <span className="text-sm font-medium text-gray-700">Haz clic para subir el comprobante</span>
                  <span className="upload-hint">PNG, JPG o JPEG (máx. 10MB)</span>
                </>
              )}
            </label>
          </div>

          {/* Botones */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <button onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button className="btn-submit">
              Enviar comprobante
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompletePay;