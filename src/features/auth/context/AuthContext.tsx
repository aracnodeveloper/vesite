import type {FC, ReactNode} from 'react';
import {useEffect, useState} from 'react'
import Cookie from 'js-cookie';
import {AuthContext} from '../hooks/useAuthContext.ts'
import {authService} from "../services/authService.ts";
import type {SessionStatus, SessionUser} from "../types/Auth.ts";
import notificationService from "../../../core/notificationService.ts";
import { isAdminRole } from "../../../core/auth/session";
import { decodeTokenPayload, getAccessToken, isTokenExpired } from "../../../core/auth/token";
import { userService } from "../../user/services/userService";
import { getErrorMessage } from "../../../core/api/errors";

const SESSION_COOKIES = ['accessToken', 'refreshToken', 'userId', 'biositeId', 'mainUserId'];

/**
 * Sesión del usuario. El rol NO se guarda en cookies (se podía editar a mano):
 * se pide al servidor con el token en cada carga de la app y vive en memoria.
 */
export const AuthProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [status, setStatus] = useState<SessionStatus>('loading');
    const [user, setUser] = useState<SessionUser | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // Restaurar la sesión: identidad del token, rol confirmado por la API
    useEffect(() => {
        // Versiones anteriores guardaban el rol en una cookie; se descarta
        Cookie.remove('roleName');

        const token = getAccessToken();
        const payload = token ? decodeTokenPayload(token) : null;
        if (!payload || isTokenExpired(payload)) {
            setStatus('anonymous');
            return;
        }

        let cancelled = false;
        userService.getById(payload.id)
            .then((serverUser) => {
                if (cancelled) return;
                setUser({
                    id: serverUser.id,
                    role: serverUser.role ?? null,
                    name: serverUser.name,
                    email: serverUser.email,
                });
                setStatus('authenticated');
            })
            .catch((error) => {
                console.error('No se pudo restaurar la sesión:', error);
                if (!cancelled) setStatus('anonymous');
            });

        return () => {
            cancelled = true;
        };
    }, []);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const {accessToken, refreshToken, userId, roleName, biositeId} = await authService.login(email, password);

            const accessExpirationDate = new Date();
            const refreshExpirationDate = new Date();
            accessExpirationDate.setDate(accessExpirationDate.getDate() + 2);
            refreshExpirationDate.setDate(refreshExpirationDate.getDate() + 7);

            Cookie.set('accessToken', accessToken, { expires: accessExpirationDate });
            Cookie.set('refreshToken', refreshToken, { expires: refreshExpirationDate });
            // userId y biositeId indican qué biosite se está editando, no dan permisos
            Cookie.set('userId', userId, { expires: refreshExpirationDate});
            Cookie.set('biositeId', biositeId, { expires: refreshExpirationDate});

            setUser({ id: userId, role: roleName ?? null });
            setStatus('authenticated');

            if (isAdminRole(roleName)) {
                notificationService.warning('Sudo mode', 'You are logged in as sudo, please be careful');
            }

            return {success: true};
        } catch (error) {
            console.error('Login error:', getErrorMessage(error, 'Error al iniciar sesión'));
            return {success: false};
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        SESSION_COOKIES.forEach((name) => Cookie.remove(name));
        localStorage.removeItem('datos');
        setUser(null);
        setStatus('anonymous');
    };

    return (
        <AuthContext.Provider
            value={{
                status,
                isAuthenticated: status === 'authenticated',
                user,
                role: user?.role ?? null,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
