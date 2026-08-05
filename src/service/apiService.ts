import api from "./api";
import type { AxiosRequestConfig } from "axios";
import {biositeAnalyticsApi} from "../constants/EndpointsRoutes.ts";
import type { AnalyticsData } from "../interfaces/Analytics.ts";

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

export interface AdminLinkData {
    linkId : string;
    icon: string;
    url: string;
    image?: string;
    label: string;
    link_type: string;
    orderIndex?: number;
}

const pendingGetRequests = new Map<string, Promise<unknown>>();

const getRequestKey = (url: string, config?: AxiosRequestConfig) =>
    `${url}::${JSON.stringify(config?.params ?? {})}`;

const getDeduplicated = async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const key = getRequestKey(url, config);
    const pendingRequest = pendingGetRequests.get(key);
    if (pendingRequest) {
        return pendingRequest as Promise<T>;
    }

    const request = api.get<T>(url, config)
        .then(response => response.data)
        .finally(() => pendingGetRequests.delete(key));
    pendingGetRequests.set(key, request);
    return request;
};

const apiService = {
    getAll: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        return getDeduplicated<T>(url, config);
    },

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

            const separator = url.includes('?') ? '&' : '?';
            url += `${separator}${searchParams.toString()}`;
        }

        return getDeduplicated<T[] | PaginatedResponse<T>>(url, config);
    },

    getById: async <T>(endpoint: string, id: string): Promise<T> => {
        return getDeduplicated<T>(`${endpoint}/${id}`);
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

export const getBiositeAnalytics = async (
    userId: string,
    timeRange: 'last7' | 'last30' | 'lastYear' = 'last7'
): Promise<AnalyticsData | string> => {
    try {
        return await getDeduplicated<AnalyticsData | string>(`${biositeAnalyticsApi}/${userId}`, {
            params: { timeRange },
        });
    } catch (error) {
        console.error('Error fetching biosite analytics:', error);
        throw error;
    }
};

export const adminLinkMethods = {
    updateAdminLink: async (adminId: string, linkData: AdminLinkData): Promise<unknown> => {
        try {
            const payload = {
                linkId: linkData.linkId,
                label: linkData.label,
                url: linkData.url,
                icon: linkData.icon,
                image: linkData.image,
                orderIndex: linkData.orderIndex,
                link_type: linkData.link_type || 'regular'
            };

            console.log('Sending payload:', payload);

            const response = await api.patch<unknown>(
                `/biosites/admin/update-link/${adminId}`,
                payload
            );
            console.log('Admin link update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating admin link:', error);
            throw error;
        }
    },
};



export default apiService;
