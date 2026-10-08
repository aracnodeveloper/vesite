import apiService from "../../../core/api/apiService";
import { textBlocksApi, textBlocksByBiositeApi } from "../../../core/api/endpoints";
import { uploadService } from "../../../core/api/uploadService";
import { withBiositeChange } from "../../../core/events/biositeEvents";
import type { CreateTextBlockDto, TextBlock, UpdateTextBlockDto } from "../types/textBlocks";

export const textBlockService = {
    getByBiosite: (biositeId: string) => apiService.getById<TextBlock[]>(textBlocksByBiositeApi, biositeId),

    create: (data: CreateTextBlockDto) =>
        withBiositeChange(apiService.create<CreateTextBlockDto, TextBlock>(textBlocksApi, data)),

    update: async (blockId: string, data: UpdateTextBlockDto): Promise<TextBlock> =>
        (await withBiositeChange(apiService.update<UpdateTextBlockDto>(textBlocksApi, blockId, data))) as TextBlock,

    remove: (blockId: string) => withBiositeChange(apiService.delete(textBlocksApi, blockId)),

    uploadImage: (blockId: string, image: File | Blob) => uploadService.uploadBlockImage(image, blockId),
};
