export interface VCardData {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
}


export interface BusinessCard {
    id: string;
    ownerId: string;
    slug: string;
    qrCodeUrl?: string;
    data?: any; // JSON data
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateBusinessCardDto {
    ownerId: string;
    slug: string;
    qrCodeUrl?: string;
    data?: any;
    isActive?: boolean;
}

export interface UpdateBusinessCardDto {
    slug?: string;
    qrCodeUrl?: string;
    data?: any;
    isActive?: boolean;
}