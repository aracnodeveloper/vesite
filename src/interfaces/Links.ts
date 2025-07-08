export interface Link {
    id: string;
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    image?: string;
    isActive: boolean;
    color?: string;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateLinkDto {
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    image?:string;
    orderIndex: number;
    isActive?: boolean;
}

export interface UpdateLinkDto {
    label?: string;
    url?: string;
    image?:string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
}
