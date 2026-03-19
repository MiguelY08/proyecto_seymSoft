import { usePermissions } from "../hooks/usePermissions";

export default function Permission({ permission, children }) {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return null;
  }

  return children;
}
