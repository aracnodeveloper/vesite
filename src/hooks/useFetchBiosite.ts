

import { getBiositeApi } from "../constants/EndpointsRoutes";
import type { BiositeFull } from "../interfaces/Biosite";
import { useState } from "react";
import apiService from "../service/apiService.ts";

export const useFetchBiosite = (biositeId: string) => {
    const [biositeData, setBiositeData] = useState<BiositeFull | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchBiosite = async (): Promise<BiositeFull | null> => {
        if (!biositeId) return null;
        try {
            const res = await apiService.getById<BiositeFull>(getBiositeApi, biositeId);
            setBiositeData(res);
            return res;
        } catch (error) {
            console.error("fetchBiosite error", error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return { biositeData, loading, fetchBiosite };
};
