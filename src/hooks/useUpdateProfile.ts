import type {Biosite} from "../interfaces/Biosite";
import apiService from "../service/apiService";
import {getBiositeApi} from "../constants/EndpointsRoutes.ts";
import Cookies from "js-cookie";

export const useUpdateBiosite = () => {

    const updateBiosite = async (data: Partial<Biosite>) => {
        try {
            await apiService.create(getBiositeApi, data);
        } catch (error) {
            console.error("Error updating biosite:", error);
        }
    };

    return { updateBiosite };
};
