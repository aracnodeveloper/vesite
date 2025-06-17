// hooks/useUpdateBiosite.ts
import apiService from "../service/apiService";
import { updateBiositeApi } from "../constants/EndpointsRoutes";
import Cookies from "js-cookie";
import type {BiositeUpdateDto} from "../interfaces/Biosite.ts"

export const useUpdateBiosite = () => {
    const biositeId = Cookies.get("biositeId");

    const updateBiosite = async (data: BiositeUpdateDto) => {
        if (!biositeId) return;
        const url = `${updateBiositeApi}/${biositeId}`;
        return await apiService.patch(url, data); // método PATCH real
    };

    return { updateBiosite };
};
