import { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import GraphClient from '../components/GraphClient';
import {
  formatPersonType,
  formatPhoneNumber,
  formatContactPhone,
  formatClientType,
  formatRut,
  getStatusBadgeClass,
  getStatusText,
} from '../helpers/clientHelpers';

function InfoClient({ isOpen, onClose, client }) {
  const [showGraph, setShowGraph] = useState(false);

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex transition-all h-[90vh] ${
        showGraph ? 'w-[95vw] max-w-[1600px]' : 'w-full max-w-3xl'
      }`}>

        {/* Info section */}
        <div className={`flex flex-col ${showGraph ? 'w-1/2 border-r border-gray-200' : 'w-full'}`}>

          {/* Header */}
          <div className="bg-[#004D77] text-white px-6 py-4 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-semibold">Detalle del cliente</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-8 py-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">

              {/* Client ID */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Número Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.id || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* Person type / Document type / Document */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Persona
                </label>
                <p className="text-sm text-gray-900 font-medium capitalize">
                  {formatPersonType(client.personType)}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Doc.
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.documentType || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Número Documento
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.document || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* First name / Last name / Status */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Nombres
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.firstName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Apellidos
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Estado
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeClass(client.active)}`}>
                  {getStatusText(client.active)}
                </span>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* Email / Phone / Credit */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Correo Electrónico
                </label>
                <p className="text-sm text-gray-900 font-medium break-words">{client.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Teléfono
                </label>
                <p className="text-sm text-gray-900 font-medium">{formatPhoneNumber(client.phone)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Crédito Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.clientCredit || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* Address */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Dirección
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.address || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* Contact name / Contact phone / Client type */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Persona Contacto
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.contactName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Teléfono Contacto
                </label>
                <p className="text-sm text-gray-900 font-medium">{formatContactPhone(client.contactPhone)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium capitalize">{formatClientType(client.clientType)}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1" />

              {/* RUT / CIU code */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  RUT
                </label>
                <p className="text-sm text-gray-900 font-medium">{formatRut(client.rut)}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Código CIU
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.ciuCode || 'N/A'}</p>
              </div>
              <div />

            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-medium text-white bg-gray-500 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* Graph section (expandable) */}
        {showGraph && (
          <div className="w-1/2 flex flex-col">
            <GraphClient clientStartDate={client.clientSince || '07/05/2023'} />
          </div>
        )}

        {/* Toggle graph button */}
        <button
          onClick={() => setShowGraph(!showGraph)}
          className={`absolute top-1/2 -translate-y-1/2 bg-[#004D77] text-white p-2 rounded-full shadow-lg hover:bg-[#003a5c] transition-all z-10 ${
            showGraph ? 'left-1/2 -translate-x-1/2' : 'right-4'
          }`}
          title={showGraph ? 'Ocultar gráfica' : 'Ver gráfica'}
        >
          <ChevronRight className={`w-5 h-5 transition-transform ${showGraph ? 'rotate-180' : ''}`} strokeWidth={2.5} />
        </button>

      </div>
    </div>
  );
}

export default InfoClient;