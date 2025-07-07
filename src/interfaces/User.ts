import type {UUID} from "../types/authTypes.ts";

export interface CreateBiositeDto {
    ownerId: UUID;
    title: string;
    slug: string;
    avatarImage?: string;
    backgroundImage?: string;
}

export interface CreateUserDto {
    email: string;
    password: string;
    name?: string;
    parentId?: string;
    role?: string;
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