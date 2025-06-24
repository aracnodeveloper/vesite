// interfaces/Biosite.ts

export interface BiositeColors {
    primary: string;
    secondary: string;
}

export interface BiositeOwner {
    id: string;
    email: string;
    name?: string;
    avatar?: string;
}

export interface BiositeLink {
    id: string;
    biositeId: string;
    label: string;
    url: string;
    icon?: string;
    color?: string;
    isActive: boolean;
    orderIndex: number;
    createdAt: string;
    updatedAt: string;
}

export interface BiositeFull {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    themeId: string;
    colors: string | BiositeColors;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    owner?: BiositeOwner;
    links?: BiositeLink[];
}

export interface BiositeUpdateDto {

    ownerId: string;
    title: string;
    slug: string;
    themeId: string;
    colors: string | BiositeColors;
    fonts: string;
    avatarImage: string;
    backgroundImage: string;
    isActive: boolean;
}

export interface BiositeCreateDto {
    ownerId: string;
    title: string;
    slug: string;
    themeId: string;
    colors?: string;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive?: boolean;
}

export interface LinkCreateDto {
    biositeId: string;
    label: string;
    url: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    orderIndex?: number;
}

export interface LinkUpdateDto {
    label?: string;
    url?: string;
    icon?: string;
    color?: string;
    isActive?: boolean;
    orderIndex?: number;
}