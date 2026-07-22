import { BellOff } from "lucide-react";

function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
      <BellOff className="mb-2 h-8 w-8 text-slate-300" strokeWidth={1.7} />
      <p className="text-sm font-medium text-slate-600">
        No tienes notificaciones
      </p>
    </div>
  );
}

export default NotificationEmpty;

