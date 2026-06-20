import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../access/context/AuthContext';
import { clientsService } from '../../administrtivePanel/sales/clients/services/clientsService';

const getEmbeddedClient = (user) => {
  const client = user?.client ?? user?.customer ?? null;
  const id =
    client?.id ??
    client?.idClient ??
    user?.clientId ??
    user?.client_id ??
    user?.idClient ??
    null;

  if (id === null || id === undefined || id === '') return null;

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return null;

  return {
    ...(client || {}),
    id: numericId,
    email: client?.email ?? user?.email ?? '',
    clientType:
      client?.clientType ??
      client?.client_type ??
      user?.clientType ??
      user?.client_type ??
      user?.tipoCliente ??
      null,
  };
};

const normalizeEmail = (value) => String(value ?? '').trim().toLowerCase();

/**
 * Resuelve el cliente comercial asociado a la sesión.
 * Si /auth/me no incluye el cliente, lo busca por el correo autenticado.
 */
export const useAuthenticatedClient = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const embeddedClient = useMemo(() => getEmbeddedClient(user), [user]);
  const lookupEmail = normalizeEmail(user?.email);
  const [lookup, setLookup] = useState({
    key: null,
    client: null,
    error: null,
  });

  useEffect(() => {
    if (!isAuthenticated || embeddedClient || !lookupEmail) return undefined;

    let active = true;
    clientsService.getAll({ page: 1, limit: 20, search: lookupEmail })
      .then((response) => {
        if (!active) return;
        const clients = response?.data ?? [];
        const exactClient =
          clients.find((client) => normalizeEmail(client.email) === lookupEmail) ??
          (clients.length === 1 ? clients[0] : null);

        setLookup({
          key: lookupEmail,
          client: exactClient,
          error: exactClient ? null : 'No se encontró un cliente asociado al correo de la sesión.',
        });
      })
      .catch((error) => {
        if (!active) return;
        setLookup({
          key: lookupEmail,
          client: null,
          error:
            error?.response?.data?.message ??
            error?.message ??
            'No fue posible consultar el perfil del cliente.',
        });
      });

    return () => {
      active = false;
    };
  }, [embeddedClient, isAuthenticated, lookupEmail]);

  const lookupPending =
    isAuthenticated &&
    !embeddedClient &&
    Boolean(lookupEmail) &&
    lookup.key !== lookupEmail;
  const client = embeddedClient ?? (lookup.key === lookupEmail ? lookup.client : null);

  return {
    client,
    clientId: client?.id ?? null,
    clientType: client?.clientType ?? null,
    loading: authLoading || lookupPending,
    error: lookup.key === lookupEmail ? lookup.error : null,
    isAuthenticated,
  };
};

export default useAuthenticatedClient;
