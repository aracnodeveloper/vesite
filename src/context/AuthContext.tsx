// Auth Fixes + Rutas y guardado de perfil actualizado

import { type FC, type ReactNode, useState, useEffect } from 'react';
import Cookie from 'js-cookie';
import type { LoginParams } from "../types/authTypes.ts";
import type { AuthResponse } from "../interfaces/Auth.ts";
import { AuthContext } from '../hooks/useAuthContext.ts';
import apiService from "../service/apiService.ts";
import { loginApi, updateBiositeApi } from "../constants/EndpointsRoutes.ts";
import notificationService from "../service/notificationService.ts";

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const token = Cookie.get('accessToken');
        const uid = Cookie.get('userId');
        const roleName = Cookie.get('roleName');

        if (token && uid && roleName) {
            setIsAuthenticated(true);
            setAccessToken(token);
            setUserId(uid);
            setRole(roleName);
        }
    }, []);

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
        } catch (error: any) {
            console.error('Login error:', error);
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

// Hook para actualizar perfil
export const useUpdateProfile = () => {
    const { userId } = React.useContext(AuthContext);

    const updateProfile = async (data: {
        title?: string;
        slug?: string;
        avatarImage?: string;
        themeId?: string;
    }) => {
        if (!userId) return;
        return await apiService.update(updateBiositeApi, userId, data);
    };

    return { updateProfile };
};
