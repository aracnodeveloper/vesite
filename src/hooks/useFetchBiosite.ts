import { getBiositeApi, updateBiositeApi } from "../constants/EndpointsRoutes";
import type { BiositeFull, BiositeUpdateDto, BiositeColors } from "../interfaces/Biosite";
import { useState, useCallback, useRef } from "react";
import apiService from "../service/apiService.ts";

export interface CreateBiositeDto {
    ownerId: string;
    title: string;
    slug: string;
    themeId?: string;
    colors?: string | BiositeColors;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    isActive?: boolean;
}

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

    const fetchUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        if (!userId) {
            setError("User ID is required");
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            // Using the findAllByAdminId endpoint
            const res = await apiService.getById<BiositeFull[]>(`${getBiositeApi}/admin`, userId);
            return Array.isArray(res) ? res : [res];
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar los biosites";
            setError(errorMessage);
            return [];
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const createBiosite = useCallback(async (createData: CreateBiositeDto): Promise<BiositeFull | null> => {
        if (!createData.ownerId) {
            setError("Owner ID is required");
            return null;
        }

        if (!createData.title?.trim() || !createData.slug?.trim()) {
            setError("Title and slug are required");
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            // Set default values
            const defaultColors: BiositeColors = {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                background: '#FFFFFF',
                text: '#000000',
                accent: '#3B82F6',
                profileBackground: '#F3F4F6'
            };

            const dataToSend = {
                ownerId: createData.ownerId,
                title: createData.title.trim(),
                slug: createData.slug.trim(),
                themeId: createData.themeId || 'default',
                colors: createData.colors || JSON.stringify(defaultColors),
                fonts: createData.fonts || 'Inter',
                avatarImage: createData.avatarImage || '',
                backgroundImage: createData.backgroundImage || '',
                isActive: createData.isActive !== undefined ? createData.isActive : true
            };

            console.log("Creating biosite with data:", dataToSend);

            const newBiosite = await apiService.create<typeof dataToSend, BiositeFull>(
                getBiositeApi,
                dataToSend
            );

            console.log("Biosite created successfully:", newBiosite);

            // If this is the first biosite for the user, set it as the current one
            if (!biositeData) {
                setBiositeData(newBiosite);
                isInitializedRef.current = true;
                currentUserIdRef.current = userId;
            }

            return newBiosite;
        } catch (error: any) {
            console.error("Error creating biosite:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al crear el biosite";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, [biositeData, userId]);

    const updateBiosite = async (updateData: BiositeUpdateDto): Promise<BiositeFull | null> => {
        if (!biositeData?.id) {
            const errorMsg = "No biosite ID available for update";
            setError(errorMsg);
            return null;
        }

        const criticalFields = ['title', 'slug'];
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

    const switchBiosite = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            setLoading(true);
            setError(null);

            const biosite = await apiService.getById<BiositeFull>(getBiositeApi, biositeId);
            setBiositeData(biosite);
            return biosite;
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cambiar de biosite";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

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
        fetchUserBiosites,
        createBiosite,
        updateBiosite,
        switchBiosite,
        clearError,
        resetState
    };
};