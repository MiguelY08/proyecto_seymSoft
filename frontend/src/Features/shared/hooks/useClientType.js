import { useMemo } from 'react';
import { normalizeClientType } from '../utils/shopPricingHelper';
import useAuthenticatedClient from './useAuthenticatedClient';

const getUserClientType = (user) => {
  if (!user) return null;

  return (
    user.clientType ??
    user.client_type ??
    user.tipoCliente ??
    user.client?.clientType ??
    user.client?.client_type ??
    user.client?.type ??
    null
  );
};

/**
 * Obtiene el tipo de cliente desde el usuario administrado por AuthContext.
 * Los visitantes y usuarios sin tipo asociado usan precio DETAL.
 */
export const useClientType = () => {
  const {
    client,
    clientType: resolvedClientType,
    isAuthenticated,
    loading,
  } = useAuthenticatedClient();

  const clientType = useMemo(() => {
    if (!isAuthenticated) return 'DETAL';
    return normalizeClientType(resolvedClientType ?? getUserClientType(client));
  }, [client, isAuthenticated, resolvedClientType]);

  return {
    clientType,
    loading,
    isAuthenticated,
  };
};

export default useClientType;
