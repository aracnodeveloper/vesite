import type {UUID} from "./authTypes.ts";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

/** Usuario autenticado (el dueño del token), con el rol confirmado por el servidor. */
export interface SessionUser {
    id: string;
    role: string | null;
    name?: string;
    email?: string;
}

export interface AuthContextType {
    status: SessionStatus;
    isAuthenticated: boolean;
    user: SessionUser | null;
    role: string | null;
    /** true mientras se procesa un login */
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean }>;
    logout: () => void;
}

export interface AuthResponse {
    userId: UUID;
    roleName: string;
    biositeId: UUID;
    accessToken: string;
    refreshToken: string;
}
