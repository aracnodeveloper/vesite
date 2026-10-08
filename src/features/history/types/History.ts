export interface HistoryItem {
    id: string;
    biosite_id: string;
    title: string;
    description?: string;
    image?: string;
    mediaType: "image" | "video";
    interactions?: number;
    visuals?: number;
    isActive: boolean;
    isHighlight?: boolean;
    expiresAt?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHistoryDto {
    biosite_id: string;
    title: string;
    description?: string;
    image?: string;
    mediaType?: "image" | "video";
    interactions?: number;
    visuals?: number;
    isActive?: boolean;
    isHighlight?: boolean;
    expiresAt?: string;
}

export interface UpdateHistoryDto {
    title?: string;
    description?: string;
    image?: string;
    mediaType?: "image" | "video";
    interactions?: number;
    visuals?: number;
    isActive?: boolean;
    isHighlight?: boolean;
    expiresAt?: string;
}

export interface HighlightItem {
    id: string;
    biositeId: string;
    title: string;
    coverImage?: string;
    createdAt: string;
    updatedAt: string;
    histories: HistoryItem[];
}

export interface CreateHighlightDto {
    biositeId: string;
    title: string;
    coverImage?: string;
    historyIds: string[];
}
