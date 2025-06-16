import { useEffect, useState } from "react";
import apiService from "../service/apiService.ts";
import { getBiositeApi } from "../constants/EndpointsRoutes";
import Cookies from "js-cookie";
import type  { Biosite } from "../interfaces/Biosite";

export const useFetchBiosite = () => {
    const [biosite, setBiosite] = useState<Biosite | null>(null);
    const [loading, setLoading] = useState(true);
    const biositeId = Cookies.get("biositeId");

    const fetchBiosite = async () => {
        try {
            if (biositeId) {
                const data = await apiService.getById<Biosite>(getBiositeApi, biositeId);
                setBiosite(data);
            }
        } catch (error) {
            console.error("Error fetching biosite:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBiosite();
    }, []);

    return { biosite, loading };
};
