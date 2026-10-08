/**
 * Reglas de rol para decidir qué se muestra en la interfaz. El rol sale de la
 * sesión (AuthContext), confirmado por el servidor; nunca de una cookie.
 */
export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

/** Usuarios con acceso de administración aunque su rol no sea admin. */
const EXTRA_ADMIN_USER_IDS = ["92784deb-3a8e-42a0-91ee-cd64fb3726f5"];

/** Usuarios que ven la entrada de Black Card en el menú. */
const BLACK_CARD_USER_IDS = ["b54a0f07-be56-48b4-8592-8d92dad6e7f2"];

export const isAdminRole = (role?: string | null): boolean =>
    role === "SUPER_ADMIN" || role === "ADMIN";

export const isExtraAdminUser = (userId?: string | null): boolean =>
    !!userId && EXTRA_ADMIN_USER_IDS.includes(userId);

export const canUseBlackCard = (userId?: string | null): boolean =>
    !!userId && BLACK_CARD_USER_IDS.includes(userId);

export const canAccessAdmin = (role?: string | null, userId?: string | null): boolean =>
    isAdminRole(role) || isExtraAdminUser(userId);
