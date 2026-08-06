import { clientsService } from '../../clients/services/clientsService';
import { getClientFavorBalanceValue } from '../utils/clientFavorBalance';

const hasClientId = (clientId) =>
  clientId !== null &&
  clientId !== undefined &&
  clientId !== '';

export const getClientFavorBalance = async (clientId) => {
  if (!hasClientId(clientId)) return 0;

  const customer = await clientsService.getById(clientId);

  return getClientFavorBalanceValue(customer);
};
