const FAVOR_BALANCE_KEYS = [
  'credit_balance',
  'creditBalance',
  'clientCreditBalance',
  'favorBalance',
  'saldoFavor',
  'saldo_a_favor',
];

const toMoneyNumber = (value) => {
  if (value === null || value === undefined || value === '') return 0;

  const cleaned = String(value).replace(/[^\d.-]/g, '');
  const number = Number(cleaned);

  return Number.isFinite(number) ? number : 0;
};

export const getClientFavorBalanceValue = (client = {}) => {
  const key = FAVOR_BALANCE_KEYS.find(
    (field) => client?.[field] !== null && client?.[field] !== undefined && client?.[field] !== '',
  );

  return toMoneyNumber(key ? client[key] : 0);
};

export const getClientFavorBalanceFromSources = (...sources) => {
  const values = sources
    .filter(Boolean)
    .map(getClientFavorBalanceValue);

  return values.find((value) => value > 0) ?? values[0] ?? 0;
};
