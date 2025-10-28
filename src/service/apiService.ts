import api from "./api";
import type { AxiosRequestConfig } from "axios";
import {biositeAnalyticsApi} from "../constants/EndpointsRoutes.ts";

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

const apiService = {
    getAll: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
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

};

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

export const adminLinkMethods = {
    updateAdminLink: async (adminId: string, linkData: AdminLinkData): Promise<any> => {
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

            const response = await api.patch(
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