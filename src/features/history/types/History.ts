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

