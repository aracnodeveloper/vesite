import apiService from '../../../core/api/apiService';
import {biositeAnalyticsApi, registerLinkClickApi, registerVisitApi} from "../../../core/api/endpoints.ts";
import type { AnalyticsData } from "../types/Analytics.ts";

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

export const getBiositeAnalytics = async (
    userId: string,
    timeRange: 'last7' | 'last30' | 'lastYear' = 'last7'
): Promise<AnalyticsData | string> => {
    try {
        return await apiService.getAll<AnalyticsData | string>(`${biositeAnalyticsApi}/${userId}`, {
            params: { timeRange },
        });
    } catch (error) {
        console.error('Error fetching biosite analytics:', error);
        throw error;
    }
};

export const analyticsService = new AnalyticsService();
export default analyticsService;