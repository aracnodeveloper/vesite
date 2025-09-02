import { useEffect } from 'react';
import { useAuthContext } from './useAuthContext';

interface UserData {
    cedula?: string;
    id_usuario?: string;
    [key: string]: any;
}

export const useAutoLogin = () => {
    const { login, isAuthenticated } = useAuthContext();

    useEffect(() => {
        const attemptAutoLogin = async () => {
            // Si ya está autenticado, no hacer nada
            if (isAuthenticated) {
                return;
            }

            try {
                // Buscar datos del usuario en localStorage
                let userData: UserData | null = null;

                // Intentar obtener datos de diferentes posibles claves en localStorage
                const possibleKeys = [
                    'userData',
                    'user',
                    'userInfo',
                    'visitaEcuadorUser',
                    'currentUser'
                ];

                for (const key of possibleKeys) {
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                        try {
                            userData = JSON.parse(storedData);
                            if (userData?.cedula || userData?.id_usuario) {
                                break;
                            }
                        } catch (error) {
                            console.warn(`Error parsing ${key} from localStorage:`, error);
                        }
                    }
                }

                // Si no encontró en las claves comunes, buscar en todo el localStorage
                if (!userData || (!userData.cedula && !userData.id_usuario)) {
                    for (let i = 0; i < localStorage.length; i++) {
                        const key = localStorage.key(i);
                        if (key) {
                            const value = localStorage.getItem(key);
                            if (value) {
                                try {
                                    const parsed = JSON.parse(value);
                                    if (parsed && (parsed.cedula || parsed.id_usuario)) {
                                        userData = parsed;
                                        break;
                                    }
                                } catch (error) {
                                    // No es JSON válido, continuar
                                    continue;
                                }
                            }
                        }
                    }
                }

                if (!userData) {
                    console.log('No se encontraron datos de usuario en localStorage');
                    return;
                }

                // Obtener la cédula (puede estar como 'cedula' o 'id_usuario')
                const cedula = userData.ci || userData.cedula || userData.id_usuario;

                if (!cedula || typeof cedula !== 'string') {
                    console.log('No se encontró cédula válida en los datos del usuario');
                    return;
                }

                // Validar que la cédula tenga al menos 5 dígitos
                if (cedula.length < 5) {
                    console.log('La cédula debe tener al menos 5 dígitos');
                    return;
                }

                // Crear usuario y contraseña
                const usuario = cedula;
                const password = cedula.substring(0, 5);

                console.log('Intentando auto-login con cédula:', usuario);

                // Intentar hacer login
                if (login) {
                    const result = await login(usuario, password);

                    if (result.success) {
                        console.log('Auto-login exitoso');
                    } else {
                        console.log('Auto-login falló - credenciales incorrectas');
                    }
                }

            } catch (error) {
                console.error('Error en auto-login:', error);
            }
        };

        // Ejecutar el auto-login después de un pequeño delay para asegurar que el contexto esté listo
        const timeoutId = setTimeout(attemptAutoLogin, 100);

        return () => clearTimeout(timeoutId);
    }, [login, isAuthenticated]);
};

// Hook alternativo que devuelve una función para ejecutar manualmente el auto-login
export const useManualAutoLogin = () => {
    const { login } = useAuthContext();

    const executeAutoLogin = async (): Promise<{ success: boolean; message: string }> => {
        try {
            // Buscar datos del usuario en localStorage
            let userData: UserData | null = null;

            // Primero buscar en la clave específica 'datos' que contiene la estructura de VisitaEcuador
            const datosString = localStorage.getItem('datos');
            if (datosString) {
                try {
                    const datosObj = JSON.parse(datosString);
                    // Extraer los datos del usuario de la estructura anidada
                    if (datosObj?.data?.id_usuario) {
                        userData = {
                            id_usuario: datosObj.data.id_usuario,
                            cedula: datosObj.data.id_usuario // Usar id_usuario como cédula
                        };
                    }
                } catch (error) {
                    console.warn('Error parsing datos from localStorage:', error);
                }
            }

            // Si no encontró en 'datos', buscar en otras claves
            if (!userData) {
                const possibleKeys = [
                    'userData',
                    'user',
                    'userInfo',
                    'visitaEcuadorUser',
                    'currentUser'
                ];

                for (const key of possibleKeys) {
                    const storedData = localStorage.getItem(key);
                    if (storedData) {
                        try {
                            userData = JSON.parse(storedData);
                            if (userData?.cedula || userData?.id_usuario) {
                                break;
                            }
                        } catch (error) {
                            console.warn(`Error parsing ${key} from localStorage:`, error);
                        }
                    }
                }
            }

            // Como último recurso, buscar en todo el localStorage
            if (!userData || (!userData.cedula && !userData.id_usuario)) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key) {
                        const value = localStorage.getItem(key);
                        if (value) {
                            try {
                                const parsed = JSON.parse(value);
                                // Buscar en estructuras anidadas también
                                if (parsed?.data?.id_usuario) {
                                    userData = {
                                        id_usuario: parsed.data.id_usuario,
                                        cedula: parsed.data.id_usuario
                                    };
                                    break;
                                } else if (parsed && (parsed.cedula || parsed.id_usuario)) {
                                    userData = parsed;
                                    break;
                                }
                            } catch (error) {
                                continue;
                            }
                        }
                    }
                }
            }

            if (!userData) {
                return { success: false, message: 'No se encontraron datos de usuario en localStorage' };
            }

            const cedula = userData.cedula || userData.id_usuario;

            if (!cedula || typeof cedula !== 'string') {
                return { success: false, message: 'No se encontró cédula válida' };
            }

            if (cedula.length < 5) {
                return { success: false, message: 'La cédula debe tener al menos 5 dígitos' };
            }

            const usuario = cedula;
            const password = cedula.substring(0, 5);

            if (login) {
                const result = await login(usuario, password);

                if (result.success) {
                    return { success: true, message: 'Auto-login exitoso' };
                } else {
                    return { success: false, message: 'Credenciales incorrectas' };
                }
            }

            return { success: false, message: 'Función de login no disponible' };

        } catch (error) {
            console.error('Error en auto-login:', error);
            return { success: false, message: 'Error inesperado en auto-login' };
        }
    };

    return { executeAutoLogin };
};