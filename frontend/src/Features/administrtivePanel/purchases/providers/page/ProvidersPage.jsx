/**
 * Archivo: ProvidersPage.jsx
 *
 * Este archivo contiene el componente encargado de gestionar la página principal
 * del módulo de Proveedores.
 */

import React, { useState, useEffect, useCallback } from 'react';
import ProvidersToolbar from '../components/ProvidersToolbar';
import ProvidersTable from '../components/ProvidersTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import FormProvider from '../components/FormProvider';
import InfoProvider from '../components/InfoProvider';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { providersService } from '../data/providersService';
import Spinner from '../../../../shared/spinner';

const RECORDS_PER_PAGE = 13;
const SEARCH_FETCH_LIMIT = 10000;
const SEARCH_DEBOUNCE_MS = 350;

const useDebouncedValue = (value, delay = SEARCH_DEBOUNCE_MS) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

const normalizeSearch = (value) =>
  String(value ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

const flattenSearchValues = (value) => {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap(flattenSearchValues);
  if (typeof value === 'object') return Object.values(value).flatMap(flattenSearchValues);
  return [String(value)];
};

const providerMatchesSearch = (provider, searchTerm) => {
  const term = normalizeSearch(searchTerm).trim();
  if (!term) return true;

  if (['activo', 'activos'].includes(term)) return provider.activo === true;
  if (['inactivo', 'inactivos'].includes(term)) return provider.activo === false;

  const statusText = provider.activo ? 'Activo' : 'Inactivo';
  const searchable = [
    ...flattenSearchValues(provider),
    statusText,
    provider.nombre,
    `${provider.nombres || ''} ${provider.apellidos || ''}`,
  ];

  return searchable.some((value) => normalizeSearch(value).includes(term));
};

function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const { showConfirm, showSuccess, showError } = useAlert();

  const loadProviders = useCallback(async () => {
    setLoading(true);
    try {
      const hasSearch = debouncedSearchTerm.trim() !== '' || statusFilter !== '';
      const result = await providersService.getAll({
        page: hasSearch ? 1 : currentPage,
        limit: hasSearch ? SEARCH_FETCH_LIMIT : RECORDS_PER_PAGE,
        search: ''
      });

      if (hasSearch) {
        const filtered = result.data
          .filter((provider) => providerMatchesSearch(provider, debouncedSearchTerm))
          .filter((provider) => {
            if (statusFilter === 'activo') return provider.activo === true;
            if (statusFilter === 'inactivo') return provider.activo === false;
            return true;
          });
        const start = (currentPage - 1) * RECORDS_PER_PAGE;
        setProviders(filtered.slice(start, start + RECORDS_PER_PAGE));
        setTotalRecords(filtered.length);
      } else {
        setProviders(result.data);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, showError]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const handleToggleActive = async (id) => {
    const provider = providers.find(p => p.id === id);
    const newStatus = provider.activo ? 'Inactivo' : 'Activo';

    if (provider.activo) {
      const result = await showConfirm(
        'warning',
        'Cambiar estado',
        `¿Está seguro de cambiar el estado del proveedor "${provider.nombre}" a ${newStatus}?`,
        { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
      );

      if (!result?.isConfirmed) return;
    }

    try {
      await providersService.toggleActive(id);
      await loadProviders();
      showSuccess('Estado cambiado', `El proveedor ahora está ${newStatus}`);
    } catch (error) {
      showError('Error', error.message || 'No se pudo cambiar el estado del proveedor');
    }
  };

  const handleEdit = (provider) => {
    setSelectedProvider(provider);
    setIsFormModalOpen(true);
  };

  const handleInfo = (provider) => {
    setSelectedProvider(provider);
    setIsInfoModalOpen(true);
  };

  const handleNewProvider = () => {
    setSelectedProvider(null);
    setIsFormModalOpen(true);
  };

  const mapProviderFormToService = (formData) => ({
    tipoPersona: formData.personType ?? formData.tipoPersona,
    tipo: formData.documentType ?? formData.tipo,
    numero: formData.documentNumber ?? formData.numero,
    nombres: formData.nameProvider ?? formData.nombres,
    apellidos: formData.lastname ?? formData.apellidos,
    correo: formData.email ?? formData.correo,
    telefono: formData.phone ?? formData.telefono,
    direccion: formData.address ?? formData.direccion,
    nombreContacto: formData.contactPersonName ?? formData.nombreContacto,
    numeroContacto: formData.contactPersonNumber ?? formData.numeroContacto,
    rut: typeof formData.rut === 'boolean' ? (formData.rut ? 'si' : 'no') : formData.rut,
    codigoCIU: formData.ciuCode ?? formData.codigoCIU,
    plazoDevoluciones: formData.maxReturnPeriod ?? formData.plazoDevoluciones,
    categoryIds: formData.categoryIds || [],
    idStatus: formData.idStatus
  });

  const handleSave = async (formData) => {
    try {
      const providerPayload = mapProviderFormToService(formData);

      if (selectedProvider) {
        const updatedProvider = await providersService.update(selectedProvider.id, providerPayload);
        
        if (updatedProvider) {
          setProviders(prev => prev.map(p => p.id === selectedProvider.id ? updatedProvider : p));
          showSuccess('Proveedor actualizado', 'Los datos se actualizaron correctamente');
        }
      } else {
        const newProvider = await providersService.create(providerPayload);
        
        setProviders(prev => [...prev, newProvider]);
        loadProviders(); // Recargar para tener datos actualizados
        showSuccess('Proveedor creado', 'El nuevo proveedor se creó exitosamente');
      }
      //  No cerrar el modal aquí, se cierra en FormProvider después del éxito
    } catch (error) {
      showError('Error', error.message || 'No se pudo guardar el proveedor');
      throw error; //  Relanzar para que FormProvider no cierre el modal
    }
  };

  const handleDelete = async (provider) => {
    const result = await showConfirm(
      'warning',
      'Eliminar proveedor',
      `¿Está seguro de eliminar el proveedor "${provider.nombre}"? Esta acción no se puede deshacer.`,
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        await providersService.delete(provider.id);
        setProviders(prev => prev.filter(p => p.id !== provider.id));
        
        const newTotalPages = Math.ceil((totalRecords - 1) / RECORDS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else {
          loadProviders();
        }
        
        showSuccess('Proveedor eliminado', 'El proveedor ha sido eliminado exitosamente');
      } catch (error) {
        showError('Error', error.message || 'No se pudo eliminar el proveedor');
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleStatusChange = (nextStatus) => {
    setStatusFilter(nextStatus);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  if (loading && providers.length === 0) {
    return (
      <Spinner message="Cargando proveedores..." />
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      <ProvidersToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onNewClick={handleNewProvider}
      />

      <div className="bg-white rounded-xl shadow-md">
        <ProvidersTable
          providers={providers}
          startIndex={startIndex}
          searchTerm={searchTerm}
          totalData={totalRecords}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </div>

      {totalRecords > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={totalRecords}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      <FormProvider
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        provider={selectedProvider}
        onSave={handleSave}
      />

      <InfoProvider
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        provider={selectedProvider}
      />
    </div>
  );
}

export default ProvidersPage;
