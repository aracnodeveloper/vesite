import type {BiositeFull} from "./Biosite.ts";

export interface Profile {
    id: string;
    userId: string;
    name: string;
    slug: string;
    avatar?: string;
    isActive?: boolean;
    isOwn?: boolean;
    isChild?: boolean;
}

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    profiles?: Profile[];
    currentProfile?: Profile;
    onProfileSelect?: (profile: Profile) => void;
    onCreateNewSite?: () => void;
}

export interface CreateBiositeData {
    title: string;
    slug: string;
    password: string;
}

export interface BiositeStructure {
    ownBiosites: BiositeFull[];
    childBiosites: BiositeFull[];
    allBiosites: BiositeFull[];
}