import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export const UnauthorizedPage = () => {
    const navigate = useNavigate();

    return (
        <Result
            status="403"
            title="Acceso denegado"
            subTitle="No tienes permisos para acceder a esta página."
            extra={
                <Button type="primary" onClick={() => navigate("/sections")}>
                    Ir al inicio
                </Button>
            }
        />
    );
};
