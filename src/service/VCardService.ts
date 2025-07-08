// services/businessCardService.ts
import apiService from "./apiService.ts";
import {
    businessCardsApi,
    createBusinessCardApi,
    getBusinessCardByUserApi,
    getBusinessCardBySlugApi,
    regenerateQRCodeApi, getBusinessCardApi
} from "../constants/EndpointsRoutes.ts";
import type { BusinessCard, UpdateBusinessCardDto } from "../types/V-Card.ts";

export const businessCardService = {

    createBusinessCard: async (userId: string): Promise<BusinessCard> => {
        const response = await apiService.create<{}, BusinessCard>(
            `${createBusinessCardApi}/${userId}`,
            {}
        );
        return response;
    },

    getAllBusinessCards: async (): Promise<BusinessCard[]> => {
        return await apiService.getAll<BusinessCard[]>(businessCardsApi);
    },

    getBusinessCardById: async (id: string): Promise<BusinessCard> => {
        return await apiService.getById<BusinessCard>(businessCardsApi, id);
    },

    // Obtener business card por usuario
    getBusinessCardByUserId: async (userId: string): Promise<BusinessCard> => {
        return await apiService.getById<BusinessCard>(getBusinessCardByUserApi, userId);
    },

    // Obtener business card por slug
    getBusinessCardBySlug: async (slug: string): Promise<BusinessCard> => {
        return await apiService.getById<BusinessCard>(getBusinessCardBySlugApi, slug);
    },

    // Actualizar business card
    updateBusinessCard: async (id: string, data: UpdateBusinessCardDto): Promise<BusinessCard> => {
        return await apiService.update<UpdateBusinessCardDto>(businessCardsApi, id, data);
    },

    // Eliminar business card
    deleteBusinessCard: async (id: string): Promise<void> => {
        return await apiService.delete(businessCardsApi, id);
    },
    //getCard
    getBussinesCard: async (userId: string): Promise<BusinessCard> => {
        const response = await apiService.create<{}, BusinessCard>(
            `${regenerateQRCodeApi}/${userId}`,
            {}
        );
        return response
    },

    // Regenerar código QR
    regenerateQRCode: async (userId: string): Promise<BusinessCard> => {
        const response = await apiService.create<{}, BusinessCard>(
            `${getBusinessCardApi}/${userId}`,
            {}
        );
        return response;
    }
};