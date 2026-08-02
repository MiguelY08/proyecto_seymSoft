import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useAlert } from "../../shared/alerts/useAlert.js";
import { clearSession } from "../helpers/authStorage.js";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "click",
  "keydown",
  "scroll",
  "touchstart",
];

export default function SessionTimeout() {
  const navigate = useNavigate();
  const { isAuthenticated, clearLocalSession } = useAuth();
  const { showWarning } = useAlert();

  const timeoutRef = useRef(null);
  const expiredRef = useRef(false);

  const clearSessionAndRedirect = useCallback(() => {
    if (expiredRef.current) return;

    expiredRef.current = true;

    clearSession();
    sessionStorage.clear();
    clearLocalSession();

    showWarning("Sesión expirada", "Tu sesión ha cerrado por inactividad.");
    navigate("/login", { replace: true });
  }, [clearLocalSession, navigate, showWarning]);

  const resetTimer = useCallback(() => {
    if (!isAuthenticated) return;

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      clearSessionAndRedirect();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearSessionAndRedirect, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      expiredRef.current = false;

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      return undefined;
    }

    expiredRef.current = false;
    resetTimer();

    const handleActivity = () => resetTimer();

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      ACTIVITY_EVENTS.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [isAuthenticated, resetTimer]);

  return null;
}
