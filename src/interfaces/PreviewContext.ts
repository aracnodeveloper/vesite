import type {BiositeFull, BiositeUpdateDto} from "./Biosite.ts";
import type {UUID} from "../types/authTypes.ts";

export interface SocialLink {
    id: string;
    label: string;
    url: string;
    icon: string;
    color: string;
    isActive: boolean;
}

export interface RegularLink {
    id: string;
    title: string;
    url: string;
    image?: string;
    orderIndex: number;
    isActive: boolean;
}


export interface CreateBiositeDto {
    ownerId: UUID;
    title: string;
    slug: string;
    password?: string;
}
export interface PreviewContextType {
    biosite: BiositeFull | null;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    loading: boolean;
    error: string | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    refreshBiosite: () => Promise<void>;

    themeColor: string;
    setThemeColor: (color: string) => Promise<void>;
    fontFamily: string;
    setFontFamily: (font: string) => Promise<void>;

    // Biosite management methods
    createBiosite: (data: CreateBiositeDto) => Promise<BiositeFull | null>;
    getUserBiosites: () => Promise<BiositeFull[]>;
    switchToAnotherBiosite: (biositeId: string) => Promise<BiositeFull | null>;
    getChildBiosites?: () => Promise<BiositeFull[]>;


    // Social links methods
    setSocialLinks: (links: SocialLink[]) => void;
    addSocialLink: (link: SocialLink) => Promise<void>;
    removeSocialLink: (linkId: string) => Promise<void>;
    updateSocialLink: (linkId: string, updateData: Partial<SocialLink>) => Promise<void>;

    // Regular links methods
    setRegularLinks: (links: RegularLink[]) => void;
    addRegularLink: (link: Omit<RegularLink, 'id'>) => Promise<void>;
    removeRegularLink: (linkId: string) => Promise<void>;
    updateRegularLink: (linkId: string, updateData: Partial<RegularLink>) => Promise<void>;
    reorderRegularLinks: (links: RegularLink[]) => Promise<void>;

    // Special content methods
    getMusicEmbed: () => any;
    setMusicEmbed: (url: string, note?: string) => Promise<void>;
    getSocialPost: () => any;
    setSocialPost: (url: string, note?: string) => Promise<void>;
    getVideoEmbed: () => any;
    setVideoEmbed: (url: string, title?: string) => Promise<void>;

    clearError: () => void;
}

