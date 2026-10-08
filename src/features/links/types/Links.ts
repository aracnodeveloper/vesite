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
    link_type?: string;
    isSelected?: boolean;
}

export interface CreateLinkDto {
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    description?: string;
    image?: string;
    orderIndex: number;
    isActive?: boolean;
    link_type?: string;
    isSelected?: boolean;
}

export interface UpdateLinkDto {
    label?: string;
    url?: string;
    image?: string;
    description?: string;
    icon?: string;
    orderIndex?: number;
    isActive?: boolean;
    link_type?: string;
    isSelected?: boolean;
}

/** Link que el admin propaga a los biosites de sus usuarios hijos. */
export interface AdminLinkData {
    linkId: string;
    icon: string;
    url: string;
    image?: string;
    label: string;
    link_type: string;
    orderIndex?: number;
}
