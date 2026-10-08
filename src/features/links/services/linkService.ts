import apiService from "../../../core/api/apiService";
import {
    biositesByAdminApi,
    linksApi,
    linksByBiositeApi,
    reorderLinksApi,
} from "../../../core/api/endpoints";
import { withBiositeChange } from "../../../core/events/biositeEvents";
import type { AdminLinkData, CreateLinkDto, Link, UpdateLinkDto } from "../types/Links";

export const linkService = {
    getByBiosite: async (biositeId: string): Promise<Link[]> => {
        const links = await apiService.getAll<Link[]>(`${linksByBiositeApi}/${biositeId}`);
        return Array.isArray(links) ? links : [];
    },

    create: (data: CreateLinkDto) => withBiositeChange(apiService.create<CreateLinkDto, Link>(linksApi, data)),

    update: async (linkId: string, data: UpdateLinkDto): Promise<Link> =>
        (await withBiositeChange(apiService.update<UpdateLinkDto>(linksApi, linkId, data))) as Link,

    remove: (linkId: string) => withBiositeChange(apiService.delete(linksApi, linkId)),

    reorder: (biositeId: string, links: { id: string; orderIndex: number }[]) =>
        withBiositeChange(apiService.patch(`${reorderLinksApi}/${biositeId}`, { links })),

    /** Actualiza un link del admin y lo propaga a los biosites de sus usuarios hijos. */
    updateAdminLink: (adminId: string, link: AdminLinkData) =>
        withBiositeChange(apiService.patch(`${biositesByAdminApi}/update-link/${adminId}`, {
            linkId: link.linkId,
            label: link.label,
            url: link.url,
            icon: link.icon,
            image: link.image,
            orderIndex: link.orderIndex,
            link_type: link.link_type || "regular",
        })),
};
