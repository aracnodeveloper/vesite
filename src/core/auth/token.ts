import Cookie from "js-cookie";

export interface TokenPayload {
    id: string;
    role?: string;
    exp?: number;
}

export const getAccessToken = (): string | null => {
    const token = Cookie.get("accessToken");
    return token && token !== "undefined" && token !== "null" ? token : null;
};

/**
 * Lee el payload del JWT. OJO: el navegador no puede verificar la firma, así
 * que esto solo sirve para saber *quién dice ser* el usuario; el rol real se
 * pide al servidor y los permisos los debe aplicar la API.
 */
export const decodeTokenPayload = (token: string): TokenPayload | null => {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return payload && typeof payload.id === "string" ? payload : null;
    } catch {
        return null;
    }
};

export const isTokenExpired = (payload: TokenPayload): boolean =>
    typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();
