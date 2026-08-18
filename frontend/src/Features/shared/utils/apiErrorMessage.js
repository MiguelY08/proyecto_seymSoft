const isTechnicalAxiosMessage = (message = '') =>
  /^request failed with status code \d+$/i.test(String(message).trim());

export function getApiErrorMessage(error, { conflictMessage, fallback } = {}) {
  const status = error?.response?.status;

  if (status === 409 && conflictMessage) return conflictMessage;

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
