import apiService from "../../../core/api/apiService";
import {
    biositesByAdminApi,
    linksApi,
    linksByBiositeApi,
    reorderLinksApi,
} from "../../../core/api/endpoints";
import type { AdminLinkData, CreateLinkDto, Link, UpdateLinkDto } from "../types/Links";

export const linkService = {
    getByBiosite: async (biositeId: string): Promise<Link[]> => {
        const links = await apiService.getAll<Link[]>(`${linksByBiositeApi}/${biositeId}`);
        return Array.isArray(links) ? links : [];
    },

    create: (data: CreateLinkDto) => apiService.create<CreateLinkDto, Link>(linksApi, data),

    update: async (linkId: string, data: UpdateLinkDto): Promise<Link> =>
        (await apiService.update<UpdateLinkDto>(linksApi, linkId, data)) as Link,

    remove: (linkId: string) => apiService.delete(linksApi, linkId),

    reorder: (biositeId: string, links: { id: string; orderIndex: number }[]) =>
        apiService.patch(`${reorderLinksApi}/${biositeId}`, { links }),

    /** Actualiza un link del admin y lo propaga a los biosites de sus usuarios hijos. */
    updateAdminLink: (adminId: string, link: AdminLinkData) =>
        apiService.patch(`${biositesByAdminApi}/update-link/${adminId}`, {
            linkId: link.linkId,
            label: link.label,
            url: link.url,
            icon: link.icon,
            image: link.image,
            orderIndex: link.orderIndex,
            link_type: link.link_type || "regular",
        }),
};
