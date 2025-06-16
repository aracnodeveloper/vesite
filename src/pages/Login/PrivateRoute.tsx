import type {FC} from 'react';
import {Navigate, type RouteProps} from 'react-router-dom';
import Cookies from 'js-cookie';

const PrivateRoute: FC<RouteProps> = ({children}) => {
    const accessToken = Cookies.get('accessToken');

    if (!accessToken || accessToken === 'undefined' || accessToken === 'null' || accessToken === '') {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('userId');
        Cookies.remove('roleName');
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};

export default PrivateRoute;
