// utils/autoLogin.ts
export interface AutoLoginData {
    email: string;
    password: string;
    fullData: any;
}

export const getAutoLoginCredentials = (): AutoLoginData | null => {
    try {
        // Buscar datos en localStorage
        const storedData = localStorage.getItem('datos');
        if (!storedData) {
            console.log('No hay datos en localStorage para auto-login');
            return null;
        }

        const parsedData = JSON.parse(storedData);

        // Extraer la cédula
        const cedula = parsedData?.data?.ci;
        if (!cedula || typeof cedula !== 'string') {
            console.log('No se encontró cédula válida en localStorage');
            return null;
        }

        // Validar que la cédula tenga al menos 5 dígitos
        if (cedula.length < 5) {
            console.log('Cédula muy corta para generar contraseña');
            return null;
        }

        return {
            email: cedula,
            password: cedula.substring(0, 5),
            fullData: parsedData
        };

    } catch (error) {
        console.error('Error al obtener credenciales de auto-login:', error);
        return null;
    }
};

export const hasValidStoredCredentials = (): boolean => {
    const credentials = getAutoLoginCredentials();
    return credentials !== null;
};

export const clearStoredCredentials = (): void => {
    try {
        localStorage.removeItem('datos');
        console.log('Credenciales almacenadas eliminadas');
    } catch (error) {
        console.error('Error al eliminar credenciales:', error);
    }
};

// Hook personalizado para auto-login
import { useState, useCallback } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import Cookies from "js-cookie";

export const useAutoLogin = () => {
    const [isAutoLogging, setIsAutoLogging] = useState(false);
    const [autoLoginError, setAutoLoginError] = useState<string | null>(null);
    const { login } = useAuthContext();

    const executeAutoLogin = useCallback(async (): Promise<boolean> => {
        if (!login) {
            setAutoLoginError("Login functionality is not available.");
            return false;
        }

        const credentials = getAutoLoginCredentials();
        if (!credentials) {
            setAutoLoginError("No se encontraron credenciales para auto-login");
            return false;
        }

        try {
            setIsAutoLogging(true);
            setAutoLoginError(null);

            console.log('Ejecutando auto-login con:', {
                email: credentials.email,
                password: '***'
            });

            const response = await login(credentials.email, credentials.password);

            if (response.success) {
                const token = Cookies.get("accessToken");
                if (token) {
                    console.log('Auto-login exitoso');
                    return true;
                } else {
                    setAutoLoginError("Auto-login falló. No se encontró token.");
                    return false;
                }
            } else {
                setAutoLoginError("Auto-login falló. Credenciales inválidas.");
                return false;
            }
        } catch (error) {
            console.error("Error en auto-login:", error);
            setAutoLoginError("Error inesperado en auto-login.");
            return false;
        } finally {
            setIsAutoLogging(false);
        }
    }, [login]);

    return {
        executeAutoLogin,
        isAutoLogging,
        autoLoginError,
        hasStoredCredentials: hasValidStoredCredentials()
    };
};