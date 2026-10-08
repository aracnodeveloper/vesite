import type { BiositeFull } from "../../biosite/types/Biosite.ts";

export interface User {
    id: string;
    email: string;
    cedula?: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    site?: string;
    phone?: string;
    isActive?: boolean;
    role?: string;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface UpdateUserDto {
    name?: string;
    cedula?: string;
    email?: string;
    description?: string;
    avatarUrl?: string;
    site?: string;
    phone?: string;
    isActive?: boolean;
}

export interface CreatedUser {
    id: string;
    email: string;
    cedula?: string;
    name?: string;
    parentId?: string;
    role?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface ChildUser extends CreatedUser {
    biosites?: BiositeFull[];
}
