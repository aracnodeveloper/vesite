export interface BiositeUpdateDto {
    title?: string;
    slug?: string;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    themeId?: string;
    colors?: string | {
        primary: string;
        secondary: string;
    };
}
export interface Link {
    id: string;
    biositeId: string;
    label: string;
    url: string;
    icon: string;
    orderIndex: number;
    isActive: boolean;
}

export interface Owner {
    id: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN" | "SUPER_ADMIN";
    name: string | null;
    description: string | null;
    site: string | null;
    avatarUrl: string | null;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
}

export interface BiositeFull {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    themeId: string | null;
    colors: string; // stored as stringified JSON: { primary: string; secundary: string }
    fonts: string;
    avatarImage: string;
    backgroundImage: string;
    videoUrl: string;
    createdAt: string;
    updatedAt: string;
    isActive: boolean;
    links: Link[];
    owner: Owner;
}

export interface LinkItem {
    id?: string;
    label: string;
    url: string;
}

export interface SocialLink {
    id?: string;
    platform: string;
    url: string;
}

export interface DownloadItem {
    id?: string;
    label: string;
    url: string;
}
