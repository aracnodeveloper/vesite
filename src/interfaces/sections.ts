export interface Section {
    id: string;
    biositeId: string;
    titulo: string;
    icon: string;
    image?: string;
    descripcion: string;
    orderIndex: number;
    isActive?: boolean;
}

export interface CreateSectionDto {
    biositeId: string;
    titulo: string;
    icon: string;
    image?: string;
    descripcion: string;
    orderIndex: number;
}

export interface UpdateSectionDto {
    titulo?: string;
    icon?: string;
    image?: string;
    descripcion?: string;
    orderIndex?: number;
}