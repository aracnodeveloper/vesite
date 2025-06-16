import apiService from "../service/apiService";
import { updateBiositeApi} from "../constants/EndpointsRoutes";
import Cookies from "js-cookie";

export const useUpdateBiosite = () => {
    const biositeId = Cookies.get("biositeId");

    const updateBiosite = async (data: any) => {
        if (!biositeId) return;
        try {
            await apiService.update(`${updateBiositeApi}/${biositeId}`, data);
            console.log("Biosite actualizado");
        } catch (error) {
            console.error("Error actualizando biosite", error);
        }
    };

    return { updateBiosite };
};
