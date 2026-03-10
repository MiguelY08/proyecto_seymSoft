import React, { useState, useEffect } from 'react';
import ProvidersToolbar from '../components/ProvidersToolbar';
import ProvidersTable from '../components/ProvidersTable';
import ProvidersPagination from '../components/ProvidersPagination';
import FormProvider from '../components/FormProvider';
import InfoProvider from '../components/InfoProvider';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { providersService } from '../data/providersService';
import { filterProviders, paginateData } from '../utils/providerHelpers';

const RECORDS_PER_PAGE = 10;  // ← CAMBIADO DE 15 A 10

function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showConfirm, showSuccess, showError } = useAlert();

  // Load providers from localStorage on mount
  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = () => {
    try {
      const data = providersService.getAll();
      setProviders(data);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    const provider = providers.find(p => p.id === id);
    const newStatus = provider.activo ? 'Inactivo' : 'Activo';

    const result = await showConfirm(
      'warning',
      'Cambiar estado',
      `¿Está seguro de cambiar el estado del proveedor "${provider.nombre}" a ${newStatus}?`,
      {
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      }
    );

    if (result.isConfirmed) {
      try {
        const updatedProvider = providersService.toggleActive(id);
        if (updatedProvider) {
          setProviders(prev => prev.map(p => p.id === id ? updatedProvider : p));
          showSuccess('Estado cambiado', `El proveedor ahora está ${newStatus}`);
        }
      } catch (error) {
        showError('Error', 'No se pudo cambiar el estado del proveedor');
      }
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

  const handleSave = (formData) => {
    try {
      if (selectedProvider) {
        // Update existing provider
        const updatedProvider = providersService.update(selectedProvider.id, formData);
        if (updatedProvider) {
          setProviders(prev => prev.map(p => p.id === selectedProvider.id ? updatedProvider : p));
        }
      } else {
        // Create new provider
        const newProvider = providersService.create(formData);
        setProviders(prev => [...prev, newProvider]);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      showError('Error', 'No se pudo guardar el proveedor');
    }
  };

  const handleDelete = async (provider) => {
    const result = await showConfirm(
      'error',
      'Eliminar proveedor',
      `¿Está seguro de eliminar el proveedor "${provider.nombre}"? Esta acción no se puede deshacer.`,
      {
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }
    );

    if (result.isConfirmed) {
      try {
        providersService.delete(provider.id);
        setProviders(prev => prev.filter(p => p.id !== provider.id));
        
        // Adjust current page if necessary
        const filtered = filterProviders(providers.filter(p => p.id !== provider.id), searchTerm);
        const newTotalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        showSuccess('Proveedor eliminado', 'El proveedor ha sido eliminado exitosamente');
      } catch (error) {
        showError('Error', 'No se pudo eliminar el proveedor');
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filter and paginate providers
  const filteredProviders = filterProviders(providers, searchTerm);
  const { currentData, totalPages, startIndex } = paginateData(
    filteredProviders, 
    currentPage, 
    RECORDS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col gap-3 p-3 sm:p-4">
      <ProvidersToolbar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onNewClick={handleNewProvider}
      />

      <ProvidersTable 
        providers={currentData}
        startIndex={startIndex}
        searchTerm={searchTerm}
        onInfo={handleInfo}
        onEdit={handleEdit}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{currentData.length}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{filteredProviders.length}</span>
        </p>

        <div className="bg-white shadow-md rounded-xl px-3 py-2">
          <ProvidersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

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