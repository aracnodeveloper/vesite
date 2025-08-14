export interface Link {
    id: string;
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    description?: string;
    image?: string;
    isActive: boolean;
    color?: string;
    orderIndex: number;
}

export interface CreateLinkDto {
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    description?: string;
    image?:string;
    orderIndex: number;
    isActive?: boolean;
}

export interface UpdateLinkDto {
    label?: string;
    url?: string;
    image?:string;
    description?: string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
}
