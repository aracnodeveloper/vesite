import Cookie from "js-cookie";

export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

/** Usuarios con acceso de administración aunque su rol no sea admin. */
const EXTRA_ADMIN_USER_IDS = ["92784deb-3a8e-42a0-91ee-cd64fb3726f5"];

export const isAdminRole = (role?: string | null): boolean =>
    role === "SUPER_ADMIN" || role === "ADMIN";

export const isExtraAdminUser = (userId?: string | null): boolean =>
    !!userId && EXTRA_ADMIN_USER_IDS.includes(userId);

export const canAccessAdmin = (role?: string | null, userId?: string | null): boolean =>
    isAdminRole(role) || isExtraAdminUser(userId);

/** userId de la sesión si el usuario es admin; si no, null. */
export const getSessionAdminId = (): string | null => {
    const userId = Cookie.get("userId");
    return isAdminRole(Cookie.get("roleName")) && userId ? userId : null;
};
