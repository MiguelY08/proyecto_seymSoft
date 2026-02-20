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

          {/* Content - Grid en 2 columnas con mejor espaciado */}
          <div className="overflow-y-auto flex-1 px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5 max-w-5xl mx-auto">

              {/* Numero Cliente */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Numero Cliente</span>
                <span className="text-sm text-gray-800 font-medium">{client.id || 'N/A'}</span>
              </div>

              {/* Tipo y No. Documento */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Tipo y No. Documento</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.tipo} {client.numero}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Nombre completo - Ancho completo */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Nombre completo</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.nombre || `${client.nombres || ''} ${client.apellidos || ''}`.trim() || 'N/A'}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Correo electrónico */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Correo electrónico</span>
                <span className="text-sm text-gray-800 font-medium break-words">
                  {client.correo || 'N/A'}
                </span>
              </div>

              {/* Teléfono - Celular */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Teléfono - Celular</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.telefono ? `(${client.telefono.slice(0, 3)}) ${client.telefono.slice(3, 6)} ${client.telefono.slice(6)}` : 'N/A'}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Dirección - Ancho completo */}
              <div className="md:col-span-2 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Dirección</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.direccion || 'N/A'}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Persona contacto */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Persona contacto</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.nombreContacto || 'N/A'}
                </span>
              </div>

              {/* Num. Persona contacto */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Num. Persona contacto</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.numeroContacto ? `${client.numeroContacto.slice(0, 3)} ${client.numeroContacto.slice(3, 6)} ${client.numeroContacto.slice(6)}` : 'N/A'}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Codigo CIU */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Codigo CIU</span>
                <span className="text-sm text-gray-800 font-medium">
                  {client.codigoCIU || 'No Disponible'}
                </span>
              </div>

              {/* Tipo de Persona */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Tipo de Persona</span>
                <span className="text-sm text-gray-800 font-medium capitalize">
                  {client.tipoPersona === 'natural' ? 'Natural' : client.tipoPersona === 'juridica' ? 'Jurídica' : 'N/A'}
                </span>
              </div>

              {/* Separador */}
              <div className="md:col-span-2 border-t border-gray-200"></div>

              {/* Tipo de cliente */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Tipo de cliente</span>
                <span className="text-sm text-gray-800 font-medium capitalize">
                  {client.tipoCliente || 'N/A'}
                </span>
              </div>

              {/* Estado actual */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-gray-500 uppercase">Estado actual</span>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    client.activo 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {client.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

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