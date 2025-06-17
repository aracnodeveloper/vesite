import apiService from "../service/apiService";
import Cookies from "js-cookie";
import { updateBiositeApi, updateStaticApi,getBiositeApi } from "../constants/EndpointsRoutes";
import type { BiositeUpdateDto, BiositeFull } from "../interfaces/Biosite";
import type { StaticUpdateDto } from "../interfaces/Static";
import {useState} from "react";

export const useFetchBiosite = () => {
    const [biosite, setBiosite] = useState<BiositeFull[]>([]);
    const biositeId = Cookies.get("userId");
    const [loading, setLoading] = useState<boolean>(true);

    const fetchBiosite = async () => {
        if (!biositeId) return null;
        try {
            const res :BiositeFull[] = await apiService.getById(getBiositeApi,biositeId);
            setBiosite(res);
        } catch (error) {
            console.error("fetchBiosite error", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const fetchStatic = async (): Promise<StaticUpdateDto | null> => {
        if (!biositeId) return null;
        try {
            const res = await apiService.getAll(`${updateStaticApi}/${biositeId}`);
            return res;
        } catch (err) {
            console.error("fetchStatic error", err);
            return null;
        }
    };

    const updateBiosite = async (data: BiositeUpdateDto) => {
        if (!biositeId) return;
        return await apiService.patch(`${updateBiositeApi}/${biositeId}`, data);
    };

    const updateStatic = async (data: StaticUpdateDto) => {
        if (!biositeId) return;
        return await apiService.patch(`${updateStaticApi}/${biositeId}`, data);
    };

    return { biosite,loading,refetch:fetchBiosite, fetchStatic, updateBiosite, updateStatic };
};