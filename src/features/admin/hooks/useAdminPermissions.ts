import { useMemo } from "react";
import { isExtraAdminUser } from "../../../core/auth/session";

/** Qué puede ver el usuario en el panel de administración. */
export const useAdminPermissions = (role?: string, userId?: string) =>
  useMemo(() => {
    const isSpecialUser = isExtraAdminUser(userId);
    const isSuperAdmin = role === "SUPER_ADMIN";
    const isAdmin = role === "ADMIN";

    return {
      hasFullAccess: isSpecialUser || isSuperAdmin,
      hasChildBiositeAccess: isAdmin || isSpecialUser || isSuperAdmin,
      isAdmin,
      isSuperAdmin,
      isSpecialUser,
      canToggleView: isSuperAdmin || isSpecialUser,
    };
  }, [role, userId]);

export type AdminPermissions = ReturnType<typeof useAdminPermissions>;
