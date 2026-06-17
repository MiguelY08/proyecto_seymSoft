import { useState, useEffect } from 'react';
import ClientsToolbar    from '../components/ClientsToolbar';
import ClientsTable      from '../components/ClientsTable';
import PaginationAdmin   from '../../../../shared/PaginationAdmin';
import FormClient        from '../modals/FormClient';
import InfoClient        from '../modals/InfoClient';
import { useAlert }      from '../../../../shared/alerts/useAlert';
import { clientsService } from '../services/clientsService';
import Permission from "../../../configuration/roles/components/Permission";
import Spinner from '../../../../shared/spinner';
import { downloadClientsExcel } from '../helpers/excelHelper';


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

    if (client.active) {
      const result = await showConfirm(
        'warning',
        'Cambiar estado',
        `¿Está seguro de cambiar el estado del cliente "${client.fullName}" a ${newStatus}?`,
        { confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar' }
      );

      if (!result?.isConfirmed) return;
    }

    try {
      await clientsService.toggleActive(id);
      await loadClients();
      showSuccess('Estado cambiado', `El cliente ahora está ${newStatus}`);
    } catch (error) {
      showError('Error', error.message || 'No se pudo cambiar el estado');
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

  const handleExportClients = async () => {
    const result = await clientsService.getAll({
      page: 1,
      limit: totalRecords || RECORDS_PER_PAGE,
      search: searchTerm,
    });

    return downloadClientsExcel(result.data);
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
    'Esta acción no se podrá revertir. Los créditos y pedidos se transferirán al cliente de sistema.',
    { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
  );

  if (result.isConfirmed) {
    try {
      await clientsService.delete(client.id);
      await loadClients();
      showSuccess('Cliente eliminado', 'El cliente ha sido eliminado');
    } catch (error) {
      // 🔥 Obtener el mensaje desde error.response.data
      const errorMessage = error.response?.data?.message || error.message || '';
      const errorCode = error.response?.data?.errorCode || '';
      
      console.log('📛 errorMessage:', errorMessage);
      console.log('📛 errorCode:', errorCode);
      
      // Verificar por errorCode específico
      if (errorCode === 'CLIENT_HAS_SALES') {
        showError(
          'NO SE PUEDE ELIMINAR',
          'ESTE CLIENTE TIENE VENTAS ASOCIADAS. HISTÓRICAMENTE NO SE PUEDEN BORRAR CLIENTES CON TRANSACCIONES.'
        );
      } 
      // Verificar por mensaje
      else if (errorMessage.includes('ventas asociadas')) {
        showError(
          'NO SE PUEDE ELIMINAR',
          'ESTE CLIENTE TIENE VENTAS ASOCIADAS. HISTÓRICAMENTE NO SE PUEDEN BORRAR CLIENTES CON TRANSACCIONES.'
        );
      } 
      else if (errorMessage.includes('registros relacionados')) {
        showError(
          'NO SE PUEDE ELIMINAR', 
          'ESTE CLIENTE TIENE VENTAS, CRÉDITOS O ACCESOS ASOCIADOS. NO SE PUEDE ELIMINAR POR INTEGRIDAD DE DATOS.'
        );
      } 
      else {
        showError('Error', errorMessage || 'No se pudo eliminar el cliente');
      }
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
      <Spinner message="Cargando clientes..." />
    );
  }

  return (
    <Permission permission="clientes.ver">
      <div className="h-full flex flex-col gap-4 p-3 sm:p-4">
        <ClientsToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onNewClick={handleNewClient}
          onExport={handleExportClients}
          totalClients={totalRecords}
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
    </Permission>
  );
}

export default ClientsPage;