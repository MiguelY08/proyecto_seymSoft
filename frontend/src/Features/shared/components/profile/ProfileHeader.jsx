import { Mail, UserCircle2 } from "lucide-react";

const getInitials = (name) => {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
};

export default function ProfileHeader({
  fullName,
  email,
  role,
  status,
  avatarUrl,
}) {
  const initials = getInitials(fullName);

  return (
    <div className="rounded-lg border border-gray-100 bg-white px-5 py-5 shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#004D77]/10 text-[#004D77]">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold">
                {initials || <UserCircle2 size={30} />}
              </span>
            )}
          </div>

          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-gray-800">
              {fullName || "Usuario SeymSoft"}
            </p>
            <div className="mt-1 flex min-w-0 items-center gap-2 text-sm text-gray-500">
              <Mail className="h-4 w-4 shrink-0" />
              <span className="truncate">{email || "Sin correo registrado"}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[#e2edf5] bg-[#f8fafc] px-3 py-1 text-xs font-semibold text-[#004D77]">
            {role || "Cliente"}
          </span>
          {status && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
