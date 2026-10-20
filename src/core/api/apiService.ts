import api from "./client";
import type { AxiosRequestConfig } from "axios";

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
};

export default apiService;
