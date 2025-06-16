import {createContext, useContext} from "react";
import type {AuthContextType} from "../interfaces/Auth.ts";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within the AuthContext');
    }
    return context;
}