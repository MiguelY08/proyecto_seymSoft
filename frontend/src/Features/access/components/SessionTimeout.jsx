import { useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// 15 minutos en milisegundos
const INACTIVITY_LIMIT_MS = 15 * 60 * 1000;

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "touchstart",
];

/**
 * SessionTimeout
 *
 * Cierra la sesión por inactividad del usuario, de forma
 * INDEPENDIENTE al ciclo de vida del JWT. Debe montarse UNA
 * SOLA VEZ en App.jsx para funcionar en toda la aplicación.
 */
function SessionTimeout() {
  const timeoutRef = useRef(null);
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleInactivityLogout = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    await logout();
    navigate("/login?error=session_timeout", { replace: true });
  }, [logout, navigate]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isAuthenticated) return;

    timeoutRef.current = setTimeout(handleInactivityLogout, INACTIVITY_LIMIT_MS);
  }, [isAuthenticated, handleInactivityLogout]);

  useEffect(() => {
    resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, resetTimer, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, resetTimer);
      });
    };
  }, [resetTimer]);

  return null;
}

export default SessionTimeout;