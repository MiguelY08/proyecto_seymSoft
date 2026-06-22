const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const TRACKS = {
  reemplazo: [
    { key: 'registered', label: 'Solicitud registrada' },
    { key: 'shipping', label: 'Pendiente de envío' },
    { key: 'replacement', label: 'Reemplazo en preparación' },
    { key: 'ready', label: 'Producto listo' },
  ],
  reembolso: [
    { key: 'registered', label: 'Solicitud registrada' },
    { key: 'shipping', label: 'Pendiente de envío' },
    { key: 'refund', label: 'Reembolso en proceso' },
    { key: 'ready', label: 'Reembolso listo' },
  ],
  'saldo a favor': [
    { key: 'registered', label: 'Solicitud registrada' },
    { key: 'shipping', label: 'Pendiente de envío' },
    { key: 'credit', label: 'Saldo a favor aplicado' },
  ],
};

const statusIndex = (method, status, creditApplied) => {
  const normalizedMethod = normalize(method);
  const normalizedStatus = normalize(status);

  if (normalizedStatus.includes('anulad')) return -1;
  if (normalizedStatus === 'listo' || normalizedStatus === 'procesada' || creditApplied) {
    const steps = TRACKS[normalizedMethod];
    return steps ? steps.length - 1 : 2;
  }
  if (normalizedStatus.includes('reemplazo')) return 2;
  if (normalizedStatus.includes('reembolso')) return 2;
  if (normalizedStatus.includes('envio')) return 1;
  return 0;
};

export const buildProductTracking = (detail) => {
  const method = normalize(detail.method);
  const baseSteps = TRACKS[method] ?? [
    { key: 'registered', label: 'Solicitud registrada' },
    { key: 'processing', label: 'En proceso' },
    { key: 'ready', label: 'Listo' },
  ];
  const cancelled = normalize(detail.status).includes('anulad');
  const currentIndex = statusIndex(detail.method, detail.status, detail.creditApplied);

  return {
    cancelled,
    progress: cancelled
      ? 0
      : Math.round(((currentIndex + 1) / baseSteps.length) * 100),
    steps: baseSteps.map((step, index) => ({
      ...step,
      state: cancelled
        ? 'cancelled'
        : index < currentIndex
          ? 'completed'
          : index === currentIndex
            ? 'active'
            : 'pending',
    })),
  };
};

export const getReturnSignature = (saleReturn) =>
  JSON.stringify({
    status: saleReturn.status,
    updatedAt: saleReturn.updatedAt,
    cancellationReason: saleReturn.cancellationReason,
    details: (saleReturn.details ?? []).map((detail) => ({
      id: detail.id,
      status: detail.status,
      creditApplied: detail.creditApplied,
    })),
  });

export const getStatusClasses = (status) => {
  const normalized = normalize(status);
  if (normalized.includes('anulad')) return 'bg-red-100 text-red-700';
  if (normalized.includes('proces') || normalized === 'listo') {
    return 'bg-emerald-100 text-emerald-700';
  }
  return 'bg-amber-100 text-amber-700';
};

export const formatReturnDate = (value) => {
  if (!value) return 'Fecha no disponible';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Fecha no disponible';
  return new Intl.DateTimeFormat('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
