import apiService from "../../../core/api/apiService";
import {
    allBiositesApi,
    biositeBySlugApi,
    biositesApi,
    biositesByAdminApi,
    biositesByUserApi,
    registerApi,
} from "../../../core/api/endpoints";
import type { PaginatedResponse, PaginationParams } from "../../../core/api/types";
import type { CreatedUser } from "../../user/types/User";
import type { BiositeFull, BiositeUpdateDto } from "../types/Biosite";

export interface BiositeListParams extends PaginationParams {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
    slugSearch?: string;
    hasSlug?: string;
    status?: string;
    dateRange?: string;
}

export interface CreateBiositeUserDto {
    email: string;
    password: string;
    name: string;
    parentId: string;
}

/** Cambios parciales de un biosite; `null` limpia el campo (p. ej. el slug). */
export type BiositePatch = { [K in keyof BiositeUpdateDto]?: BiositeUpdateDto[K] | null };

export type BiositeListResponse = BiositeFull[] | PaginatedResponse<BiositeFull>;

const toArray = <T>(value: T | T[]): T[] => (Array.isArray(value) ? value : [value]);

const buildListQuery = (params: BiositeListParams): string => {
    const searchParams = new URLSearchParams({
        page: String(params.page),
        size: String(params.size),
    });
    const query: Record<string, string | undefined> = {
        search: params.search,
        orderBy: params.sortBy,
        orderMode: params.sortOrder,
        status: params.status,
        dateRange: params.dateRange,
        // La búsqueda exacta de slug tiene prioridad sobre el filtro with-slug/without-slug
        slug: params.slugSearch?.trim() || (params.hasSlug !== "all" ? params.hasSlug : undefined),
    };
    Object.entries(query).forEach(([key, value]) => {
        if (value) searchParams.append(key, value);
    });
    return searchParams.toString();
};

export const biositeService = {
    list: (params?: BiositeListParams): Promise<BiositeListResponse> =>
        params?.page && params?.size
            ? apiService.getAll<BiositeListResponse>(`${biositesApi}?${buildListQuery(params)}`)
            : apiService.getAll<BiositeListResponse>(allBiositesApi),

    /** true si ningún otro biosite usa exactamente ese slug. */
    isSlugAvailable: async (slug: string): Promise<boolean> => {
        const response = await apiService.getAll<BiositeListResponse>(
            `${biositesApi}?page=1&size=10&search=${encodeURIComponent(slug)}`
        );
        const biosites = Array.isArray(response) ? response : response?.data ?? [];
        return !biosites.some((biosite) => biosite.slug === slug);
    },

    getById: (biositeId: string) => apiService.getById<BiositeFull>(biositesApi, biositeId),

    getByUser: async (userId: string): Promise<BiositeFull[]> =>
        toArray(await apiService.getById<BiositeFull | BiositeFull[]>(biositesByUserApi, userId)),

    getByAdmin: async (adminId: string): Promise<BiositeFull[]> =>
        toArray(await apiService.getById<BiositeFull | BiositeFull[]>(biositesByAdminApi, adminId)),

    getBySlug: (slug: string) => apiService.getById<BiositeFull>(biositeBySlugApi, slug),

    /** Devuelve [hijo, padre] cuando el biosite pertenece a un usuario hijo. */
    getBySlugWithParent: (slug: string) =>
        apiService.getAll<BiositeFull[]>(`${biositeBySlugApi}/${slug}?include_parent=true`),

    update: async (biositeId: string, data: BiositePatch): Promise<BiositeFull | null> => {
        const result = await apiService.update<BiositePatch>(biositesApi, biositeId, data);
        if (result == null) return null;
        const updated = Array.isArray(result) ? result[0] : result;
        return (updated ?? null) as BiositeFull | null;
    },

    remove: (biositeId: string) => apiService.delete(biositesApi, biositeId),

    /** Crea un usuario hijo junto con su biosite en una sola llamada. */
    createWithUser: (data: CreateBiositeUserDto) =>
        apiService.create<CreateBiositeUserDto, { user: CreatedUser; biosite: BiositeFull }>(registerApi, data),

    // Propagan un cambio del admin a todos los biosites de sus usuarios hijos
    updateChildrenBackground: (adminId: string, background: string) =>
        apiService.patch(
            `${biositesByAdminApi}/update-background/${adminId}?background=${encodeURIComponent(background)}`,
            {}
        ),

    updateChildrenVideo: (adminId: string, videoUrl: string) =>
        apiService.patch(
            `${biositesByAdminApi}/update-video/${adminId}?video=${encodeURIComponent(videoUrl)}`,
            {}
        ),

    updateChildrenApp: (adminId: string, type: string, appUrl: string) =>
        apiService.patch(
            `${biositesByAdminApi}/update-app/${adminId}?type=${type}&appUrl=${encodeURIComponent(appUrl)}`,
            {}
        ),
};
