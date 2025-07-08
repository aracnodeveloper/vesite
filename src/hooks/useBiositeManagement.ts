import { useCallback } from "react";
import type { BiositeFull, BiositeUpdateDto, BiositeColors } from "../interfaces/Biosite";
import type { CreateBiositeDto } from "../interfaces/User.ts";
import Cookies from "js-cookie";

interface UseBiositeOperationsProps {
    biositeData: BiositeFull | null;
    fontFamily: string;
    themeColor: string;
    setThemeColorState: (color: string) => void;
    setFontFamilyState: (font: string) => void;
    updateBiositeHook: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    setBiosite: (biosite: BiositeFull | null) => void;
    createBiosite: (data: CreateBiositeDto) => Promise<BiositeFull | null>;
    fetchUserBiosites: () => Promise<BiositeFull[]>;
    switchBiosite: (biositeId: string) => Promise<BiositeFull | null>;
    fetchChildBiosites: (userId: string) => Promise<BiositeFull[]>;
    resetState: () => void;
}

export const useBiositeOperations = ({
                                         biositeData,
                                         fontFamily,
                                         themeColor,
                                         setThemeColorState,
                                         setFontFamilyState,
                                         updateBiositeHook,
                                         setBiosite,
                                         createBiosite,
                                         fetchUserBiosites,
                                         switchBiosite,
                                         fetchChildBiosites,
                                         resetState
                                     }: UseBiositeOperationsProps) => {

    const updateBiosite = useCallback(async (data: BiositeUpdateDto): Promise<BiositeFull | null> => {
        try {
            const result = await updateBiositeHook(data);
            if (result) {
                setBiosite(result);
            }
            return result;
        } catch (error) {
            console.error("PreviewContext: updateBiosite error:", error);
            throw error;
        }
    }, [updateBiositeHook, setBiosite]);

    const refreshBiosite = useCallback(async () => {
        try {
            if (!biositeData?.id) return;

            // Simular refresh usando el biositeData actual
            setBiosite(biositeData);
        } catch (error) {
            console.error("Error refreshing biosite:", error);
        }
    }, [biositeData, setBiosite]);

    const setThemeColor = useCallback(async (color: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }
        try {
            setThemeColorState(color);

            const colorsObject: BiositeColors = {
                primary: color,
                secondary: color,
                background: color,
                text: '#000000',
                accent: color,
                profileBackground: color
            };
            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors: JSON.stringify(colorsObject),
                fonts: biositeData.fonts || fontFamily,
                avatarImage: biositeData.avatarImage || '',
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            await updateBiosite(updateData);
        } catch (error) {
            console.error("Error updating theme color:", error);
            if (biositeData.colors) {
                const previousColor = typeof biositeData.colors === 'string'
                    ? biositeData.colors
                    : biositeData.colors.background || '#ffffff';
                setThemeColorState(previousColor);
            }
            throw error;
        }
    }, [biositeData, fontFamily, updateBiosite, setThemeColorState]);

    const setFontFamily = useCallback(async (font: string) => {
        if (!biositeData?.id) {
            throw new Error("No biosite available");
        }

        try {
            console.log("Setting font family:", font);
            setFontFamilyState(font);

            let colorsString: string;
            if (typeof biositeData.colors === 'string') {
                colorsString = biositeData.colors;
            } else {
                colorsString = JSON.stringify(biositeData.colors);
            }
            const updateData: BiositeUpdateDto = {
                ownerId: biositeData.ownerId,
                title: biositeData.title,
                slug: biositeData.slug,
                themeId: biositeData.themeId,
                colors: colorsString,
                fonts: font,
                avatarImage: biositeData.avatarImage || '',
                backgroundImage: biositeData.backgroundImage || '',
                isActive: biositeData.isActive
            };

            await updateBiosite(updateData);
        } catch (error) {
            console.error("Error updating font family:", error);
            setFontFamilyState(biositeData.fonts || 'Inter');
            throw error;
        }
    }, [biositeData, updateBiosite, setFontFamilyState]);

    const createNewBiosite = useCallback(async (data: CreateBiositeDto): Promise<BiositeFull | null> => {
        try {
            const result = await createBiosite(data);
            return result;
        } catch (error) {
            console.error("Error creating biosite:", error);
            throw error;
        }
    }, [createBiosite]);

    const getUserBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        try {
            const result = await fetchUserBiosites();
            return result;
        } catch (error) {
            console.error("Error fetching user biosites:", error);
            throw error;
        }
    }, [fetchUserBiosites]);

    const switchToAnotherBiosite = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            const result = await switchBiosite(biositeId);
            if (result) {
                setBiosite(result);

                // Guardar el userId principal antes de cambiarlo
                const currentUserId = Cookies.get('userId');
                if (currentUserId && !Cookies.get('mainUserId')) {
                    Cookies.set('mainUserId', currentUserId);
                }

                // Actualizar cookies para el nuevo biosite
                Cookies.set('activeBiositeId', biositeId);
                Cookies.set('biositeId', result.id);
                Cookies.set('userId', result.ownerId);

                // NO cambiar el rol, mantener el rol de la cuenta principal
                const mainUserRole = Cookies.get('roleName');
                if (mainUserRole) {
                    // Mantener el rol original
                    Cookies.set('roleName', mainUserRole);
                }

                resetState();
                await refreshBiosite();
            }
            return result;
        } catch (error) {
            console.error("Error switching biosite:", error);
            throw error;
        }
    }, [switchBiosite, resetState, setBiosite, refreshBiosite]);

// También agregar una función para restaurar la sesión principal:
    const switchToMainBiosite = useCallback(async (): Promise<BiositeFull | null> => {
        try {
            const mainUserId = Cookies.get('mainUserId');
            if (!mainUserId) {
                throw new Error('No se encontró el usuario principal');
            }

            // Buscar el biosite principal del usuario
            const userBiosites = await getUserBiosites();
            const mainBiosite = userBiosites.find(biosite => biosite.ownerId === mainUserId);

            if (mainBiosite) {
                return await switchToAnotherBiosite(mainBiosite.id);
            }

            throw new Error('No se encontró el biosite principal');
        } catch (error) {
            console.error("Error switching to main biosite:", error);
            throw error;
        }
    }, [switchToAnotherBiosite, getUserBiosites]);

// Función para limpiar cookies de sesión temporal
    const cleanupTempSession = useCallback(() => {
        const mainUserId = Cookies.get('mainUserId');
        if (mainUserId) {
            Cookies.set('userId', mainUserId);
            Cookies.remove('mainUserId');
        }
    }, []);

// Función mejorada para logout
    const handleLogout = useCallback(() => {
        cleanupTempSession();
        // Limpiar todas las cookies
        Cookies.remove('userId');
        Cookies.remove('biositeId');
        Cookies.remove('activeBiositeId');
        Cookies.remove('roleName');
        Cookies.remove('mainUserId');
        // Redirect o lógica de logout
    }, [cleanupTempSession]);

    const getChildBiosites = useCallback(async (): Promise<BiositeFull[]> => {
        const currentUserId = Cookies.get('userId');
        if (!currentUserId) throw new Error('No hay userId');
        return await fetchChildBiosites(currentUserId);
    }, [fetchChildBiosites]);

    // Nueva función para cargar un biosite específico por ID
    const loadBiositeById = useCallback(async (biositeId: string): Promise<BiositeFull | null> => {
        try {
            console.log('Loading biosite by ID:', biositeId);
            const result = await switchBiosite(biositeId);
            if (result) {
                setBiosite(result);
                // Actualizar cookies
                Cookies.set('activeBiositeId', biositeId);
                Cookies.set('biositeId', biositeId);
                Cookies.set('userId', result.ownerId);
                console.log('Biosite loaded successfully:', result);
            }
            return result;
        } catch (error) {
            console.error("Error loading biosite by ID:", error);
            throw error;
        }
    }, [switchBiosite, setBiosite]);

    return {
        updateBiosite,
        refreshBiosite,
        setThemeColor,
        setFontFamily,
        createBiosite: createNewBiosite,
        getUserBiosites,
        switchToAnotherBiosite,
        handleLogout,
        cleanupTempSession,
        getChildBiosites,
        loadBiositeById // Nueva función exportada
    };
};
