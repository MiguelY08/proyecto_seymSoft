import { useAuth } from '../../access/context/AuthContext';

/**
 * Expone el cliente comercial resuelto por Auth mediante users.id_user.
 * AuthContext es la única fuente de verdad; este hook no consulta /clients.
 */
export const useAuthenticatedClient = () => {
  const { client, isAuthenticated, loading } = useAuth();

  return {
    client,
    clientId: client?.idClient ?? client?.id_client ?? client?.id ?? null,
    clientType: client?.clientType ?? null,
    loading,
    error: null,
    isAuthenticated,
  };
};

export default useAuthenticatedClient;
