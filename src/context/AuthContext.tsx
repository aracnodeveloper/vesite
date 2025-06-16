import { type FC, type ReactNode, useState } from 'react';
import Cookie from 'js-cookie';
import type { LoginParams } from "../types/authTypes.ts";
import type { AuthResponse } from "../interfaces/Auth.ts";
import apiService from "../service/apiService.ts";
import { loginApi} from "../constants/EndpointsRoutes.ts";
import notificationService from "../service/notificationService.ts";
import {AuthContext} from "../hooks/useAuthContext.ts";



export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);



    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const data = { email, password };
            const responseData = await apiService.createReqRes<LoginParams, AuthResponse>(loginApi, data);
            const { accessToken, refreshToken, userId, roleName } = responseData;

            const accessExpirationDate = new Date();
            const refreshExpirationDate = new Date();
            accessExpirationDate.setDate(accessExpirationDate.getDate() + 2);
            refreshExpirationDate.setDate(refreshExpirationDate.getDate() + 7);

            Cookie.set('accessToken', accessToken, { expires: accessExpirationDate });
            Cookie.set('refreshToken', refreshToken, { expires: refreshExpirationDate });
            Cookie.set('userId', userId, { expires: refreshExpirationDate });
            Cookie.set('roleName', roleName[0].roleName, { expires: refreshExpirationDate });

            setIsAuthenticated(true);
            setUserId(userId);
            setAccessToken(accessToken);
            setRole(roleName[0].roleName);

            if (roleName[0].roleName === 'admin') {
                notificationService.warning('Sudo mode', 'You are logged in as sudo, please be careful');
            }

            return { success: true };
        } catch (error) {
            console.error('Login error:', error instanceof Error ? error.message : error);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            setLoading(true);
            Cookie.remove('accessToken');
            Cookie.remove('refreshToken');
            Cookie.remove('userId');
            Cookie.remove('roleName');
            setIsAuthenticated(false);
            setUserId(null);
            setAccessToken(null);
            setRole(null);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userId, accessToken, role, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

