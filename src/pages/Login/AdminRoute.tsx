import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import type { JSX } from "react";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
    const { role } = useAuthContext();
    return role === "admin" ? children : <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;
