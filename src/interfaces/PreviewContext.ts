import type {BiositeFull, BiositeUpdateDto} from "./Biosite.ts";

export interface SocialLink {
    id: string;
    name: string;
    url: string;
    icon: string;
    color: string;
}

export interface PreviewContextType {
    biosite: BiositeFull | null;
    socialLinks: SocialLink[];
    loading: boolean;
    error: string | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    refreshBiosite: () => Promise<void>;
    setSocialLinks: (links: SocialLink[]) => void;
    addSocialLink: (link: SocialLink) => Promise<void>;
    removeSocialLink: (linkId: string) => Promise<void>;
    updateSocialLink: (linkId: string, updateData: Partial<SocialLink>) => Promise<void>;
    clearError: () => void;
}