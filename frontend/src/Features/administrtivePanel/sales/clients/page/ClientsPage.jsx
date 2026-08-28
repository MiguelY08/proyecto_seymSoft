import { useState, useEffect, useCallback } from 'react';
import ClientsToolbar    from '../components/ClientsToolbar';
import ClientsTable      from '../components/ClientsTable';
import PaginationAdmin   from '../../../../shared/PaginationAdmin';
import FormClient        from '../modals/FormClient';
import InfoClient        from '../modals/InfoClient';
import { useAlert }      from '../../../../shared/alerts/useAlert';
import { clientsService } from '../services/clientsService';
import { UserService } from '../../../users/services/userService';
import Permission from "../../../configuration/roles/components/Permission";
import Spinner from '../../../../shared/spinner';


const RECORDS_PER_PAGE = 11;
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

const buildClientUserPayload = (formData) => {
  const isJuridica = String(formData?.personType || '').toLowerCase() === 'juridica';
  const fullName = isJuridica
    ? String(formData?.firstName || '').trim()
    : `${String(formData?.firstName || '').trim()} ${String(formData?.lastName || '').trim()}`
        .replace(/\s+/g, ' ')
        .trim();

  return {
    name: fullName,
    email: String(formData?.email || '').trim(),
    phone: String(formData?.phone || '').trim() || null,
    roleId: null,
  };
};

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

const sortClientsWithSystemFirst = (clients) =>
  [...clients].sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    if (a.id === 999999999 && b.id !== 999999999) return -1;
    if (a.id !== 999999999 && b.id === 999999999) return 1;
    return Number(a.id || 0) - Number(b.id || 0);
  });

const toMoneyNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;
  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(toMoneyNumber(value));

const normalizeTextValue = (value) =>
  String(value ?? '').trim().toLowerCase();

const getClientTypeValue = (client) =>
  client?.clientType ?? client?.typeClient ?? client?.tipoCliente ?? '';

const buildClientChangeAlert = (previousClient, nextData) => {
  if (!previousClient) return null;

  const changes = [];
  const previousType = normalizeTextValue(getClientTypeValue(previousClient));
  const nextType = normalizeTextValue(nextData.clientType ?? nextData.typeClient ?? nextData.tipoCliente ?? previousType);

  if (previousType && nextType && previousType !== nextType) {
    changes.push(`Tipo de cliente: ${getClientTypeValue(previousClient)} -> ${nextData.clientType ?? nextData.typeClient ?? nextData.tipoCliente}`);
  }

  const previousCredit = toMoneyNumber(previousClient.clientCredit ?? previousClient.credit);
  const nextCredit = toMoneyNumber(nextData.clientCredit ?? previousClient.clientCredit ?? previousClient.credit);
  if (previousCredit !== nextCredit) {
    changes.push(`Crédito: ${formatMoney(previousCredit)} -> ${formatMoney(nextCredit)}`);
  }

  const previousBalance = toMoneyNumber(previousClient.credit_balance ?? previousClient.creditBalance);
  const nextBalance = toMoneyNumber(nextData.credit_balance ?? nextData.creditBalance ?? previousClient.credit_balance ?? previousClient.creditBalance);
  if (previousBalance !== nextBalance) {
    changes.push(`Saldo a favor: ${formatMoney(previousBalance)} -> ${formatMoney(nextBalance)}`);
  }

  if (changes.length === 0) return null;
  return `Vas a guardar cambios comerciales sensibles para "${previousClient.fullName}".\n\n${changes.join('\n')}`;
};

const getClientSaveError = (error) => {
  const response = error?.response?.data || {};
  const errorCode = response.errorCode || '';
  const message = response.message || error?.message || '';

  const messagesByCode = {
    CLIENT_HAS_OVERDUE_CREDITS: {
      title: 'No se puede aumentar el crédito',
      text: 'El cliente tiene créditos vencidos. Regulariza su situación antes de aumentar el cupo.',
    },
    CLIENT_HAS_PENDING_CREDITS: {
      title: 'No se puede aumentar el crédito',
      text: 'El cliente tiene créditos pendientes. Regulariza su situación antes de aumentar el cupo.',
    },
    CLIENT_CREDIT_BELOW_USED: {
      title: 'Crédito insuficiente',
      text: message || 'No puedes bajar el crédito por debajo del monto ocupado actualmente.',
    },
    CLIENT_CREDIT_NEGATIVE: {
      title: 'Crédito inválido',
      text: 'El crédito del cliente no puede ser negativo.',
    },
    CREDIT_BALANCE_NEGATIVE: {
      title: 'Saldo a favor inválido',
      text: 'El saldo a favor no puede ser negativo.',
    },
  };

  if (messagesByCode[errorCode]) return messagesByCode[errorCode];
  if (message.toUpperCase().includes('NO SE PUEDE AUMENTAR')) {
    return messagesByCode.CLIENT_HAS_PENDING_CREDITS;
  }

  return {
    title: 'No se pudo guardar el cliente',
    text: message || 'Revisa los datos e inténtalo nuevamente.',
  };
};

function ClientsPage() {
  const [clients,         setClients]         = useState([]);
  const [searchTerm,      setSearchTerm]      = useState('');
  const [statusFilter,    setStatusFilter]    = useState('');
  const [currentPage,     setCurrentPage]     = useState(1);
  const [totalRecords,    setTotalRecords]    = useState(0);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedClient,  setSelectedClient]  = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [deletingId,      setDeletingId]      = useState(null);
  const debouncedSearchTerm = useDebouncedValue(searchTerm);

  const { showConfirm, showSuccess, showError } = useAlert();



  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const hasSearch = debouncedSearchTerm.trim() !== '' || statusFilter !== '';
      const result = await clientsService.getAll({
        page: 1,
        limit: SEARCH_FETCH_LIMIT,
        search: ''
      });

      const filtered = sortClientsWithSystemFirst(result.data)
        .filter((client) => {
          if (hasSearch && !clientMatchesSearch(client, debouncedSearchTerm)) return false;
          if (statusFilter === 'activo') return client.active === true;
          if (statusFilter === 'inactivo') return client.active === false;
          return true;
        });

      const start = (currentPage - 1) * RECORDS_PER_PAGE;
      setClients(filtered.slice(start, start + RECORDS_PER_PAGE));
      setTotalRecords(filtered.length);
    } catch (error) {
      showError('Error', error.message || 'No se pudieron cargar los clientes');
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, showError]);

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

const handleSave = async (formData) => {
    try {
      if (selectedClient) {
        const sensitiveChanges = buildClientChangeAlert(selectedClient, formData);
        if (sensitiveChanges) {
          const result = await showConfirm(
            'warning',
            'Confirmar cambios del cliente',
            sensitiveChanges,
            { confirmButtonText: 'Sí, guardar cambios', cancelButtonText: 'Revisar' }
          );
          if (!result?.isConfirmed) return;
        }

        await clientsService.update(selectedClient.id, formData);
        await loadClients();
        showSuccess('Cliente actualizado', 'Los datos se actualizaron correctamente');
      } else {
        let createdUserId = formData?.userId ?? null;

        if (!createdUserId) {
          const createdUser = await UserService.create(buildClientUserPayload(formData));
          createdUserId = createdUser?.id ?? null;
        }

        if (!createdUserId) {
          throw new Error('No fue posible asociar el usuario del cliente');
        }

        try {
          await clientsService.create({
            ...formData,
            userId: createdUserId,
          });
        } catch (clientError) {
          if (!formData?.userId && createdUserId) {
            try {
              await UserService.delete(createdUserId);
            } catch {
              // rollback de mejor esfuerzo
            }
          }
          throw clientError;
        }

        await loadClients();
        showSuccess('Cliente creado', 'El nuevo cliente se creó exitosamente');
      }
    } catch (error) {
      const alertData = getClientSaveError(error);
      showError(alertData.title, alertData.text);
      throw error;
    }
};

const handleDelete = async (client) => {
  const result = await showConfirm(
    'warning',
    'Eliminar cliente',
    `¿Está seguro de eliminar el cliente "${client.fullName}"? Esta acción no se puede deshacer.`,
    { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar' }
  );

    if (result.isConfirmed) {
      try {
        setDeletingId(client.id);
        await clientsService.delete(client.id);
      await loadClients();
      showSuccess('Cliente eliminado', 'El cliente ha sido eliminado');
      } catch (error) {
      // ðŸ”¥ Obtener el mensaje desde error.response.data
      const errorMessage = error.response?.data?.message || error.message || '';
      const errorCode = error.response?.data?.errorCode || '';

      // Verificar por errorCode específico
      if (errorCode === 'CLIENT_HAS_SALES') {
        showError(
          'No se puede eliminar',
          'Este cliente tiene ventas asociadas. Históricamente no se pueden borrar clientes con transacciones.'
        );
      } 
      // Verificar por mensaje
      else if (errorMessage.includes('ventas asociadas')) {
        showError(
          'No se puede eliminar',
          'Este cliente tiene ventas asociadas. Históricamente no se pueden borrar clientes con transacciones.'
        );
      } 
      else if (errorMessage.includes('registros relacionados')) {
        showError(
          'No se puede eliminar', 
          'Este cliente tiene ventas, créditos o accesos asociados. No se puede eliminar por integridad de datos.'
        );
      } 
      else {
        showError('Error', errorMessage || 'No se pudo eliminar el cliente');
      }
      } finally {
        setDeletingId(null);
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

  if (loading && clients.length === 0) {
    return (
      <Spinner message="Cargando clientes..." />
    );
  }

  return (
    <Permission permission="clientes.ver">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col gap-3 overflow-x-hidden overflow-y-auto p-2.5 sm:p-3.5">
        <ClientsToolbar
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          statusFilter={statusFilter}
          onStatusChange={handleStatusChange}
          onNewClick={handleNewClient}
        />

        <div className="w-full min-w-0 shrink-0 overflow-hidden rounded-xl bg-white shadow-md">
          <ClientsTable
            clients={clients}
            startIndex={startIndex}
            searchTerm={searchTerm}
            totalData={totalRecords}
            onInfo={handleInfo}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>

        {totalRecords > 0 && (
          <div className="shrink-0">
            <PaginationAdmin
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              totalRecords={totalRecords}
              recordsPerPage={RECORDS_PER_PAGE}
            />
          </div>
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
