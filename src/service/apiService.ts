// src/service/apiService.ts
import api from "./api";
import type { AxiosRequestConfig } from "axios";

const apiService = {
    getAll: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
        const response = await api.get<T>(url, config);
        return response.data;
    },

    getById: async <T>(url: string, id: string): Promise<T> => {
        const response = await api.get<T>(`${url}/${id}`);
        return response.data;
    },

    create: async <T, R>(url: string, data: T): Promise<R> => {
        const response = await api.post<R>(url, data);
        return response.data;
    },

    update: async <T, R>(url: string, id: string, data: T): Promise<R> => {
        const response = await api.patch<R>(`${url}/${id}`, data);
        return response.data;
    },

    delete: async <R>(url: string, id: string): Promise<R> => {
        const response = await api.delete<R>(`${url}/${id}`);
        return response.data;
    },

    createReqRes: async <T, R>(url: string, data: T): Promise<R> => {
        const response = await api.post<R>(url, data);
        return response.data;
    },
};

export default apiService;
