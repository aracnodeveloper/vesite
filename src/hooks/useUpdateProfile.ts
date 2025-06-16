// src/hooks/useUpdateProfile.ts
import apiService from "../service/apiService";
import { updateBiositeApi } from "../constants/EndpointsRoutes";
import { useAuthContext } from "./useAuthContext";

export const useUpdateProfile = () => {
    const { userId } = useAuthContext();

    const updateProfile = async (data: {
        title?: string;
        slug?: string;
        avatarImage?: string;
        themeId?: string; // debe ser un ID válido
    }) => {
        if (!userId) return;

        return await apiService.update(updateBiositeApi, userId, data);
    };

    return { updateProfile };
};
