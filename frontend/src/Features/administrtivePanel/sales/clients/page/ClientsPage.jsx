import { useState, useEffect } from 'react';
import ClientsToolbar    from '../components/ClientsToolbar';
import ClientsTable      from '../components/ClientsTable';
import PaginationAdmin   from '../../../../shared/PaginationAdmin';
import FormClient        from '../modals/FormClient';
import InfoClient        from '../modals/InfoClient';
import { useAlert }      from '../../../../shared/alerts/useAlert';
import { clientsService }            from '../services/clientsService';
import { filterClients, paginateData } from '../helpers/clientHelpers';

const RECORDS_PER_PAGE = 13;

function ClientsPage() {
  const [clients,         setClients]         = useState([]);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient,  setSelectedClient]  = useState(null);
  const [loading,         setLoading]         = useState(true);

  const { showConfirm, showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    try {
      setClients(clientsService.getAll());
    } catch {
      showError('Error', 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  };

  // Toggles active state with user confirmation
  const handleToggleActive = async (id) => {
    const client    = clients.find(c => c.id === id);
    if (client?.isSystem) {
      showWarning('Acción no permitida', 'El Cliente de Caja no puede modificarse.');
      return;
    }
    const newStatus = client.active ? 'Inactivo' : 'Activo';

    const result = await showConfirm(
      'warning',
      'Cambiar estado',
      `¿Está seguro de cambiar el estado del cliente "${client.fullName}" a ${newStatus}?`,
      { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        const updated = clientsService.toggleActive(id);
        if (updated) {
          setClients(prev => prev.map(c => c.id === id ? updated : c));
          showSuccess('Estado cambiado', `El cliente ahora está ${newStatus}`);
        }
      } catch {
        showError('Error', 'No se pudo cambiar el estado del cliente');
      }
    }
  };

  const handleEdit = (client) => {
    if (client?.isSystem) {
      showWarning('Acción no permitida', 'El Cliente de Caja no puede modificarse.');
      return;
    }
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
        const updated = clientsService.update(selectedClient.id, formData);
        if (updated) {
          setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
          showSuccess('Cliente actualizado', 'Los datos del cliente se actualizaron correctamente');
        }
      } else {
        const newClient = clientsService.create(formData);
        setClients(prev => [...prev, newClient]);
        showSuccess('Cliente creado', 'El nuevo cliente se creó exitosamente');
      }
      setIsFormModalOpen(false);
    } catch {
      showError('Error', 'No se pudo guardar el cliente');
    }
  };

  // Deletes client after confirmation and adjusts pagination if needed
  const handleDelete = async (client) => {
    if (client?.isSystem) {
      showWarning('Acción no permitida', 'El Cliente de Caja no puede eliminarse.');
      return;
    }

    

    // Verificar ventas asociadas desde localStorage
    const ventas = (() => {
      try {
        const stored = localStorage.getItem('pm_sales');
        return stored ? JSON.parse(stored) : [];
      } catch { return []; }
    })();

    const ventasAsociadas = ventas.filter(
      v => String(v.clienteId) === String(client.id)
    );

    const tieneVentas = ventasAsociadas.length > 0;

    // Todos los clientes son isClient: true → siempre se reasigna al Cliente de Caja
    const clienteNote = ' Sus créditos y pagos quedarán registrados bajo el Cliente de Caja.';

    const subtitulo = tieneVentas
      ? `Este cliente aparece en ${ventasAsociadas.length} venta(s) registrada(s). Al eliminarlo, esas ventas mostrarán "Usuario eliminado".${clienteNote} Esta acción no se podrá revertir.`
      : `No se podrá revertir la acción.${clienteNote}`;

    const result = await showConfirm(
      'warning',
      `¿Eliminar a "${client.fullName}"?`,
      subtitulo,
      { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
    );

    if (result.isConfirmed) {
      try {
        clientsService.delete(client.id);
        const remaining     = clients.filter(c => c.id !== client.id);
        setClients(remaining);

        const filtered      = filterClients(remaining, searchTerm);
        const newTotalPages = Math.ceil(filtered.length / RECORDS_PER_PAGE);
        if (currentPage > newTotalPages && newTotalPages > 0) setCurrentPage(newTotalPages);

        showSuccess('Cliente eliminado', 'El cliente ha sido eliminado exitosamente.');
      } catch {
        showError('Error', 'No se pudo eliminar el cliente');
      }
    }
  };

  const handleSearchChange = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const filteredClients                       = filterClients(clients, searchTerm);
  const { currentData } = paginateData(
    filteredClients,
    currentPage,
    RECORDS_PER_PAGE
  );

  if (loading) {
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
          clients={currentData}
          searchTerm={searchTerm}
          onInfo={handleInfo}
          onEdit={handleEdit}
          onToggleActive={handleToggleActive}
          onDelete={handleDelete}
        />
      </div>

      {filteredClients.length > 0 && (
        <PaginationAdmin
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          totalRecords={filteredClients.length}
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