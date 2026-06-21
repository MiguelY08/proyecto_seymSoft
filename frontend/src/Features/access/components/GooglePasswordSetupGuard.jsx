import { useAuth } from "../context/AuthContext.jsx";
import GooglePasswordSetupModal from "./GooglePasswordSetupModal.jsx";

export default function GooglePasswordSetupGuard() {

  const {
    isAuthenticated,
    requiresPasswordSetup
  } = useAuth();

  if (
    !isAuthenticated ||
    !requiresPasswordSetup
  ) {
    return null;
  }

  return (
    <GooglePasswordSetupModal />
  );
}