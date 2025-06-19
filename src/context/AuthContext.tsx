import type {FC, ReactNode} from 'react';
import {useState}from 'react'
import Cookie from 'js-cookie';
import type {LoginParams} from "../types/authTypes.ts";
import type {AuthResponse} from "../interfaces/Auth.ts";
import {AuthContext} from '../hooks/useAuthContext.ts'
import apiService from "../service/apiService.ts";
import {loginApi} from "../constants/EndpointsRoutes.ts";
import notificationService from "../service/notificationService.ts";

export const AuthProvider: FC<{ children: ReactNode }> = ({children}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [biositeId, setBiositeId] = useState<string | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [roleName, setRoleName] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            const data = {email: email, password: password}
            const responseData = await apiService.createReqRes<LoginParams, AuthResponse>(loginApi, data)


            console.log('🔍 Server response:', responseData);
            console.log('🔍 RoleName from response:', responseData.roleName);

            const {accessToken, refreshToken, userId, roleName, biositeId} = responseData;


            console.log('🔍 RoleName after destructuring:', roleName);
            console.log('🔍 RoleName type:', typeof roleName);

            // Verificar que roleName existe
            if (!roleName) {
                console.error('❌ No role information received from server');
                throw new Error('No role information received from server');
            }


            const userRole = roleName as string;


            console.log('🔍 userRole before saving:', userRole);
            console.log('🔍 userRole type:', typeof userRole);
            console.log('🔍 userRole length:', userRole?.length);

            const accessExpirationDate = new Date();
            const refreshExpirationDate = new Date();
            accessExpirationDate.setDate(accessExpirationDate.getDate() + 2);
            refreshExpirationDate.setDate(refreshExpirationDate.getDate() + 7);

            Cookie.set('accessToken', accessToken, { expires: accessExpirationDate });
            Cookie.set('refreshToken', refreshToken, { expires: refreshExpirationDate });
            Cookie.set('userId', userId, { expires: refreshExpirationDate});


            console.log('🔍 About to save roleName cookie with value:', userRole);
            Cookie.set('roleName', userRole, { expires: refreshExpirationDate });

            console.log('🔍 Cookie saved, reading it back:', Cookie.get('roleName'));

            Cookie.set('biositeId', biositeId, { expires: refreshExpirationDate});


            console.log('🍪 Cookies saved:');
            console.log('  - accessToken:', Cookie.get('accessToken') ? 'SET' : 'NOT SET');
            console.log('  - userId:', Cookie.get('userId'));
            console.log('  - roleName:', Cookie.get('roleName'));
            console.log('  - biositeId:', Cookie.get('biositeId'));

            setIsAuthenticated(true);
            setUserId(userId);
            setBiositeId(biositeId);
            setAccessToken(accessToken);
            setRoleName(userRole);


            if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
                notificationService.warning('Sudo mode', 'You are logged in as sudo, please be careful');
            }

            return {success: true};

        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response) {
                console.error('Error in server response:', error.response.data);
            } else if (error.request) {
                console.error('No response from server:', error.request);
            } else {
                console.error('Error while setting up the request', error.message);
            }

            return {success: false};
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
            Cookie.remove('biositeId');
            setIsAuthenticated(false);
            setUserId(null);
            setAccessToken(null);
            setRoleName(null);
            setBiositeId(null)
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{isAuthenticated, userId,biositeId, accessToken, roleName, loading, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};