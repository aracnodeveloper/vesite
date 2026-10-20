import Cookie from "js-cookie";
import { isAdminRole } from "../../../core/auth/session";
import { useAuthContext } from "./useAuthContext";

/**
 * Si el usuario en sesión es admin, id del usuario cuyo biosite está editando
 * (al que se aplican los cambios masivos a sus hijos). Si no es admin, null.
 */
export const useAdminTargetId = (): string | null => {
  const { role } = useAuthContext();
  const workingUserId = Cookie.get("userId");
  return isAdminRole(role) && workingUserId ? workingUserId : null;
};
