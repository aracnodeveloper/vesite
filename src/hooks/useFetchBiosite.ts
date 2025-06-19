import { getBiositeApi, updateBiositeApi } from "../constants/EndpointsRoutes";
import type { BiositeFull, BiositeUpdateDto} from "../interfaces/Biosite";
import { useState, useCallback, useRef } from "react";
import apiService from "../service/apiService.ts";

export const useFetchBiosite = (userId?: string) => {
    const [biositeData, setBiositeData] = useState<BiositeFull | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const isInitializedRef = useRef<boolean>(false);
    const currentUserIdRef = useRef<string | undefined>(undefined);

    const fetchBiosite = useCallback(async (): Promise<BiositeFull | null> => {
        if (!userId) {
            setError("User ID is required");
            return null;
        }

        if (loading || (isInitializedRef.current && currentUserIdRef.current === userId)) {
            console.log("Skipping duplicate fetch for userId:", userId);
            return biositeData;
        }

        try {
            setLoading(true);
            setError(null);
            console.log("Fetching biosite for userId:", userId);

            const res = await apiService.getById<BiositeFull>(getBiositeApi, userId);
            console.log("Biosite data received:", res);

            setBiositeData(res);
            isInitializedRef.current = true;
            currentUserIdRef.current = userId;
            return res;
        } catch (error: any) {
            console.error("fetchBiosite error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar el biosite";
            setError(errorMessage);
            setBiositeData(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [userId, loading, biositeData]);

    const updateBiosite = async (updateData: BiositeUpdateDto): Promise<BiositeFull | null> => {
        if (!biositeData?.id) {
            const errorMsg = "No biosite ID available for update";
            console.error(errorMsg);
            setError(errorMsg);
            return null;
        }

        try {
            setLoading(true);
            setError(null);
            console.log("Updating biosite with data:", updateData);

            const updatedBiosite = await apiService.update<BiositeUpdateDto>(
                updateBiositeApi,
                biositeData.id,
                updateData
            );

            console.log("Biosite updated:", updatedBiosite);

            const newBiositeData: BiositeFull = {
                ...biositeData,
                ...updatedBiosite,
                colors: updatedBiosite.colors ?? biositeData.colors
            };
            setBiositeData(newBiositeData);

            return newBiositeData;
        } catch (error: any) {
            console.error("updateBiosite error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar el biosite";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const clearError = () => setError(null);

    const resetState = () => {
        setBiositeData(null);
        setError(null);
        setLoading(false);
        isInitializedRef.current = false;
        currentUserIdRef.current = undefined;
    };

    return {
        biositeData,
        loading,
        error,
        fetchBiosite,
        updateBiosite,
        clearError,
        resetState
    };
};