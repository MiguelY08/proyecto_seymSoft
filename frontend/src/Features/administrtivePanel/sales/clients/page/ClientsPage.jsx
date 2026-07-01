import { useState, useEffect, useCallback } from 'react';
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
const CREDIT_EVENTS_SEEN_KEY = 'clients_seen_credit_balance_events';
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

const clientMatchesSearch = (client, searchTerm) => {
  const term = normalizeSearch(searchTerm).trim();
  if (!term) return true;

  if (['activo', 'activos'].includes(term)) return client.active === true;
  if (['inactivo', 'inactivos'].includes(term)) return client.active === false;

  const statusText = client.active ? 'Activo' : 'Inactivo';
  const searchable = [
    ...flattenSearchValues(client),
    statusText,
    client.status,
    client.fullName,
    `${client.firstName || ''} ${client.lastName || ''}`,
  ];

  return searchable.some((value) => normalizeSearch(value).includes(term));
};

function ClientsPage() {
  const [clients,         setClients]         = useState([]);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalRecords,    setTotalRecords]    = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient,  setSelectedClient]  = useState(null);
  const [loading,         setLoading]         = useState(true);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const { showConfirm, showSuccess, showError, showWarning } = useAlert();

  useEffect(() => {
    const notifyCreditEvents = async () => {
      try {
        const events = await clientsService.getCreditBalanceEvents({ limit: 20 });
        const seen = new Set(JSON.parse(localStorage.getItem(CREDIT_EVENTS_SEEN_KEY) || '[]'));
        const unseen = events.filter((event) => !seen.has(event.id));
        if (unseen.length === 0) return;

        localStorage.setItem(
          CREDIT_EVENTS_SEEN_KEY,
          JSON.stringify([...seen, ...unseen.map((event) => event.id)].slice(-200))
        );

        const latest = unseen[0];
        const action = latest.type === 'REVERSAL' ? 'revertido' : 'aplicado';
        const value = new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          maximumFractionDigits: 0
        }).format(latest.amount || 0);

        showWarning(
          `Saldo a favor ${action}`,
          `${latest.clientName}: ${value}. ${latest.reason}. Devolución ${latest.returnNumber}, producto ${latest.productName}. Procesado por: ${latest.processedBy || 'Sistema'}.`
        );
      } catch {
        return;
      }
    };

    notifyCreditEvents();
  }, [showWarning]);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const hasSearch = debouncedSearchTerm.trim() !== '';
      const result = await clientsService.getAll({
        page: hasSearch ? 1 : currentPage,
        limit: hasSearch ? SEARCH_FETCH_LIMIT : RECORDS_PER_PAGE,
        search: ''
      });

      if (hasSearch) {
        const filtered = result.data.filter((client) => clientMatchesSearch(client, debouncedSearchTerm));
        const start = (currentPage - 1) * RECORDS_PER_PAGE;
        setClients(filtered.slice(start, start + RECORDS_PER_PAGE));
        setTotalRecords(filtered.length);
      } else {
        setClients(result.data);
        setTotalRecords(result.pagination.total);
      }
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, showError]);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

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
      // 🔥 Obtener el mensaje desde error.response.data
      const errorMessage = error?.response?.data?.message || error.message || '';
      const errorCode = error?.response?.data?.errorCode || '';

      // ✅ ALERTA PARA CRÉDITO VENCIDO
      if (errorCode === 'CLIENT_HAS_OVERDUE_CREDITS' || 
          errorCode === 'CLIENT_HAS_OVERDUE_INVOICES' ||
          errorMessage.includes('NO SE PUEDE AUMENTAR EL CRÉDITO')) {
        showError(
          'NO SE PUEDE AUMENTAR EL CRÉDITO',
          'EL CLIENTE TIENE CRÉDITOS O FACTURAS VENCIDAS. REGULARICE SU SITUACIÓN ANTES DE AUMENTAR EL CUPO.'
        );
      } 
      else if (errorMessage.includes('registros relacionados') || errorMessage.includes('ventas asociadas')) {
        showError(
          'NO SE PUEDE ELIMINAR', 
          'ESTE CLIENTE TIENE VENTAS, CRÉDITOS O ACCESOS ASOCIADOS. NO SE PUEDE ELIMINAR POR INTEGRIDAD DE DATOS.'
        );
      } 
      else {
        showError('Error', errorMessage || 'No se pudo guardar el cliente');
      }
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
