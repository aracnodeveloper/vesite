// src/hooks/useAnalytics.ts
import { useEffect, useState } from "react";
import apiService from "../service/apiService";
import type {AnalyticsData} from "../interfaces/Analytics.ts";
import { metricsApi } from "../constants/EndpointsRoutes.ts";
import Cookies from "js-cookie";


export const useAnalytics = () => {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const biositeId = Cookies.get("biositeId");

    const fetchMetrics = async () => {
        try {
            if (!biositeId) return;
            const response = await apiService.getById<AnalyticsData>(
                metricsApi,
                biositeId
            );
            setData(response);
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
    }, [biositeId]);

    const ctr =
        data?.views && data.views > 0
            ? Math.round((data.clicks / data.views) * 100)
            : 0;

    return { data, loading, ctr, refetch: fetchMetrics };
};
