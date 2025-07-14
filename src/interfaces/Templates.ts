
export interface Platilla {
    id: string;
    name?: string;
    description?: string;
    previewUrl?: string;
    index?: number;
    config: any; // JSON configuration
    isActive?: boolean;
}