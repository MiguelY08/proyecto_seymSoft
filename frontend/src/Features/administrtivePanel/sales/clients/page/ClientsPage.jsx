import React, { useState, useEffect } from 'react';
import ClientsToolbar from '../components/ClientsToolbar';
import ClientsTable from '../components/ClientsTable';
import ClientsPagination from '../components/ClientsPagination';
import FormClient from '../components/FormClient';
import InfoClient from '../components/InfoClient';
import { useAlert } from '../../../../shared/alerts/useAlert';  // ← CORREGIDO: 4 niveles
import { clientsService } from '../data/clientsService';
import { filterClients, paginateData } from '../utils/clientHelpers';

const RECORDS_PER_PAGE = 10;

function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showConfirm, showSuccess, showError } = useAlert();

  // Load clients from localStorage on mount
  useEffect(() => {
    loadClients();
  }, []);

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

  const handleToggleActive = async (id) => {
    const client = clients.find(c => c.id === id);
    const newStatus = client.activo ? 'Inactivo' : 'Activo';

    const result = await showConfirm(
      'warning',
      'Cambiar estado',
      `¿Está seguro de cambiar el estado del cliente "${client.nombreCompleto}" a ${newStatus}?`,
      {
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText: 'Cancelar',
      }
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

  const handleEdit = (client) => {
    setSelectedClient(client);
    setIsFormModalOpen(true);
  };

  const handleInfo = (client) => {
    setSelectedClient(client);
    setIsInfoModalOpen(true);
  };

  const handleNewClient = () => {
    setSelectedClient(null);
    setIsFormModalOpen(true);
  };

  const handleSave = (formData) => {
    try {
      if (selectedClient) {
        // Update existing client
        const updatedClient = clientsService.update(selectedClient.id, formData);
        if (updatedClient) {
          setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));
          showSuccess('Cliente actualizado', 'Los datos del cliente se actualizaron correctamente');
        }
      } else {
        // Create new client
        const newClient = clientsService.create(formData);
        setClients(prev => [...prev, newClient]);
        showSuccess('Cliente creado', 'El nuevo cliente se creó exitosamente');
      }
      setIsFormModalOpen(false);
    } catch (error) {
      showError('Error', 'No se pudo guardar el cliente');
    }
  };

  const handleDelete = async (client) => {
    const result = await showConfirm(
      'error',
      'Eliminar cliente',
      `¿Está seguro de eliminar el cliente "${client.nombreCompleto}"? Esta acción no se puede deshacer.`,
      {
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
      }
    );

    if (result.isConfirmed) {
      try {
        clientsService.delete(client.id);
        setClients(prev => prev.filter(c => c.id !== client.id));
        
        // Adjust current page if necessary
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

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Filter and paginate clients
  const filteredClients = filterClients(clients, searchTerm);
  const { currentData, totalPages, startIndex } = paginateData(
    filteredClients, 
    currentPage, 
    RECORDS_PER_PAGE
  );

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
    <div className="min-h-screen flex flex-col gap-3 p-3 sm:p-4">
      <ClientsToolbar 
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        onNewClick={handleNewClient}
      />

      <ClientsTable 
        clients={currentData}
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
          <span className="text-[#004D77]">{filteredClients.length}</span>
        </p>

        <div className="bg-white shadow-md rounded-xl px-3 py-2">
          <ClientsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
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