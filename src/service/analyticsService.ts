import apiService from './apiService';

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

    // Obtener información del navegador
    private getBrowserInfo() {
        return {
            userAgent: navigator.userAgent,
            referer: document.referrer || undefined
        };
    }

    // Obtener IP del usuario (usando un servicio externo)
    private async getClientIP(): Promise<string | undefined> {
        try {
            // Puedes usar diferentes servicios para obtener la IP
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('Could not get client IP:', error);
            return undefined;
        }
    }

    // Registrar una vista de biosite
    async trackVisit(biositeId: string): Promise<void> {
        if (this.hasTrackedVisit.has(biositeId)) {
            // Permitir nuevo tracking después de 1 segundo
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

            await apiService.create('/visits-stats/register-parser', visitData);
            this.hasTrackedVisit.add(biositeId);

            console.log('Visit tracked successfully');
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }

    // Registrar un clic en un enlace (incluye embeds)
    async trackLinkClick(linkId: string): Promise<void> {
        // Evitar múltiples registros del mismo link en un período corto
        if (this.trackedLinks.has(linkId)) {
            // Permitir nuevo tracking después de 1 segundo
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

            await apiService.create('/links-clicks/register-parser', clickData);
            this.trackedLinks.add(linkId);

            console.log('Link click tracked successfully:', linkId);
        } catch (error) {
            console.error('Error tracking link click:', error);
        }
    }

    // Registrar un clic en un embed (música, video, social post)
    async trackEmbedClick(embedId: string, embedType: 'music' | 'video' | 'social-post'): Promise<void> {
        // Los embeds se rastrean igual que los links regulares
        await this.trackLinkClick(embedId);
        console.log(`${embedType} embed click tracked:`, embedId);
    }

    // Obtener estadísticas de visitas por biosite
    async getVisitStats(biositeId: string, dateFilter?: {
        day?: number;
        month?: number;
        year?: number;
    }) {
        try {
            let url = `/visits-stats/biosite/${biositeId}`;
            const params = new URLSearchParams();

            if (dateFilter) {
                if (dateFilter.day) params.append('day', dateFilter.day.toString());
                if (dateFilter.month) params.append('month', dateFilter.month.toString());
                if (dateFilter.year) params.append('year', dateFilter.year.toString());
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await apiService.getAll(url);
            console.log('Visit stats retrieved:', response);
            return response;
        } catch (error) {
            console.error('Error fetching visit stats:', error);
            throw error;
        }
    }

    // Obtener clics por biosite (incluye embeds)
    async getLinkClicksByBiosite(biositeId: string) {
        try {
            const response = await apiService.getAll(`/links-clicks/biosite/${biositeId}/links-clicks`);
            console.log('Link clicks by biosite retrieved:', response);
            return response;
        } catch (error) {
            console.error('Error fetching link clicks by biosite:', error);
            throw error;
        }
    }

    // Obtener clics de un link específico
    async getLinkClicks(linkId: string) {
        try {
            const response = await apiService.getAll(`/links-clicks/link/${linkId}`);
            console.log('Link clicks retrieved for linkId:', linkId, response);
            return response;
        } catch (error) {
            console.error('Error fetching link clicks:', error);
            throw error;
        }
    }

    // Reiniciar el tracking (útil para desarrollo)
    resetTracking(): void {
        this.hasTrackedVisit.clear();
        this.trackedLinks.clear();
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;