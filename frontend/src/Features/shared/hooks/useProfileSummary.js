import { useCallback, useEffect, useState } from "react";
import { getProfileSummary } from "../services/profileService.js";

export default function useProfileSummary() {
  const [profileSummary, setProfileSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProfileSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const summary = await getProfileSummary();
      setProfileSummary(summary);
      return summary;
    } catch (fetchError) {
      console.error("Error cargando perfil:", fetchError);
      setError(fetchError);
      setProfileSummary(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfileSummary();
  }, [loadProfileSummary]);

  return {
    profileSummary,
    loading,
    error,
    refreshProfileSummary: loadProfileSummary,
  };
}
