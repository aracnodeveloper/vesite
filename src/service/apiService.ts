import api from "./api";
import type { AxiosRequestConfig } from "axios";

const apiService = {
    getAll: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
    },

    getById: async <T>(endpoint: string, id: string): Promise<T> => {
        const response = await api.get<T>(`${endpoint}/${id}`);
        return response.data;
    },

    create: async <T extends object, R>(endpoint: string, data: T): Promise<R> => {
        const response = await api.post<R>(endpoint, data);
        return response.data;
    },

    patch: async <T>(url: string, data: T): Promise<T> => {
        const response = await api.patch(url, data)
        return response.data;
    },

    update: async <T>(endpoint: string, id: string, data: T): Promise<T> => {
        const response = await api.patch<T>(`${endpoint}/${id}`, data);
        return response.data;
    },

    delete: async (endpoint: string, id: string): Promise<void> => {
        await api.delete(`${endpoint}/${id}`);
    },

    createReqRes: async <T extends object, D>(
        endpoint: string,
        data: T
    ): Promise<D> => {
        const response = await api.post<D>(endpoint, data);
        return response.data;
    },
};

// Analytics functions
export const getBiositeAnalytics = async (userId: string, timeRange: 'last7' | 'last30' | 'lastYear' = 'last7') => {
    try {
        const response = await api.get(`/biosites/analytics/${userId}`, {
            params: { timeRange },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching biosite analytics:', error);
        throw error;
    }
};

export const getClicksGroupedByLabel = async (biositeId: string) => {
    try {
        const response = await api.get(`/links-clicks/biosite/${biositeId}/links-clicks`);
        return response.data;
    } catch (error) {
        console.error('Error fetching clicks grouped by label:', error);
        throw error;
    }
};

// Visit tracking function
export const trackVisit = async (data: {
    biositeId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
}) => {
    try {
        const response = await api.post('/visits-stats/register-parser', data);
        return response.data;
    } catch (error) {
        console.error('Error tracking visit:', error);
        throw error;
    }
};

// Link click tracking function
export const trackLinkClick = async (data: {
    linkId: string;
    ipAddress?: string;
    userAgent?: string;
    referer?: string;
}) => {
    try {
        const response = await api.post('/links-clicks/register-parser', data);
        return response.data;
    } catch (error) {
        console.error('Error tracking link click:', error);
        throw error;
    }
};

// Get visit stats by biosite
export const getVisitStats = async (biositeId: string, dateFilter?: {
    day?: number;
    month?: number;
    year?: number;
}) => {
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

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching visit stats:', error);
        throw error;
    }
};

// Get link clicks by link ID
export const getLinkClicks = async (linkId: string) => {
    try {
        const response = await api.get(`/links-clicks/link/${linkId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching link clicks:', error);
        throw error;
    }
};

export default apiService;