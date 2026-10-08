import type { FC, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Loading from "../../../shared/ui/Loading";
import { useAuthContext } from "../hooks/useAuthContext";

interface PrivateRouteProps {
  children: ReactNode;
  /** Si se indica, además de sesión exige que el rol (confirmado por el servidor) cumpla la condición. */
  allow?: (role: string | null, userId: string | null) => boolean;
}

/**
 * Protege rutas del panel. Espera a que el servidor confirme la sesión antes
 * de decidir. Ojo: esto solo controla qué se muestra; los permisos reales
 * los tiene que aplicar la API.
 */
const PrivateRoute: FC<PrivateRouteProps> = ({ children, allow }) => {
  const { status, user, role } = useAuthContext();

  if (status === "loading") {
    return <Loading />;
  }

  // Además de la sesión, la app necesita saber qué biosite se está editando
  const hasWorkingContext = Cookies.get("userId") && Cookies.get("biositeId");

  if (status === "anonymous" || !hasWorkingContext) {
    ["accessToken", "refreshToken", "userId", "biositeId"].forEach((cookie) => Cookies.remove(cookie));
    return <Navigate to="/login" replace />;
  }

  if (allow && !allow(role, user?.id ?? null)) {
    return <Navigate to="/sections" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
