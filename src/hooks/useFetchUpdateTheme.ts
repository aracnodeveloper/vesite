import { useState } from "react";
import apiService from "../service/apiService";
import { themesApi } from "../constants/EndpointsRoutes.ts";
import Cookies from "js-cookie";
import type {UpdateThemeDto} from "../interfaces/updateTheme.ts";

export const useUpdateTheme = () => {
    const [loading, setLoading] = useState(false);
    const biositeId = Cookies.get("biositeId");

    const updateTheme = async (data: Omit<UpdateThemeDto, "biositeId">) => {
        if (!biositeId) return;
        setLoading(true);
        await apiService.update(`${themesApi}`,`${biositeId}`, {
            ...data,
            biositeId,
        });
        setLoading(false);
    };

    return { updateTheme, loading };
};
