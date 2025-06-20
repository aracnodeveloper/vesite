import { useState, useCallback } from "react";
import type { SocialLink } from "../interfaces/PreviewContext.ts";
import apiService from "../service/apiService";

interface CreateLinkDto {
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    orderIndex: number;
    isActive: boolean;
}

interface UpdateLinkDto {
    label?: string;
    url?: string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
}

export const useFetchLinks = (biositeId?: string) => {
    const [links, setLinks] = useState<SocialLink[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async (): Promise<SocialLink[]> => {
        if (!biositeId) {
            setError("Biosite ID is required");
            return [];
        }

        try {
            setLoading(true);
            setError(null);
            console.log("Fetching links for biositeId:", biositeId);

            // Assuming you have an endpoint to get links by biosite ID
            const res = await apiService.getAll<SocialLink[]>(`/links/biosite/${biositeId}`);
            console.log("Links data received:", res);

            setLinks(Array.isArray(res) ? res : []);
            return Array.isArray(res) ? res : [];
        } catch (error: any) {
            console.error("fetchLinks error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar los enlaces";
            setError(errorMessage);
            setLinks([]);
            return [];
        } finally {
            setLoading(false);
        }
    }, [biositeId]);

    const createLink = useCallback(async (linkData: CreateLinkDto): Promise<SocialLink | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Creating link with data:", linkData);

            const newLink = await apiService.create<CreateLinkDto, SocialLink>("/links", linkData);
            console.log("SocialLink created:", newLink);

            // Update local state
            setLinks(prev => [...prev, newLink]);
            return newLink;
        } catch (error: any) {
            console.error("createLink error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al crear el enlace";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateLink = useCallback(async (linkId: string, updateData: UpdateLinkDto): Promise<SocialLink | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Updating link:", linkId, updateData);

            const updatedLink = await apiService.update<UpdateLinkDto>("/links", linkId, updateData);
            console.log("SocialLink updated:", updatedLink);

            // Update local state
            setLinks(prev =>
                prev.map(link =>
                    link.id === linkId
                        ? { ...link, ...updatedLink }
                        : link
                )
            );

            return updatedLink as SocialLink;
        } catch (error: any) {
            console.error("updateLink error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al actualizar el enlace";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteLink = useCallback(async (linkId: string): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Deleting link:", linkId);

            await apiService.delete("/links", linkId);
            console.log("SocialLink deleted:", linkId);

            // Update local state
            setLinks(prev => prev.filter(link => link.id !== linkId));
            return true;
        } catch (error: any) {
            console.error("deleteLink error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al eliminar el enlace";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const reorderLinks = useCallback(async (reorderedLinks: SocialLink []): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Reordering links:", reorderedLinks);

            // Update order indexes
            const updatePromises = reorderedLinks.map((link, index) =>
                apiService.update<UpdateLinkDto>("/links", link.id, { orderIndex: index })
            );

            await Promise.all(updatePromises);
            console.log("Links reordered successfully");

            // Update local state
            setLinks(reorderedLinks);
            return true;
        } catch (error: any) {
            console.error("reorderLinks error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al reordenar los enlaces";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleLinkStatus = useCallback(async (linkId: string, isActive: boolean): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Toggling link status:", linkId, isActive);

            const updatedLink = await apiService.update<UpdateLinkDto>("/links", linkId, { isActive });
            console.log("SocialLink status updated:", updatedLink);

            // Update local state
            setLinks(prev =>
                prev.map(link =>
                    link.id === linkId
                        ? { ...link, isActive }
                        : link
                )
            );

            return true;
        } catch (error: any) {
            console.error("toggleLinkStatus error:", error);
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cambiar el estado del enlace";
            setError(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const resetState = useCallback(() => {
        setLinks([]);
        setError(null);
        setLoading(false);
    }, []);

    return {
        links,
        loading,
        error,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        toggleLinkStatus,
        clearError,
        resetState
    };
};