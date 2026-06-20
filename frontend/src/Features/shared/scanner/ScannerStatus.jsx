import { AlertCircle, CheckCircle, ScanBarcode } from 'lucide-react';

const STATUS_STYLES = {
  success: {
    icon: CheckCircle,
    className: 'border-green-200 bg-green-50 text-green-700',
  },
  error: {
    icon: AlertCircle,
    className: 'border-red-200 bg-red-50 text-red-700',
  },
  info: {
    icon: ScanBarcode,
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
};

function ScannerStatus({ status, className = '' }) {
  if (!status) return null;

  const message = typeof status === 'string' ? status : status.message;
  const type = typeof status === 'string' ? 'info' : status.type;
  const style = STATUS_STYLES[type] ?? STATUS_STYLES.info;
  const Icon = style.icon;

  if (!message) return null;

  return (
    <div
      className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${style.className} ${className}`}
      aria-live="polite"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
      <span className="min-w-0 truncate">{message}</span>
    </div>
  );
}

export default ScannerStatus;
