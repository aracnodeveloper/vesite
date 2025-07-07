import type {UUID} from "../types/authTypes.ts";

export interface AuthContextType {
    isAuthenticated: boolean;
    userId: string | null;
    biositeId: string | null;
    activeBiositeId: string | null;
    accessToken: string | null;
    loading: boolean;
    roleName: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean }>;
    logout: () => void;
}

export interface AuthResponse {

    userId: UUID;
    roleName: string;
    biositeId: UUID;
    activeBiositeId: UUID;
    accessToken: string;
    refreshToken: string;

}