import { useCallback, useState } from "react";
import { getBiositeAnalytics } from "../../analytics/services/analyticsService";
import { linkService } from "../../links/services/linkService";
import { businessCardService } from "../../vcard/services/VCardService";
import type { BusinessCard, UpdateBusinessCardDto } from "../../vcard/types/V-Card";
import type { AnalyticsData, LinkData, TimeRange } from "../types/AdminData";

type ById<T> = { [key: string]: T };

/**
 * Datos que el panel carga bajo demanda para cada biosite: links, métricas y
 * tarjeta de contacto, con su estado de carga y la fila expandida.
 */
export const useBiositeDetails = () => {
  const [biositeLinks, setBiositeLinks] = useState<ById<LinkData[]>>({});
  const [loadingBiositeLinks, setLoadingBiositeLinks] = useState<ById<boolean>>({});

  const [analyticsData, setAnalyticsData] = useState<ById<AnalyticsData>>({});
  const [loadingAnalytics, setLoadingAnalytics] = useState<ById<boolean>>({});
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<TimeRange>("last7");
  const [showAnalytics, setShowAnalytics] = useState<ById<boolean>>({});

  const [businessCards, setBusinessCards] = useState<ById<BusinessCard>>({});
  const [loadingCards, setLoadingCards] = useState<ById<boolean>>({});

  const [expandedBiosite, setExpandedBiosite] = useState<string | null>(null);

  const fetchBiositeLinks = useCallback(
    async (biositeId: string) => {
      if (biositeLinks[biositeId] || loadingBiositeLinks[biositeId]) return;

      setLoadingBiositeLinks((prev) => ({ ...prev, [biositeId]: true }));
      try {
        const links: LinkData[] = await linkService.getByBiosite(biositeId);
        setBiositeLinks((prev) => ({ ...prev, [biositeId]: links }));
      } catch (error) {
        console.error(`Error fetching links for biosite ${biositeId}:`, error);
        setBiositeLinks((prev) => ({ ...prev, [biositeId]: [] }));
      } finally {
        setLoadingBiositeLinks((prev) => ({ ...prev, [biositeId]: false }));
      }
    },
    [biositeLinks, loadingBiositeLinks]
  );

  const fetchBiositeAnalytics = useCallback(
    async (biositeId: string, ownerId: string) => {
      if (analyticsData[biositeId] || loadingAnalytics[biositeId]) return;

      setLoadingAnalytics((prev) => ({ ...prev, [biositeId]: true }));
      try {
        const data = await getBiositeAnalytics(ownerId, analyticsTimeRange, biositeId);
        setAnalyticsData((prev) => ({ ...prev, [biositeId]: data }));
      } catch (error) {
        console.error(`Error fetching analytics for biosite ${biositeId}:`, error);
        setAnalyticsData((prev) => ({
          ...prev,
          [biositeId]: { views: 0, clicks: 0, dailyActivity: [], clickDetails: [] },
        }));
      } finally {
        setLoadingAnalytics((prev) => ({ ...prev, [biositeId]: false }));
      }
    },
    [analyticsData, loadingAnalytics, analyticsTimeRange]
  );

  const toggleAnalytics = useCallback(
    (biositeId: string, ownerId: string) => {
      const isCurrentlyShowing = showAnalytics[biositeId];
      setShowAnalytics((prev) => ({ ...prev, [biositeId]: !isCurrentlyShowing }));

      if (!isCurrentlyShowing && !analyticsData[biositeId]) {
        fetchBiositeAnalytics(biositeId, ownerId);
      }
    },
    [showAnalytics, analyticsData, fetchBiositeAnalytics]
  );

  const fetchBusinessCard = useCallback(
    async (ownerId: string) => {
      if (businessCards[ownerId] || loadingCards[ownerId]) return;

      setLoadingCards((prev) => ({ ...prev, [ownerId]: true }));
      try {
        const card = await businessCardService.regenerateQRCode(ownerId);
        setBusinessCards((prev) => ({ ...prev, [ownerId]: card }));
      } catch (error) {
        console.error(`Error fetching business card for user ${ownerId}:`, error);
        setBusinessCards((prev) => ({ ...prev, [ownerId]: null }));
      } finally {
        setLoadingCards((prev) => ({ ...prev, [ownerId]: false }));
      }
    },
    [businessCards, loadingCards]
  );

  const handleUpdateVCard = useCallback(async (id: string, data: UpdateBusinessCardDto) => {
    try {
      const updatedCard = await businessCardService.updateBusinessCard(id, data);
      setBusinessCards((prev) => ({ ...prev, [data.ownerId]: updatedCard }));
    } catch (error) {
      console.error("Error updating VCard:", error);
      throw error;
    }
  }, []);

  /** Expande/colapsa una fila; al expandir carga sus links y su tarjeta de contacto. */
  const toggleExpansion = useCallback(
    (biositeId: string, ownerId?: string) => {
      const wasExpanded = expandedBiosite === biositeId;
      setExpandedBiosite(wasExpanded ? null : biositeId);

      if (!wasExpanded) {
        if (ownerId) {
          fetchBusinessCard(ownerId);
        }
        fetchBiositeLinks(biositeId);
      }
    },
    [expandedBiosite, fetchBusinessCard, fetchBiositeLinks]
  );

  return {
    biositeLinks,
    loadingBiositeLinks,
    analyticsData,
    loadingAnalytics,
    analyticsTimeRange,
    showAnalytics,
    businessCards,
    loadingCards,
    expandedBiosite,
    setAnalyticsData,
    setAnalyticsTimeRange,
    setShowAnalytics,
    fetchBiositeLinks,
    fetchBiositeAnalytics,
    toggleAnalytics,
    fetchBusinessCard,
    handleUpdateVCard,
    toggleExpansion,
  };
};
