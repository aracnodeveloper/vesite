import type {BiositeThemeConfig} from "./Biosite.ts";

export interface ThemeCategory {
    id: string;
    name: string;
    isDark: boolean;
    isAnimated: boolean;
}

export interface FontOption {
    id: string;
    name: string;
    family: string;
}

export interface CityTheme {
    name: string;
    config: BiositeThemeConfig;
    previewUrl?: string;
}

export interface CreateCustomThemeRequest {
    name?: string;
    description?: string;
    config: BiositeThemeConfig;
}
