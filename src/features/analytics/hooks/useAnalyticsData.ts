import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { getBiositeAnalytics } from "../services/analyticsService";
import analyticsEventManager from "../services/AnalyticsEventManager";
import type { AnalyticsData, TimeRange } from "../types/Analytics";

/** userId de la cookie o, si falta, del payload del access token. */
const getSessionUserId = (): string => {
  const token = Cookies.get("accessToken");
  if (!token) {
    throw new Error("No access token found");
  }

  const userId = Cookies.get("userId");
  if (userId) return userId;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.id) return payload.id;
  } catch (decodeError) {
    console.error("❌ Error decoding token:", decodeError);
  }
  throw new Error("Could not get userId");
};

/**
 * Métricas del biosite en sesión. Se recargan al cambiar el rango, al pedirlo
 * el usuario o cuando se registra una visita / click nuevo.
 */
export const useAnalyticsData = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biositeId] = useState<string | null>(() => Cookies.get("biositeId") ?? null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<TimeRange>("last7");

  const triggerRefresh = useCallback(() => {
    setLastRefresh(new Date());
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 1000);
  }, []);

  const changeTimeRange = useCallback((newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setLoading(true);
    setTimeout(() => {
      setRefreshTrigger((prev) => prev + 1);
    }, 100);
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    triggerRefresh();
  }, [triggerRefresh]);

  useEffect(() => {
    const unsubscribeVisit = analyticsEventManager.onVisitTracked(triggerRefresh);
    const unsubscribeClick = analyticsEventManager.onLinkClickTracked(triggerRefresh);

    return () => {
      unsubscribeVisit();
      unsubscribeClick();
    };
  }, [triggerRefresh]);

  useEffect(() => {
    if (!biositeId) return;

    let cancelled = false;
    setError(null);

    Promise.resolve()
      .then(() => getBiositeAnalytics(getSessionUserId(), timeRange, biositeId))
      .then((data) => {
        if (!cancelled) setAnalyticsData(data);
      })
      .catch((err) => {
        console.error("❌ Error fetching analytics data:", err);
        if (!cancelled) setError(err instanceof Error ? err.message : "Unknown error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [biositeId, timeRange, refreshTrigger, lastRefresh]);

  return {
    analyticsData,
    loading,
    error,
    biositeId,
    timeRange,
    changeTimeRange,
    refresh,
    refreshTrigger,
    lastRefresh,
  };
};
