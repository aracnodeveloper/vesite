import { useAuthContext } from "./useAuthContext.ts"; // ajusta la ruta si es necesario
import apiService from "../service/apiService";
import { updateBiositeApi } from "../constants/EndpointsRoutes";

export const useUpdateProfile = () => {
    const { userId } = useAuthContext();

    const updateProfile = async (data: {
        title?: string;
        slug?: string;
        avatarImage?: string;
        themeId?: string;
    }) => {
        if (!userId) return;
        return await apiService.update(updateBiositeApi, userId, data);
    };

    return { updateProfile };
};
