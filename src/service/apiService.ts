import api from "./api";
import type { AxiosRequestConfig } from "axios";
import {
    biositeAnalyticsApi,
    getClicksByBiositeApi,
    linksClicksApi,
    registerVisitApi
} from "../constants/EndpointsRoutes.ts";

export interface PaginationParams {
    page?: number;
    size?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    size: number;
    totalPages: number;
}

const apiService = {
    getAll: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
    },

    // Nuevo método específico para obtener datos con paginación
    getAllPaginated: async <T>(
        baseUrl: string,
        params?: PaginationParams,
        config?: AxiosRequestConfig
    ): Promise<T[] | PaginatedResponse<T>> => {
        let url = baseUrl;

        if (params?.page && params?.size) {
            const searchParams = new URLSearchParams({
                page: params.page.toString(),
                size: params.size.toString()
            });

            // Si la URL ya tiene parámetros, usar & para agregar más
            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${searchParams.toString()}`;
        }

        const response = await api.get<T[] | PaginatedResponse<T>>(url, config);
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

    // Método para construir URLs con parámetros de paginación
    buildPaginatedUrl: (baseUrl: string, params?: PaginationParams): string => {
        if (!params?.page || !params?.size) {
            return baseUrl;
        }

        const searchParams = new URLSearchParams({
            page: params.page.toString(),
            size: params.size.toString()
        });

        const separator = baseUrl.includes('?') ? '&' : '?';
        return `${baseUrl}${separator}${searchParams.toString()}`;
    },
};

// Analytics functions
export const getBiositeAnalytics = async (userId: string, timeRange: 'last7' | 'last30' | 'lastYear' = 'last7') => {
    try {
        const response = await api.get(`${biositeAnalyticsApi}/${userId}`, {
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
        const response = await api.get(`${getClicksByBiositeApi}/${biositeId}/${linksClicksApi}`);
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
        const response = await api.post(`${registerVisitApi}`, data);
        return response.data;
    } catch (error) {
        console.error('Error tracking visit:', error);
        throw error;
    }
};

// Link click tracking function (incluye embeds)
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

// Get visit stats by biosite - NUEVA FUNCIÓN
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

// Get all visit stats for a biosite with better filtering - NUEVA FUNCIÓN
export const getDetailedVisitStats = async (
    biositeId: string,
    options?: {
        startDate?: string;
        endDate?: string;
        groupBy?: 'day' | 'week' | 'month';
        includeMetadata?: boolean;
    }
) => {
    try {
        const params = new URLSearchParams();
        if (options?.startDate) params.append('startDate', options.startDate);
        if (options?.endDate) params.append('endDate', options.endDate);
        if (options?.groupBy) params.append('groupBy', options.groupBy);
        if (options?.includeMetadata) params.append('includeMetadata', 'true');

        let url = `/visits-stats/biosite/${biositeId}/detailed`;
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching detailed visit stats:', error);
        throw error;
    }
};

// Get link clicks by biosite (incluye embeds) - MEJORADA
export const getLinkClicksByBiosite = async (biositeId: string, options?: {
    includeEmbeds?: boolean;
    startDate?: string;
    endDate?: string;
    groupBy?: 'link' | 'date' | 'type';
}) => {
    try {
        const params = new URLSearchParams();
        if (options?.includeEmbeds) params.append('includeEmbeds', 'true');
        if (options?.startDate) params.append('startDate', options.startDate);
        if (options?.endDate) params.append('endDate', options.endDate);
        if (options?.groupBy) params.append('groupBy', options.groupBy);

        let url = `/links-clicks/biosite/${biositeId}/links-clicks`;
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching clicks by biosite:', error);
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

// Get embed clicks specifically - NUEVA FUNCIÓN
export const getEmbedClicks = async (biositeId: string, embedType?: 'music' | 'video' | 'social-post') => {
    try {
        const params = new URLSearchParams();
        params.append('type', 'embed');
        if (embedType) params.append('embedType', embedType);

        const url = `/links-clicks/biosite/${biositeId}/embeds?${params.toString()}`;
        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching embed clicks:', error);
        throw error;
    }
};

// Comprehensive analytics function - NUEVA FUNCIÓN
export const getComprehensiveAnalytics = async (
    biositeId: string,
    options?: {
        timeRange?: 'last7' | 'last30' | 'lastYear';
        includeVisitStats?: boolean;
        includeLinkClicks?: boolean;
        includeEmbedClicks?: boolean;
    }
) => {
    try {
        const params = new URLSearchParams();
        if (options?.timeRange) params.append('timeRange', options.timeRange);
        if (options?.includeVisitStats) params.append('includeVisitStats', 'true');
        if (options?.includeLinkClicks) params.append('includeLinkClicks', 'true');
        if (options?.includeEmbedClicks) params.append('includeEmbedClicks', 'true');

        let url = `/analytics/biosite/${biositeId}/comprehensive`;
        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await api.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching comprehensive analytics:', error);
        throw error;
    }
};

export default apiService;