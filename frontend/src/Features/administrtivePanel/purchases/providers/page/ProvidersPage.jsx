/**
 * Archivo: ProvidersPage.jsx
 *
 * Este archivo contiene el componente encargado de gestionar la página principal
 * del módulo de Proveedores.
 *
 * Responsabilidades:
 * - Gestionar el estado de proveedores (listar, crear, editar, eliminar)
 * - Controlar la búsqueda y filtrado de proveedores
 * - Administrar la paginación de resultados
 * - Coordinar la apertura de formularios y modales
 * - Manejar las acciones del usuario (CRUD)
 * - Mostrar alertas de confirmación y notificaciones
 *
 * Este componente es el orquestador central del módulo de Proveedores.
 */

import React, { useState, useEffect } from 'react';
import ProvidersToolbar from '../components/ProvidersToolbar';
import ProvidersTable from '../components/ProvidersTable';
import PaginationAdmin from '../../../../shared/PaginationAdmin';
import FormProvider from '../components/FormProvider';
import InfoProvider from '../components/InfoProvider';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { providersService } from '../data/providersService';
import { filterProviders, paginateData } from '../utils/providerHelpers';

// Cantidad de registros a mostrar por página
const RECORDS_PER_PAGE = 13;

/**
 * Componente: ProvidersPage
 *
 * Página principal que renderiza la interfaz completa del módulo de Proveedores.
 * Maneja toda la lógica de carga, búsqueda, paginación y operaciones CRUD.
 */
function ProvidersPage() {
  // Estado que almacena la lista de proveedores cargados desde localStorage
  const [providers, setProviders] = useState([]);
  
  // Estado que almacena el término de búsqueda ingresado por el usuario
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado que controla la página actual en la paginación
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estado que controla si el modal del formulario (crear/editar) está abierto
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  
  // Estado que controla si el modal de información (ver detalles) está abierto
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  
  // Estado que almacena el proveedor seleccionado para editar o ver detalles
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Estado que indica si se están cargando los datos inicialmente
  const [loading, setLoading] = useState(true);

  // Hook para mostrar alertas personalizadas (confirmación, éxito, error)
  const { showConfirm, showSuccess, showError } = useAlert();

  // Este useEffect se ejecuta cuando el componente se monta.
  // Su función es cargar los proveedores almacenados en localStorage
  // y guardarlos en el estado del componente.
  useEffect(() => {
    loadProviders();
  }, []);

  // ======== FUNCIONALIDAD: Cargar Proveedores ========
  /**
   * Obtiene la lista de proveedores del servicio (localStorage)
   * y la guarda en el estado. Maneja el estado de carga.
   */
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

  // ======== FUNCIONALIDAD: Cambiar Estado del Proveedor ========
  /**
   * Cambia el estado (activo/inactivo) de un proveedor.
   * Primero pide confirmación al usuario y luego actualiza el servicio.
   * @param {string} id - ID del proveedor a cambiar
   */
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

  // ======== FUNCIONALIDAD: Editar Proveedor ========
  /**
   * Abre el modal del formulario para editar un proveedor existente.
   * @param {Object} provider - Objeto del proveedor a editar
   */
  const handleEdit = (provider) => {
    setSelectedProvider(provider);
    setIsFormModalOpen(true);
  };

  // ======== FUNCIONALIDAD: Ver Información del Proveedor ========
  /**
   * Abre el modal de información para mostrar los detalles completos de un proveedor.
   * @param {Object} provider - Objeto del proveedor a mostrar
   */
  const handleInfo = (provider) => {
    setSelectedProvider(provider);
    setIsInfoModalOpen(true);
  };

  // ======== FUNCIONALIDAD: Crear Nuevo Proveedor ========
  /**
   * Abre el modal del formulario para crear un nuevo proveedor.
   * Limpia el selectedProvider para que el formulario esté vacío.
   */
  const handleNewProvider = () => {
    setSelectedProvider(null);
    setIsFormModalOpen(true);
  };

  // ======== FUNCIONALIDAD: Guardar Proveedor ========
  /**
   * Guarda un nuevo proveedor o actualiza uno existente.
   * Si hay selectedProvider, realiza una actualización; si no, crea uno nuevo.
   * @param {Object} formData - Datos del formulario del proveedor
   */
  const handleSave = (formData) => {
    try {
      if (selectedProvider) {
        const updatedProvider = providersService.update(selectedProvider.id, formData);
        if (updatedProvider) {
          setProviders(prev => prev.map(p => p.id === selectedProvider.id ? updatedProvider : p));
        }
      } else {
        const newProvider = providersService.create(formData);
        setProviders(prev => [...prev, newProvider]);
      }
      setIsFormModalOpen(false);
    } catch (error) {
      showError('Error', 'No se pudo guardar el proveedor');
    }
  };

  // ======== FUNCIONALIDAD: Eliminar Proveedor ========
  /**
   * Elimina un proveedor después de confirmar con el usuario.
   * Actualiza la lista de proveedores y reajusta la paginación si es necesario.
   * @param {Object} provider - Objeto del proveedor a eliminar
   */
  const handleDelete = async (provider) => {
    const result = await showConfirm(
      'error',
      'Eliminar proveedor',
      `¿Está seguro de eliminar el proveedor "${provider.nombre}"? Esta acción no se puede deshacer.`,
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        providersService.delete(provider.id);
        setProviders(prev => prev.filter(p => p.id !== provider.id));

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

  // ======== FUNCIONALIDAD: Búsqueda y Filtrado ========
  /**
   * Actualiza el término de búsqueda y reinicia la paginación a la página 1.
   * @param {string} term - Término de búsqueda a aplicar
   */
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filtra los proveedores según el término de búsqueda
  const filteredProviders = filterProviders(providers, searchTerm);
  
  // Pagina los proveedores filtrados según la página actual
  const { currentData } = paginateData(
    filteredProviders,
    currentPage,
    RECORDS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          {/* Mensaje de carga mientras se obtienen los proveedores */}
          <p className="mt-4 text-gray-600">Cargando proveedores...</p>
        </div>
      </div>
    );
  }

  {/* ======== RENDERIZADO: Interfaz Principal ======== */}
  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      {/* Toolbar: Búsqueda y botón para crear nuevo proveedor */}
      <ProvidersToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onNewClick={handleNewProvider}
      />

      {/* Tabla de proveedores con acciones CRUD */}
      <div className="bg-white rounded-xl shadow-md">
        <ProvidersTable
          providers={currentData}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </div>

      {/* Paginación - mismo estilo que ClientsPage */}
      {filteredProviders.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filteredProviders.length}
          recordsPerPage={RECORDS_PER_PAGE}
        />
      )}

      {/* Modal para crear o editar un proveedor */}
      <FormProvider
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        provider={selectedProvider}
        onSave={handleSave}
      />

      {/* Modal para mostrar información detallada del proveedor */}
      <InfoProvider
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        provider={selectedProvider}
      />
    </div>
  );
}

export default ProvidersPage;