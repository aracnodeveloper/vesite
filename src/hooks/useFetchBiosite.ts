// src/hooks/useGetBiosite.ts
import apiService from "../service/apiService";
import { getBiositeApi } from "../constants/EndpointsRoutes";
import { useAuthContext } from "./useAuthContext";

interface Biosite {
    title?: string;
    slug?: string;
    avatarImage?: string;
    themeId?: string;
}

export const useGetBiosite = () => {
    const { userId } = useAuthContext();

    const fetchBiosite = async (): Promise<Biosite | null> => {
        if (!userId) return null;
        try {
            const data = await apiService.getById<Biosite>(getBiositeApi, userId);
            return data;
        } catch (e) {
            return null;
        }
    };

    return { fetchBiosite };
};
