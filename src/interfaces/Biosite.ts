import type {UUID} from "../types/authTypes.ts";

export interface BiositeColors {
    primary: string;
    secondary: string;
    accent?: string;
    background?: string;
    text?: string;
    profileBackground?: string;
}

export interface BiositeThemeConfig {
    colors: BiositeColors;
    fonts: {
        primary: string;
        secondary?: string;
        third?: string;
        fourth?: string;
        fifth?: string;
        sixth?: string;
    };
    isDark: boolean;
    isAnimated: boolean;
}

export interface BiositeTheme {
    name: string;
    config: BiositeThemeConfig;
}

export interface BiositeOwner {
    id: string; // Fixed: Made id required (not optional)
    email: string;
    name?: string;
    avatar?: string;
    parentId: string;
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
    ownerId: UUID;
    title: string;
    slug: string;
    themeId: string;
    theme?: BiositeTheme; // Optional theme object with full config
    colors: string | BiositeColors;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
