const isTechnicalAxiosMessage = (message = '') =>
  /^request failed with status code \d+$/i.test(String(message).trim());

export function getApiErrorMessage(error, { conflictMessage, notFoundMessage, fallback } = {}) {
  const status = error?.response?.status;

  if (status === 409 && conflictMessage) return conflictMessage;
  if (status === 404 && notFoundMessage) return notFoundMessage;

  const backendMessage =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.userMessage;

  if (typeof backendMessage === 'string' && backendMessage.trim()) {
    return backendMessage.trim();
  }

  if (error?.message && !isTechnicalAxiosMessage(error.message)) {
    return error.message;
  }

  return fallback || 'No fue posible completar la operación. Intenta nuevamente.';
}
