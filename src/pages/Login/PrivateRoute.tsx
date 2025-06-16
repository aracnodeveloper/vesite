// src/components/PrivateRoute.tsx

import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import type { JSX } from "react";

interface Props {
    children: JSX.Element;
}

const PrivateRoute = ({ children }: Props) => {
    const { isAuthenticated } = useAuthContext();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoute;
