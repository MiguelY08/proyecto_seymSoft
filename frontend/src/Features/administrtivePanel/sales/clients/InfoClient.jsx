import React, { useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import GraphClient from './GraphClient';

function InfoClient({ isOpen, onClose, client }) {
  const [showGraph, setShowGraph] = useState(false);

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative bg-white rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex transition-all h-[90vh] ${
        showGraph ? 'w-[95vw] max-w-[1600px]' : 'w-full max-w-3xl'
      }`}>
        
        {/* Info Section */}
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

          {/* Content - adapted to provider style */}
          <div className="overflow-y-auto flex-1 px-8 py-5">
            <div className="grid grid-cols-3 gap-x-6 gap-y-3">

              {/* Número Cliente full width */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Número Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.id || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* fila 1: tipo persona, tipo doc, número documento */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Persona
                </label>
                <p className="text-sm text-gray-900 font-medium capitalize">
                  {client.tipoPersona === 'natural' ? 'Natural' : client.tipoPersona === 'juridica' ? 'Jurídica' : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Doc.
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.tipo || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Número Documento
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.numero || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* fila 2: nombres, apellidos, estado */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Nombres
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.nombres || client.nombre || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Apellidos
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.apellidos || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Estado
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  client.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>{client.activo ? 'Activo' : 'Inactivo'}</span>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* fila 3: correo, teléfono, crédito */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Correo Electrónico
                </label>
                <p className="text-sm text-gray-900 font-medium break-words">{client.correo || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Teléfono
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.telefono ? `(${client.telefono.slice(0,3)}) ${client.telefono.slice(3,6)} ${client.telefono.slice(6)}` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Crédito Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.creditoCliente || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* Dirección fila completa */}
              <div className="col-span-3">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Dirección
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.direccion || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* fila 5: contacto, teléfono contacto, tipo cliente */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Persona Contacto
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.nombreContacto || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Teléfono Contacto
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.numeroContacto ? `${client.numeroContacto.slice(0,3)} ${client.numeroContacto.slice(3,6)} ${client.numeroContacto.slice(6)}` : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Tipo Cliente
                </label>
                <p className="text-sm text-gray-900 font-medium capitalize">{client.tipoCliente || 'N/A'}</p>
              </div>

              <div className="col-span-3 border-t border-gray-200 my-1"></div>

              {/* fila 6: RUT, CIU */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  RUT
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.rut === 'si' ? 'Sí' : client.rut === 'no' ? 'No' : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">
                  Código CIU
                </label>
                <p className="text-sm text-gray-900 font-medium">{client.codigoCIU || 'N/A'}</p>
              </div>
              <div></div>

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

        {/* Graph Section (expandable) */}
        {showGraph && (
          <div className="w-1/2 flex flex-col">
            <GraphClient clientStartDate={client.clienteSince || '07/05/2023'} />
          </div>
        )}

        {/* Toggle Graph Button */}
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