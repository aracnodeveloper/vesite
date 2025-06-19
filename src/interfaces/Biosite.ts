export interface BiositeUpdateDto {
    title?: string;
    slug?: string;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    themeId?: string;
    colors?: string | BiositeColors;
    isActive?: boolean;
}
interface ProfileColors {
    primary: string;
    secundary: string;
}
export interface BiositeUp {
    id: string,
    ownerId: string;
    title: string;
    slug: string;
    themeId: string | null;
    colors: ProfileColors;
    fonts: string;
    avatarImage: string;

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
    colors: string | BiositeColors; // stored as stringified JSON: { primary: string; secundary: string }
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
export interface BiositeColors {
    primary: string;
    secondary: string;
    [key: string]: string; // Allow additional color properties
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
