import apiService from '../../../core/api/apiService';
import {biositeAnalyticsApi, registerLinkClickApi, registerVisitApi} from "../../../core/api/endpoints.ts";
import type { AnalyticsData, TimeRange } from "../types/Analytics.ts";

interface VisitStatData {
    biositeId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
    device: string;
    country:string
}

interface LinkClickData {
    linkId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
}

class AnalyticsService {
    private hasTrackedVisit = new Set<string>();
    private trackedLinks = new Set<string>();

    private getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            referer: document.referrer || undefined
        };
    }

    private async getClientIP(): Promise<string | undefined> {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('Could not get client IP:', error);
            return undefined;
        }
    }

    async trackVisit(biositeId: string): Promise<void> {
        if (this.hasTrackedVisit.has(biositeId)) {
            setTimeout(() => this.hasTrackedVisit.delete(biositeId), 1000);
            return;
        }
        try {
            const browserInfo = this.getBrowserInfo();
            const ipAddress = await this.getClientIP();

            const visitData: VisitStatData = {
                biositeId,
                ipAddress,
                userAgent: browserInfo.userAgent,
                referer: browserInfo.referer,
                device:'Celular',
                country: 'Cuenca'
            };

            await apiService.create(registerVisitApi, visitData);
            this.hasTrackedVisit.add(biositeId);

            console.log('Visit tracked successfully');
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }

    async trackLinkClick(linkId: string): Promise<void> {
        if (this.trackedLinks.has(linkId)) {
            setTimeout(() => this.trackedLinks.delete(linkId), 1000);
            return;
        }

        try {
            const browserInfo = this.getBrowserInfo();
            const ipAddress = await this.getClientIP();

            const clickData: LinkClickData = {
                linkId,
                ipAddress,
                userAgent: browserInfo.userAgent,
                referer: browserInfo.referer
            };

            await apiService.create(registerLinkClickApi, clickData);
            this.trackedLinks.add(linkId);

            console.log('Link click tracked successfully:', linkId);
        } catch (error) {
            console.error('Error tracking link click:', error);
        }
    }

    resetTracking(): void {
        this.hasTrackedVisit.clear();
        this.trackedLinks.clear();
    }
}

const today = () => new Date().toISOString().split("T")[0];

const emptyAnalytics = (biositeId = ""): AnalyticsData => ({
    biositeId,
    biositeSlug: 'user-biosite',
    dailyActivity: [{ day: today(), views: 0, clicks: 0, linkClicks: [] }],
    clickDetails: [],
    views: 0,
    clicks: 0,
});

/**
 * Normaliza la respuesta del backend. Si devuelve HTML (p. ej. un error del
 * proxy) o algo inválido, se usan métricas vacías.
 */
const normalizeAnalytics = (raw: unknown, biositeId = ""): AnalyticsData => {
    if (!raw || typeof raw !== "object") {
        if (typeof raw === "string" && raw.includes("<!doctype html>")) {
            console.warn("⚠️ API returned HTML instead of JSON");
        } else {
            console.warn("⚠️ Invalid analytics result:", raw);
        }
        return emptyAnalytics(biositeId);
    }

    const result = raw as Partial<AnalyticsData>;
    return {
        biositeId: result.biositeId || biositeId,
        biositeSlug: result.biositeSlug || 'user-biosite',
        dailyActivity: result.dailyActivity && result.dailyActivity.length > 0
            ? result.dailyActivity.map((day) => ({ ...day, linkClicks: day.linkClicks || [] }))
            : [{ day: today(), views: result.views || 0, clicks: result.clicks || 0, linkClicks: [] }],
        clickDetails: (result.clickDetails || []).map((detail) => ({
            ...detail,
            isActive: detail.isActive !== false,
        })),
        views: result.views || 0,
        clicks: result.clicks || 0,
    };
};

/** Métricas del biosite de un usuario para el rango indicado, ya normalizadas. */
export const getBiositeAnalytics = async (
    userId: string,
    timeRange: TimeRange = 'last7',
    biositeId?: string
): Promise<AnalyticsData> => {
    try {
        const raw = await apiService.getAll<unknown>(`${biositeAnalyticsApi}/${userId}`, {
            params: { timeRange },
        });
        return normalizeAnalytics(raw, biositeId);
    } catch (error) {
        console.error('Error fetching biosite analytics:', error);
        throw error;
    }
};

export const analyticsService = new AnalyticsService();
export default analyticsService;