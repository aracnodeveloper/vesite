// src/service/apiService.ts
import api from "./api";
import axios, { type AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
const getAuthHeaders = () => {
    const token = Cookies.get("accessToken");
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};



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
    patch: async <T>(url: string, data: T): Promise<T> => {
        const response = await axios.patch(url, data, {
            headers: getAuthHeaders(),
        });
        return response.data;
    },
    update: async <T>(endpoint: string, id: string, data: T): Promise<T> => {
        const response = await api.patch<T>(`${endpoint}/${id}`, data);
        return response.data;
    },


    delete: async <R>(endpoint: string, id: string): Promise<R> => {
        const response = await api.delete<R>(`${endpoint}/${id}`);
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

export const getBiositeAnalytics = async (userId: string, timeRange: 'last7' | 'last30' | 'lastYear' = 'last7') => {
  try {
    const response = await axios.get(`/biosites/analytics/${userId}`, {
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
    const response = await axios.get(`/biosite/${biositeId}/links-clicks`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clicks grouped by label:', error);
    throw error;
  }
};

export default apiService;
