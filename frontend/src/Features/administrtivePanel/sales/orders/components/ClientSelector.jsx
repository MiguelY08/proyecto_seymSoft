import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, IdCard, Mail, Phone, Plus, Users, X } from 'lucide-react';

function ClientSelector({ formData, errors, clientes, loading, readOnly = false, isEditMode, onClienteChange, onCreateClient }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isDisabled = loading || readOnly || isEditMode;
  const showError = errors.clienteId && (formData.clienteId === undefined || formData.clienteId === null || formData.clienteId === '');

  useEffect(() => {
    const client = clientes.find((item) => Number(item.id) === Number(formData.clienteId));
    setSearchTerm(client ? (client.name || client.fullName || '') : '');
  }, [formData.clienteId, clientes]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredClients = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return clientes;
    return clientes.filter((client) => [client.name, client.fullName, client.phone, client.email, client.document, client.address, client.direccion]
      .some((value) => String(value || '').toLowerCase().includes(term)));
  }, [clientes, searchTerm]);

  const selectClient = (clientId) => {
    const client = clientes.find((item) => item.id === clientId);
    if (client) {
      setSearchTerm(client.name || client.fullName || '');
      onClienteChange({ target: { value: clientId } });
    }
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-sm font-medium text-gray-700">Cliente <span className="text-red-500">*</span></label>
      <div className="flex flex-col items-stretch gap-2 sm:flex-row">
        <div className="relative min-w-0 flex-1" ref={wrapperRef}>
          <Users className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-gray-400" strokeWidth={1.8} />
          <input type="text" placeholder="Buscar cliente por nombre, teléfono, email..." value={searchTerm}
            onChange={(event) => { setSearchTerm(event.target.value); setIsDropdownOpen(true); }}
            onFocus={() => !isDisabled && setIsDropdownOpen(true)} disabled={isDisabled}
            className={`w-full rounded-lg border py-2.5 pl-10 pr-8 text-sm outline-none transition-colors duration-200 ${showError ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-gray-300 focus:border-[#004D77] focus:ring-2 focus:ring-[#004D77]/20'} ${isDisabled ? 'cursor-not-allowed border-gray-300 bg-gray-100 text-gray-600' : 'bg-white text-gray-700'}`} />
          <div className="absolute right-2 top-1/2 z-10 flex -translate-y-1/2 items-center gap-1">
            {searchTerm && !isDisabled && <button onClick={() => { setSearchTerm(''); onClienteChange({ target: { value: '' } }); }} className="text-gray-400 transition-colors hover:text-gray-600" type="button"><X className="h-4 w-4" strokeWidth={1.8} /></button>}
            {!isDisabled && <ChevronDown className="pointer-events-none h-4 w-4 text-gray-400" strokeWidth={2} />}
          </div>
          {isDropdownOpen && !isDisabled && (
            <div className="absolute z-30 mt-1 max-h-72 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg overscroll-contain">
              {filteredClients.length ? <ul className="py-1">{filteredClients.map((client) => <li key={client.id}><button type="button" onClick={() => selectClient(client.id)} className="w-full px-4 py-2 text-left text-sm transition-colors duration-150 hover:bg-[#004D77]/10"><div className="font-medium text-gray-800">{client.name || client.fullName}{client.id === 0 && <span className="ml-2 text-xs text-blue-600">(Cliente de Caja)</span>}</div><div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">{client.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3 w-3" strokeWidth={1.5} />{client.phone}</span>}{client.email && <span className="inline-flex items-center gap-1"><Mail className="h-3 w-3" strokeWidth={1.5} />{client.email}</span>}{client.document && <span className="inline-flex items-center gap-1"><IdCard className="h-3 w-3" strokeWidth={1.5} />{client.document}</span>}</div></button></li>)}</ul> : <div className="px-4 py-3 text-center text-sm text-gray-500">No se encontraron clientes</div>}
            </div>
          )}
        </div>
        {onCreateClient && !readOnly && !isEditMode && <button type="button" onClick={onCreateClient} disabled={loading} title="Crear cliente" className="inline-flex h-10 w-full items-center justify-center rounded-lg border border-[#004D77] bg-white text-[#004D77] transition-colors hover:bg-[#004D77] hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-10 sm:shrink-0"><Plus className="h-4 w-4" strokeWidth={2} /></button>}
      </div>
      {showError && <p className="mt-0.5 text-xs text-red-500">{errors.clienteId}</p>}
    </div>
  );
}

export default ClientSelector;
