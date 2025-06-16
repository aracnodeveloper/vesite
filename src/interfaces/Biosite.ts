export interface Biosite {
    title: string;
    description: string;
    avatarImage: string | null;
    backgroundImage?: string | null;
    fonts: string;
    colors: {
        primary: string;
        secondary: string;
    };
    template: number;
}
