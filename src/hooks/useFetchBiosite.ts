import { getBiositeApi, updateBiositeApi } from "../constants/EndpointsRoutes";
import type { BiositeFull, BiositeUpdateDto } from "../interfaces/Biosite";
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

            return biositeData;
        }

        try {
            setLoading(true);
            setError(null);


            const res = await apiService.getById<BiositeFull | BiositeFull[]>(getBiositeApi, userId);


            // Handle both array and single object responses
            let biositeResult: BiositeFull;
            if (Array.isArray(res)) {
                if (res.length === 0) {
                    throw new Error("No biosite found for this user");
                }
                biositeResult = res[0]; // Take the first biosite if array

            } else {
                biositeResult = res;
            }

            setBiositeData(biositeResult);
            isInitializedRef.current = true;
            currentUserIdRef.current = userId;
            return biositeResult;
        } catch (error: any) {

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
            setError(errorMsg);
            return null;
        }

        const criticalFields = [ 'title', 'slug'];
        const missingCriticalFields = criticalFields.filter(field => {
            const value = updateData[field as keyof BiositeUpdateDto];
            return !value || (typeof value === 'string' && value.trim() === '');
        });

        if (missingCriticalFields.length > 0) {
            const errorMsg = `Missing critical fields: ${missingCriticalFields.join(', ')}`;
            setError(errorMsg);
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const updatedBiosite = await apiService.update<BiositeUpdateDto>(
                updateBiositeApi,
                biositeData.id,
                updateData
            );

            if (updatedBiosite == null) {
                const errorMsg = "API returned null/undefined response";

                setError(errorMsg);
                return null;
            }

            let biositeResult: BiositeFull;

            if (Array.isArray(updatedBiosite)) {

                if (updatedBiosite.length === 0) {
                    const errorMsg = "API returned empty array";
                    setError(errorMsg);
                    return null;
                }
                biositeResult = updatedBiosite[0] as BiositeFull;
            } else {
                biositeResult = updatedBiosite as unknown as BiositeFull;
            }

            if (!biositeResult || typeof biositeResult !== 'object') {
                const errorMsg = "Invalid biosite data received from API - not an object";
                setError(errorMsg);
                return null;
            }

            if (!biositeResult.id) {
                const errorMsg = "Invalid biosite data received from API - missing ID";
                setError(errorMsg);
                return null;
            }

            const newBiositeData: BiositeFull = {
                ...biositeData,
                ...biositeResult,
                id: biositeResult.id || biositeData.id,
                title: biositeResult.title || updateData.title || biositeData.title,
                slug: biositeResult.slug || updateData.slug || biositeData.slug,
                links: biositeData.links || [],
                owner: biositeData.owner,
                colors: biositeResult.colors || updateData.colors || biositeData.colors
            };


            setBiositeData(newBiositeData);
            return newBiositeData;
        } catch (error: any) {


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