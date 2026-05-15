/**
 * Archivo: ProvidersPage.jsx
 *
 * Este archivo contiene el componente encargado de gestionar la página principal
 * del módulo de Proveedores.
 */

import React, { useState, useEffect } from 'react';
import ProvidersToolbar from '../components/ProvidersToolbar';
import ProvidersTable from '../components/ProvidersTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import FormProvider from '../components/FormProvider';
import InfoProvider from '../components/InfoProvider';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { providersService } from '../data/providersService';

const RECORDS_PER_PAGE = 13;

function ProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showConfirm, showSuccess, showError } = useAlert();

  useEffect(() => {
    loadProviders();
  }, [currentPage, searchTerm]);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const result = await providersService.getAll({
        page: currentPage,
        limit: RECORDS_PER_PAGE,
        search: searchTerm
      });
      
      setProviders(result.data);
      setTotalRecords(result.pagination.total);
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar los proveedores');
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
      { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        // Llamar al toggle en el backend
        await providersService.toggleActive(id);
        // Recargar toda la lista para obtener los datos actualizados
        await loadProviders();
        showSuccess('Estado cambiado', `El proveedor ahora está ${newStatus}`);
      } catch (error) {
        showError('Error', error.message || 'No se pudo cambiar el estado del proveedor');
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
const handleSave = async (formData) => {
    try {
      if (selectedProvider) {
        //  Para editar, pasar los datos en el formato que espera el servicio
        const updatedProvider = await providersService.update(selectedProvider.id, {
          tipoPersona: formData.personType,
          correo: formData.email,
          phone: formData.phone,  //  El servicio espera 'telefono'
          direccion: formData.address,
          nombreContacto: formData.contactPersonName,
          numeroContacto: formData.contactPersonNumber,
          rut: formData.rut ? 'si' : 'no',  // Convertir booleano a 'si'/'no'
          codigoCIU: formData.ciuCode,
          plazoDevoluciones: formData.maxReturnPeriod,
          categoryIds: formData.categoryIds,
          idStatus: formData.idStatus
        });
        
        if (updatedProvider) {
          setProviders(prev => prev.map(p => p.id === selectedProvider.id ? updatedProvider : p));
          showSuccess('Proveedor actualizado', 'Los datos se actualizaron correctamente');
        }
      } else {
        //  Para crear, pasar los datos en el formato que espera el servicio
        const newProvider = await providersService.create({
          tipoPersona: formData.personType,
          tipo: formData.documentType,
          numero: formData.documentNumber,
          nombres: formData.nameProvider,
          apellidos: formData.lastname,
          correo: formData.email,
          telefono: formData.phone,  //  El servicio espera 'telefono'
          direccion: formData.address,
          nombreContacto: formData.contactPersonName,
          numeroContacto: formData.contactPersonNumber,
          rut: formData.rut ? 'si' : 'no',  //  Convertir booleano a 'si'/'no'
          codigoCIU: formData.ciuCode,
          plazoDevoluciones: formData.maxReturnPeriod,
          categoryIds: formData.categoryIds,
          idStatus: formData.idStatus
        });
        
        setProviders(prev => [...prev, newProvider]);
        showSuccess('Proveedor creado', 'El nuevo proveedor se creó exitosamente');
        loadProviders(); // Recargar para tener datos actualizados
      }
      //  No cerrar el modal aquí, se cierra en FormProvider después del éxito
    } catch (error) {
      showError('Error', error.message || 'No se pudo guardar el proveedor');
      throw error; //  Relanzar para que FormProvider no cierre el modal
    }
};

  const handleDelete = async (provider) => {
    const result = await showConfirm(
      'error',
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

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  if (loading && providers.length === 0) {
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
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
      <ProvidersToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onNewClick={handleNewProvider}
      />

      <div className="bg-white rounded-xl shadow-md">
        <ProvidersTable
          providers={providers}
          startIndex={startIndex}
          searchTerm={searchTerm}
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