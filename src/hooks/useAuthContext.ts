import { useContext, createContext } from "react";

export const AuthContext = createContext<null | {
    isAuthenticated: boolean;
    userId: string | null;
    accessToken: string | null;
    role: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean }>;
    logout: () => void;
}>(null);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuthContext must be used within an AuthProvider");
    }
    return context;
};


export const useAuth = () => useContext(AuthContext);
