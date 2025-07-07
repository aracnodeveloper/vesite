import type {BiositeColors} from "./Biosite.ts";

export interface CreateBiositeDto {
    ownerId: string;
    title: string;
    slug: string;
    themeId?: string;
    colors?: string | BiositeColors;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    isActive?: boolean;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
    parentId?: string;
}

export interface CreatedUser {
    id: string;
    email: string;
    name?: string;
    parentId?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}