import apiService from './apiService';

interface VisitStatData {
    biositeId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
}

interface LinkClickData {
    linkId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
}

class AnalyticsService {
    private hasTrackedVisit = false;
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
        // Evitar múltiples registros de visita en la misma sesión
        if (this.hasTrackedVisit) return;

        try {
            const browserInfo = this.getBrowserInfo();
            const ipAddress = await this.getClientIP();

            const visitData: VisitStatData = {
                biositeId,
                ipAddress,
                userAgent: browserInfo.userAgent,
                referer: browserInfo.referer
            };

            await apiService.create('/visits-stats/register-parser', visitData);
            this.hasTrackedVisit = true;

            console.log('Visit tracked successfully');
        } catch (error) {
            console.error('Error tracking visit:', error);
        }
    }

    // Registrar un clic en un enlace
    async trackLinkClick(linkId: string): Promise<void> {
        // Evitar múltiples registros del mismo link en un período corto
        const trackingKey = `${linkId}-${Date.now()}`;
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

    // Reiniciar el tracking (útil para desarrollo)
    resetTracking(): void {
        this.hasTrackedVisit = false;
        this.trackedLinks.clear();
    }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;