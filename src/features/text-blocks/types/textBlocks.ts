// interfaces/textBlocks.ts

export interface TextBlock {
    id: string;
    biositeId: string;
    title?: string;
    content: string;
    orderIndex?: number;
    style?: any;
    isActive?: boolean;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTextBlockDto {
    biositeId: string;
    title?: string;
    content: string;
    orderIndex?: number;
    style?: any;
    isActive?: boolean;
    image?: string;
}

export interface UpdateTextBlockDto {
    title?: string;
    content?: string;
    orderIndex?: number;
    style?: any;
    isActive?: boolean;
    image?: string;
}

export interface TextBlocksState {
    blocks: TextBlock[];
    loading: boolean;
    error: string | null;
}