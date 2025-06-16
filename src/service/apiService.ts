// src/service/apiService.ts
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

    create: async <T, R>(url: string, data: T): Promise<R> => {
        const response = await api.post<R>(url, data);
        return response.data;
    },

    update: async <T>(endpoint: string, id: string, data: Partial<T>): Promise<T> => {
        const response = await api.patch<T>(`${endpoint}/${id}`, data);
        return response.data;
    }
,

    delete: async <R>(url: string, id: string): Promise<R> => {
        const response = await api.delete<R>(`${url}/${id}`);
        return response.data;
    },

    createReqRes: async <T extends object, D>(
        endpoint: string,
        data: T
    ): Promise<D> => {
        const response = await api.post<D>(endpoint, data);
        return response.data;
    },
};

export default apiService;
