import type {BiositeFull, BiositeUpdateDto} from "./Biosite.ts";

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

export interface PreviewContextType {
    biosite: BiositeFull | null;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    loading: boolean;
    error: string | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    refreshBiosite: () => Promise<void>;

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
