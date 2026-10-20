import apiService from "../../../core/api/apiService";
import { reorderSectionsApi, sectionsApi, sectionsByBiositeApi } from "../../../core/api/endpoints";
import { withBiositeChange } from "../../../core/events/biositeEvents";
import type { CreateSectionData, ReorderSectionData, Section } from "../types/sections";

export const sectionService = {
    getByBiosite: (biositeId: string) =>
        apiService.getAll<Section[]>(`${sectionsByBiositeApi}/${biositeId}`),

    create: (data: CreateSectionData) =>
        withBiositeChange(apiService.create<CreateSectionData, Section>(sectionsApi, data)),

    reorder: async (biositeId: string, sections: ReorderSectionData[]): Promise<Section[]> =>
        (await withBiositeChange(apiService.patch(`${reorderSectionsApi}/${biositeId}`, { sections }))) as unknown as Section[],
};
