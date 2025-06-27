import { useState, useCallback } from "react";
import apiService from "../service/apiService";
import { LinksApi} from "../constants/EndpointsRoutes.ts";

// Interface que coincide con el backend
interface Link {
    id: string;
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    color?: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

interface CreateLinkDto {
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    orderIndex: number;
    isActive?: boolean;
}

interface UpdateLinkDto {
    label?: string;
    url?: string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
}

// Lista de plataformas sociales para identificar qué enlaces son sociales
const SOCIAL_PLATFORMS = [
    'instagram', 'tiktok', 'twitter', 'x', 'youtube', 'facebook', 'twitch',
    'linkedin', 'snapchat', 'threads', 'email', 'gmail', 'pinterest', 'spotify',
    'apple music', 'discord', 'tumblr', 'whatsapp', 'telegram', 'amazon', 'onlyfans'
];

export const useFetchLinks = (biositeId?: string) => {
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchLinks = useCallback(async (): Promise<Link[]> => {
        if (!biositeId) {
            setError("Biosite ID is required");
            return [];
        }

        try {
            setLoading(true);
            setError(null);

            const res = await apiService.getAll<Link[]>(`/links/biosite/${biositeId}`);


            const linksArray = Array.isArray(res) ? res : [];
            setLinks(linksArray);
            return linksArray;
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

    const createLink = useCallback(async (linkData: CreateLinkDto): Promise<Link | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Creating link with data:", linkData);

            const newLink = await apiService.create<CreateLinkDto, Link>(LinksApi, linkData);
            console.log("Link created:", newLink);

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

    const updateLink = useCallback(async (linkId: string, updateData: UpdateLinkDto): Promise<Link | null> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Updating link:", linkId, updateData);

            const updatedLink = await apiService.update<UpdateLinkDto>(LinksApi, linkId, updateData);
            console.log("Link updated:", updatedLink);

            // Update local state
            setLinks(prev =>
                prev.map(link =>
                    link.id === linkId
                        ? { ...link, ...updatedLink }
                        : link
                )
            );

            return updatedLink as Link;
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
            console.log("Deleting link with ID:", linkId);

            // Verificar que el enlace existe antes de intentar eliminarlo
            const linkExists = links.find(link => link.id === linkId);
            if (!linkExists) {
                console.warn("Link not found in local state:", linkId);

            }

            const response = await apiService.delete(LinksApi, linkId);



        } catch (error: any) {
            return false;
        } finally {
            setLoading(false);
        }
    }, [links]);

    const reorderLinks = useCallback(async (biositeId: string, reorderedLinks: { id: string; orderIndex: number }[]): Promise<boolean> => {
        try {
            setLoading(true);
            setError(null);
            console.log("Reordering links:", reorderedLinks);

            // Usar el endpoint específico de reordenamiento del backend
            await apiService.patch(`/links/reorder/${biositeId}`, { links: reorderedLinks });
            console.log("Links reordered successfully");

            // Update local state
            setLinks(prev => {
                const updated = [...prev];
                reorderedLinks.forEach(({ id, orderIndex }) => {
                    const linkIndex = updated.findIndex(link => link.id === id);
                    if (linkIndex !== -1) {
                        updated[linkIndex].orderIndex = orderIndex;
                    }
                });
                return updated.sort((a, b) => a.orderIndex - b.orderIndex);
            });

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
            console.log("Link status updated:", updatedLink);

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

    // Función para determinar si un enlace es social basado en su label o URL
    const isSocialLink = useCallback((link: Link): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return SOCIAL_PLATFORMS.some(platform =>
            labelLower.includes(platform) ||
            urlLower.includes(platform) ||
            urlLower.includes(platform.replace(' ', ''))
        );
    }, []);

    // Función para obtener solo enlaces sociales
    const getSocialLinks = useCallback(() => {
        return links.filter(isSocialLink);
    }, [links, isSocialLink]);

    // Función para obtener solo enlaces regulares
    const getRegularLinks = useCallback(() => {
        return links.filter(link => !isSocialLink(link));
    }, [links, isSocialLink]);

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
        getSocialLinks,
        getRegularLinks,
        isSocialLink,
        clearError,
        resetState
    };
};