import { useState, useEffect } from 'react';
import ClientsToolbar    from '../components/ClientsToolbar';
import ClientsTable      from '../components/ClientsTable';
import PaginationAdmin   from '../../../../shared/PaginationAdmin';
import FormClient        from '../modals/FormClient';
import InfoClient        from '../modals/InfoClient';
import { useAlert }      from '../../../../shared/alerts/useAlert';
import { clientsService } from '../services/clientsService';

const RECORDS_PER_PAGE = 13;

function ClientsPage() {
  const [clients,         setClients]         = useState([]);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalRecords,    setTotalRecords]    = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient,  setSelectedClient]  = useState(null);
  const [loading,         setLoading]         = useState(true);

  const { showConfirm, showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    loadClients();
  }, [currentPage, searchTerm]);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await clientsService.getAll({
        page: currentPage,
        limit: RECORDS_PER_PAGE,
        search: searchTerm
      });
      setClients(result.data);
      setTotalRecords(result.pagination.total);
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    const client = clients.find(c => c.id === id);
    const newStatus = client.active ? 'Inactivo' : 'Activo';

    const result = await showConfirm(
      'warning',
      'Cambiar estado',
      `¿Está seguro de cambiar el estado del cliente "${client.fullName}" a ${newStatus}?`,
      { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        await clientsService.toggleActive(id);
        await loadClients();
        showSuccess('Estado cambiado', `El cliente ahora está ${newStatus}`);
      } catch (error) {
        showError('Error', error.message || 'No se pudo cambiar el estado');
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

const handleSave = async (formData) => {
    try {
      if (selectedClient) {
        await clientsService.update(selectedClient.id, formData);
        await loadClients();
        showSuccess('Cliente actualizado', 'Los datos se actualizaron correctamente');
      } else {
        await clientsService.create(formData);
        await loadClients();
        showSuccess('Cliente creado', 'El nuevo cliente se creó exitosamente');
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudo guardar el cliente');
      throw error;
    }
};

  const handleDelete = async (client) => {
    const result = await showConfirm(
      'warning',
      `¿Eliminar a "${client.fullName}"?`,
      'Esta acción no se podrá revertir.',
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        await clientsService.delete(client.id);
        const newTotalPages = Math.ceil((totalRecords - 1) / RECORDS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        } else {
          await loadClients();
        }
        showSuccess('Cliente eliminado', 'El cliente ha sido eliminado');
      } catch (error) {
        showError('Error', error.message || 'No se pudo eliminar el cliente');
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const startIndex = (currentPage - 1) * RECORDS_PER_PAGE;

  if (loading && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D77] mx-auto" />
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

      <div className="bg-white rounded-xl shadow-md">
        <ClientsTable
          clients={clients}
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