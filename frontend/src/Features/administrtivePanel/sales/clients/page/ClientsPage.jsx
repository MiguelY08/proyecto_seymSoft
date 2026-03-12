/**
 * Archivo: ClientsPage.jsx
 *
 * Página principal de gestión de clientes en el panel administrativo.
 * Contiene toolbar, tabla, paginación y modales para crear/editar/ver
 * información de clientes. Maneja la lógica de carga, búsqueda,
 * paginación y CRUD utilizando servicios basados en localStorage.
 */
import React, { useState, useEffect } from 'react';
import ClientsToolbar from '../components/ClientsToolbar';
import ClientsTable from '../components/ClientsTable';
import ClientsPagination from '../components/ClientsPagination';
import FormClient from '../components/FormClient';
import InfoClient from '../components/InfoClient';
import { useAlert } from '../../../../shared/alerts/useAlert';
import { clientsService } from '../data/clientsService';
import { filterClients, paginateData } from '../utils/clientHelpers';

const RECORDS_PER_PAGE = 13;

function ClientsPage() {
  // estado principal
  const [clients, setClients] = useState([]); // todos los clientes en el sistema
  const [searchTerm, setSearchTerm] = useState(''); // texto del buscador
  const [currentPage, setCurrentPage] = useState(1); // página activa de la tabla
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // crear/editar
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false); // ver detalles
  const [selectedClient, setSelectedClient] = useState(null); // cliente en foco
  const [loading, setLoading] = useState(true); // indicador de carga inicial

  const { showConfirm, showSuccess, showError } = useAlert();

  // cargamos los clientes al montar el componente
  useEffect(() => {
    loadClients();
  }, []);

  // obtiene todos los clientes desde el servicio y actualiza el estado
  const loadClients = () => {
    try {
      const data = clientsService.getAll();
      setClients(data);
    } catch (error) {
      showError('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // alterna el estado activo/inactivo con confirmación del usuario
  const handleToggleActive = async (id) => {
    const client = clients.find(c => c.id === id);
    const newStatus = client.activo ? 'Inactivo' : 'Activo';

    const result = await showConfirm(
      'warning',
      'Cambiar estado',
      `¿Está seguro de cambiar el estado del cliente "${client.nombreCompleto}" a ${newStatus}?`,
      { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        const updatedClient = clientsService.toggleActive(id);
        if (updatedClient) {
          setClients(prev => prev.map(c => c.id === id ? updatedClient : c));
          showSuccess('Estado cambiado', `El cliente ahora está ${newStatus}`);
        }
      } catch (error) {
        showError('Error', 'No se pudo cambiar el estado del cliente');
      }
    }
  };

  // abrir modal de edición con el cliente seleccionado
  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  // mostrar modal de información detallada
  const handleInfo = (client) => {
    setSelectedClient(client);
    setIsInfoModalOpen(true);
  };

  // preparar formulario para crear un cliente nuevo
  const handleNewClient = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  // recibe datos del formulario y crea o actualiza según el cliente seleccionado
  const handleSave = (formData) => {
    try {
      if (selectedClient) {
        const updatedClient = clientsService.update(selectedClient.id, formData);
        if (updatedClient) {
          setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
          showSuccess('Cliente actualizado', 'Los datos del cliente se actualizaron correctamente');
        }
      } else {
        const newClient = clientsService.create(formData);
        setClients(prev => [...prev, newClient]);
        showSuccess('Cliente creado', 'El nuevo cliente se creó exitosamente');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      showError('Error', 'No se pudo guardar el cliente');
    }
  };

  // elimina un cliente después de confirmar con el usuario y ajusta paginación
  const handleDelete = async (client) => {
    const result = await showConfirm(
      'error',
      'Eliminar cliente',
      `¿Está seguro de eliminar el cliente "${client.nombreCompleto}"? Esta acción no se puede deshacer.`,
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        clientsService.delete(client.id);
        setClients(prev => prev.filter(c => c.id !== client.id));

        const filtered = filterClients(clients.filter(c => c.id !== client.id), searchTerm);
        const newTotalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }

        showSuccess('Cliente eliminado', 'El cliente ha sido eliminado exitosamente');
      } catch (error) {
        showError('Error', 'No se pudo eliminar el cliente');
      }
    }
  };

  // actualización del término de búsqueda y reset de página
  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // aplicar filtrado y paginación antes de renderizar
  const filteredClients = filterClients(clients, searchTerm);
  const { currentData, totalPages, startIndex } = paginateData(
    filteredClients,
    currentPage,
    RECORDS_PER_PAGE
  );

  // mientras se cargan los datos, mostramos un spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-4">

      <ClientsToolbar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onNewClick={handleNewClient}
      />

      {/* ── Tabla ──────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow-md">
        <ClientsTable
          clients={currentData}
          startIndex={startIndex}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </div>

      {/* ── Footer: contador + paginador ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm font-semibold text-gray-700">
          Mostrando{' '}
          <span className="text-[#004D77]">{currentData.length}</span>
          {' '}registros de{' '}
          <span className="text-[#004D77]">{filteredClients.length}</span>
        </p>

        {totalPages > 1 && (
          <div className="bg-white shadow-md rounded-xl px-3 py-2">
            <ClientsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <FormClient
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        client={selectedClient}
        onSave={handleSave}
      />

      <InfoClient
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        client={selectedClient}
      />
    </div>
  );
}

export default ClientsPage;
