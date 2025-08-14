import {createContext, useContext, useEffect, useState, useCallback, useRef} from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import type {PreviewContextType, SocialLink, RegularLink, AppLink, WhatsAppLink} from "../interfaces/PreviewContext";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useFetchLinks } from "../hooks/useFetchLinks";
import { useBiositeOperations } from "../hooks/useBiositeManagement";
import { useLinkOperations } from "../hooks/useLinksManagement";
import Cookie from "js-cookie";

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const userId = Cookie.get('userId');
    const biositeId = Cookie.get('biositeId')
    const {
        biositeData,
        loading: biositeLoading,
        error: biositeError,
        fetchBiosite,
        fetchUserBiosites,
        createBiosite,
        updateBiosite: updateBiositeHook,
        fetchChildBiosites,
        switchBiosite,
        clearError: clearBiositeError,
        resetState
    } = useFetchBiosite(userId);

    const {
        links,
        loading: linksLoading,
        error: linksError,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        getSocialLinks,
        getRegularLinks,
        clearError: clearLinksError
    } = useFetchLinks(biositeData?.id);

    const [biosite, setBiosite] = useState<BiositeFull | null>(null);
    const [socialLinks, setSocialLinksState] = useState<SocialLink[]>([]);
    const [regularLinks, setRegularLinksState] = useState<RegularLink[]>([]);
    const [appLinks, setAppLinksState] = useState<AppLink[]>([]);
    const [whatsAppLinks, setWhatsAppLinksState] = useState<WhatsAppLink[]>([]);
    const [themeColor, setThemeColorState] = useState<string>('#ffffff');
    const [themeBackColor, setThemeColorBackState] = useState<string>('#ffffff');
    const [themetextColor, setThemeColortextState] = useState<string>('#ffffff');
    const [fontFamily, setFontFamilyState] = useState<string>('Inter');
    const [initialized, setInitialized] = useState(false);
    const initializationRef = useRef<{ [key: string]: boolean }>({});

    const loading = biositeLoading || linksLoading;
    const error = biositeError || linksError;



    const getIconIdentifier = useCallback((iconPath: string): string => {
        const iconMap: { [key: string]: string } = {
            '/assets/icons/instagram.svg': 'instagram',
            '/assets/icons/tiktok.svg': 'tiktok',
            '/assets/icons/X.svg': 'twitter',
            '/assets/icons/youtube.svg': 'youtube',
            '/assets/icons/facebook.svg': 'facebook',
            '/assets/icons/twitch.svg': 'twitch',
            '/assets/icons/linkdl.svg': 'linkedin',
            '/assets/icons/snapchat.svg': 'snapchat',
            '/assets/icons/threads.svg': 'threads',
            '/assets/icons/gmail.svg': 'email',
            '/assets/icons/pinterest.svg': 'pinterest',
            '/assets/icons/spottufy.svg': 'spotify',
            '/assets/icons/discord.svg': 'discord',
            '/assets/icons/tumblr.svg': 'tumblr',
            '/assets/icons/whatsapp.svg': 'whatsapp',
            '/assets/icons/telegram.svg': 'telegram',
            '/assets/icons/amazon.svg': 'amazon',
            '/assets/icons/onlyfans.svg': 'onlyfans',
            '/assets/icons/appstore.svg': 'appstore',
            '/assets/icons/googleplay.svg': 'googleplay'
        };

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    }, []);

    const isAppStoreLink = useCallback((link: any): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return (
            labelLower.includes('app store') ||
            labelLower.includes('appstore') ||
            urlLower.includes('apps.apple.com') ||
            labelLower.includes('google play') ||
            labelLower.includes('googleplay') ||
            urlLower.includes('play.google.com')
        );
    }, []);

    {/* */}
        const isWhatsAppLink = useCallback((link: any): boolean => {
            const urlLower = link.url?.toLowerCase() || '';
            const icon = link.icon?.toLowerCase() || '';

            return (
                icon === 'whatsapp' ||
                urlLower.includes('api.whatsapp.com')
            );
        }, [])



    const getStoreType = useCallback((link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    }, []);

    {/*  */ }
    const parseWhatsAppFromUrl = useCallback((url: string, label?: string): { phone: string; message: string; description: string } => {
        try {
            let phone = '';
            let message = '';
            let description = label || 'WhatsApp';

            if (url.includes('api.whatsapp.com/send')) {
                // Extraer parámetros de la URL de WhatsApp API
                const urlParams = new URLSearchParams(url.split('?')[1] || '');
                phone = urlParams.get('phone') || '';
                message = decodeURIComponent(urlParams.get('text') || '');

                // Si hay label, usarlo como descripción, sino usar WhatsApp por defecto
                description = label || 'WhatsApp';

            }

            phone = phone.replace(/[^\d+]/g, '');

            if (message) {
                try {
                    let decodedMessage = message;
                    let previousMessage = '';

                    while (decodedMessage !== previousMessage) {
                        previousMessage = decodedMessage;
                        decodedMessage = decodeURIComponent(decodedMessage);
                    }

                    message = decodedMessage;
                } catch (decodeError) {
                    console.warn('Error decoding message:', decodeError);
                }
            }

            return { phone, message, description };
        } catch (error) {
            console.error('Error parsing WhatsApp URL:', error);
            return {
                phone: '',
                message: '',
                description: label || 'WhatsApp'
            };
        }
    }, []);


    // Función para obtener app links desde los links generales
    const getAppLinks = useCallback(() => {
        return links
            .filter(isAppStoreLink)
            .map(link => ({
                id: link.id,
                store: getStoreType(link),
                url: link.url,
                isActive: link.isActive
            }));
    }, [links, isAppStoreLink, getStoreType]);
    {/**/}
    const getWhatsAppLinks = useCallback(() => {
        return links
            .filter(isWhatsAppLink)
            .map(link => {
                const { phone, message, description } = parseWhatsAppFromUrl(link.url, link.label);
                return {
                    id: link.id,
                    phone,
                    message,
                    description, // Ahora incluye la descripción
                    isActive: link.isActive
                };
            });
        }, [links, isWhatsAppLink, parseWhatsAppFromUrl]);


    // Función para obtener enlaces de música
    const getMusicEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const musicLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('music') ||
                labelLower.includes('soundcloud') ||
                urlLower.includes('open.spotify.com') ||
                urlLower.includes('music.apple.com') ||
                urlLower.includes('soundcloud.com')
            );
        });

        return musicLink || null;
    }, [links]);

    // Función para obtener posts sociales
    const getSocialPost = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const socialPostLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('post') ||
                labelLower.includes('publicacion') ||
                (urlLower.includes('instagram.com') && (urlLower.includes('/p/') || urlLower.includes('/reel/')))
            );
        });

        return socialPostLink || null;
    }, [links]);

    // Función para obtener videos
    const getVideoEmbed = useCallback(() => {
        if (!links || !Array.isArray(links)) return null;

        const videoLink = links.find(link => {
            if (!link.isActive) return false;

            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';

            return (
                labelLower.includes('video') ||
                labelLower.includes('vimeo') ||
                urlLower.includes('youtube.com/watch') ||
                urlLower.includes('vimeo.com')
            );
        });

        return videoLink || null;
    }, [links]);

    useEffect(() => {
        if (!biositeId) {
            setBiosite(null);
            setSocialLinksState([]);
            setRegularLinksState([]);
            setWhatsAppLinksState([]);
            setThemeColorBackState('#ffffff');
            setThemeColortextState('#000000');
            setFontFamilyState('Inter');
            resetState();
            initializationRef.current = {};
            return;
        }

        if (biositeId && !initializationRef.current[biositeId]) {
            initializationRef.current[biositeId] = true;
            fetchBiosite();
        }
    }, [biositeId, fetchBiosite, resetState]);

    // Simplificación de la inicialización - solo usar userId y biositeId
    useEffect(() => {
        const initializeBiosite = async () => {
            if (!userId || initialized) return;

            try {
                const biositeId = Cookie.get('biositeId');

                if (biositeId) {
                    // Cargar biosite específico por ID
                    await loadBiositeById(biositeId);
                } else {
                    // Cargar el primer biosite del usuario
                    const userBiosites = await fetchUserBiosites();
                    if (userBiosites && userBiosites.length > 0) {
                        const firstBiosite = userBiosites[0];
                        await switchBiosite(firstBiosite.id);
                        Cookie.set('biositeId', firstBiosite.id);
                    }
                }

                setInitialized(true);
            } catch (error) {
                console.error('Error initializing biosite:', error);
                setInitialized(true);
            }
        };

        initializeBiosite();
    }, [userId, initialized, fetchUserBiosites]);

    useEffect(() => {
        if (biositeData) {
            setBiosite(biositeData);

            if (biositeData.colors) {
                if (typeof biositeData.colors === 'string') {
                    setThemeColorState(biositeData.colors);
                } else if (biositeData.colors.background) {
                    setThemeColorBackState(biositeData.colors.background);
                    setThemeColortextState(biositeData.colors.text);
                }
            }

            if (biositeData.fonts && biositeData.fonts !== fontFamily) {
                console.log('Updating font from BD:', biositeData.fonts);
                setFontFamilyState(biositeData.fonts);
            }
        }
    }, [biositeData]);

    useEffect(() => {
        if (biositeData?.id) {
            fetchLinks();
        }
    }, [biositeData?.id, fetchLinks]);

    useEffect(() => {
        if (links && Array.isArray(links)) {
            console.log('Processing links:', links.length);

            const socialLinksFromAPI = getSocialLinks();
            console.log('Social links from API:', socialLinksFromAPI.length);

            // Filtrar enlaces sociales excluyendo WhatsApp y app stores
            const socialLinksFormatted = socialLinksFromAPI
                .filter(link => !isAppStoreLink(link) )
                .map(link => ({
                    id: link.id,
                    label: link.label,
                    name: link.label,
                    url: link.url,
                    icon: link.icon,
                    color: link.color,
                    isActive: link.isActive
                }));

            const regularLinksFromAPI = getRegularLinks();

            // Filtrar enlaces regulares excluyendo app stores y WhatsApp
            const regularLinksFormatted = regularLinksFromAPI
                .filter(link => !isAppStoreLink(link) )
                .map(link => ({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: link.image,
                    orderIndex: link.orderIndex,
                    isActive: link.isActive
                }));

            const appLinksFromAPI = getAppLinks();
          const whatsAppLinkFromAPI = getWhatsAppLinks();
            console.log('Processed links:', {
                social: socialLinksFormatted.length,
                regular: regularLinksFormatted.length,
                apps: appLinksFromAPI.length,
             whatsApp: whatsAppLinkFromAPI ? 'found' : 'not found'
            });

            setSocialLinksState(socialLinksFormatted);
            setRegularLinksState(regularLinksFormatted.sort((a, b) => a.orderIndex - b.orderIndex));
            setAppLinksState(appLinksFromAPI);
          setWhatsAppLinksState(whatsAppLinkFromAPI);
        }
    }, [links, getSocialLinks, getRegularLinks, getAppLinks, isAppStoreLink,getWhatsAppLinks,isWhatsAppLink, biositeData?.id]);

    const updatePreview = useCallback((data: Partial<BiositeFull>) => {
        setBiosite(prev => prev ? { ...prev, ...data } : null);
    }, []);

    const clearError = useCallback(() => {
        clearBiositeError();
        clearLinksError();
    }, [clearBiositeError, clearLinksError]);

    const biositeOperations = useBiositeOperations({
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
    });

    const { loadBiositeById } = biositeOperations;

    const linkOperations = useLinkOperations({
        biositeData,
        links,
        socialLinks,
        setSocialLinksState,
        setRegularLinksState,
        createLink,
        updateLink,
        deleteLink,
        reorderLinks,
        fetchLinks,
        getIconIdentifier
    });

    // Implementación de app links sin complejidad adicional
    const addAppLink = async (link: Omit<AppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const icon = link.store === 'appstore' ? 'appstore' : 'googleplay';
            const label = link.store === 'appstore' ? 'App Store' : 'Google Play';

            const linkData = {
                biositeId: biositeData.id,
                label,
                url: link.url,
                icon,
                orderIndex: links.length,
                isActive: link.isActive
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('App link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating app link:', error);
            throw error;
        }
    };

    const removeAppLink = async (id: string) => {
        try {
            const success = await deleteLink(id);
            if (success) {
                console.log('App link deleted successfully:', id);
            }
        } catch (error) {
            console.error('Error deleting app link:', error);
            throw error;
        }
    };

    const updateAppLink = async (id: string, data: Partial<AppLink>) => {
        try {
            const updateData: any = {};

            if (data.url !== undefined) {
                updateData.url = data.url;
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            if (data.store !== undefined) {
                updateData.icon = data.store === 'appstore' ? 'appstore' : 'googleplay';
                updateData.label = data.store === 'appstore' ? 'App Store' : 'Google Play';
            }

            const updatedLink = await updateLink(id, updateData);
            if (updatedLink) {
                console.log('App link updated successfully:', updatedLink);
            }
        } catch (error) {
            console.error('Error updating app link:', error);
            throw error;
        }
    };
    {/*  */}
    const addWhatsAppLink = async (link: Omit<WhatsAppLink, 'id'>) => {
        if (!biositeData?.id) {
            throw new Error('Biosite ID is required');
        }

        try {
            const cleanPhone = link.phone.replace(/[^\d+]/g, '');
            const encodedMessage = encodeURIComponent(link.message);
            const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

            const linkData = {
                biositeId: biositeData.id,
                label: link.description || 'WhatsApp', // Usar la descripción proporcionada
                url: whatsappUrl,
                icon: 'whatsapp',
                orderIndex: links.length,
                isActive: link.isActive
            };

            const newLink = await createLink(linkData);
            if (newLink) {
                console.log('WhatsApp link created successfully:', newLink);
            }
        } catch (error) {
            console.error('Error creating WhatsApp link:', error);
            throw error;
        }
    };


        const removeWhatsAppLink = async (id: string) => {
            try {
                const success = await deleteLink(id);
                if (success) {
                    console.log('WhatsApp link deleted successfully:', id);
                }
            } catch (error) {
                console.error('Error deleting WhatsApp link:', error);
                throw error;
            }
        };

    const updateWhatsAppLink = async (id: string, data: Partial<WhatsAppLink>) => {
        try {
            const updateData: any = {};

            if (data.phone !== undefined || data.message !== undefined) {
                const currentLink = links.find(link => link.id === id);
                if (currentLink) {
                    const currentData = parseWhatsAppFromUrl(currentLink.url, currentLink.label);

                    const phone = data.phone !== undefined ? data.phone : currentData.phone;
                    const message = data.message !== undefined ? data.message : currentData.message;

                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    const encodedMessage = encodeURIComponent(message);
                    updateData.url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
                }
            }

            if (data.isActive !== undefined) {
                updateData.isActive = data.isActive;
            }

            // Actualizar la descripción si se proporciona
            if (data.description !== undefined) {
                updateData.label = data.description;
            }

            // Si no hay descripción específica, mantener 'WhatsApp' como default
            if (!updateData.label) {
                updateData.label = 'WhatsApp';
            }

            updateData.icon = 'whatsapp';

            const updatedLink = await updateLink(id, updateData);
            if (updatedLink) {
                console.log('WhatsApp link updated successfully:', updatedLink);
            }
        } catch (error) {
            console.error('Error updating WhatsApp link:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (biositeData && biositeData.colors) {
            let parsedColors;

            if (typeof biositeData.colors === 'string') {
                try {
                    parsedColors = JSON.parse(biositeData.colors);
                } catch (e) {
                    parsedColors = { background: biositeData.colors };
                }
            } else {
                parsedColors = biositeData.colors;
            }

            // Sincronizar el themeColor con el color de fondo de la BD
            if (parsedColors.background && parsedColors.background !== themeColor) {
                console.log('Syncing theme color from BD:', parsedColors.background);
                setThemeColorBackState(parsedColors.background);
            }
            if (parsedColors.text && parsedColors.text !== themeColor) {
                console.log('Syncing theme color from BD:', parsedColors.text);
                setThemeColortextState(parsedColors.text);
            }
        }
    }, [biositeData, themeColor, themetextColor,themeBackColor]);


    const setThemeColor = useCallback(async (color: string,textColor:string, accentColor: string) => {
        try {
            setThemeColorState(color);
            setThemeColortextState(textColor)
            setThemeColorBackState(color)

            if (biositeData?.id) {
                // Preparar los colores actualizados
                let currentColors;
                try {
                    currentColors = typeof biositeData.colors === 'string'
                        ? JSON.parse(biositeData.colors)
                        : biositeData.colors || {};
                } catch (e) {
                    currentColors = {};
                }

                const updatedColors = {
                    ...currentColors,
                    background: color,
                    text: textColor,
                    accent: accentColor
                };

                // Actualizar en la base de datos
                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: JSON.stringify(updatedColors),
                    fonts: biositeData.fonts || fontFamily,
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    // Forzar actualización del estado local
                    setBiosite(prev => prev ? {
                        ...prev,
                        colors: updatedColors
                    } : null);

                    console.log('Theme color updated successfully:', color);
                }
            }
        } catch (error) {
            console.error('Error updating theme color:', error);
            // Revertir el estado si hay error
            setThemeColorState(prevColor => prevColor);
            setThemeColorBackState(prevColor => prevColor);
            setThemeColortextState(prevColor => prevColor);
            throw error;
        }
    }, [biositeData, fontFamily, updateBiositeHook, setBiosite]);

    // FIXED: Implementar setFontFamily correctamente
    const setFontFamily = useCallback(async (font: string) => {
        try {
            console.log('Setting font family to:', font);
            setFontFamilyState(font);

            if (biositeData?.id) {
                // Preparar los colores actuales
                let currentColors;
                try {
                    currentColors = typeof biositeData.colors === 'string'
                        ? JSON.parse(biositeData.colors)
                        : biositeData.colors || {};
                } catch (e) {
                    currentColors = {};
                }


                const updateData = {
                    ownerId: biositeData.ownerId,
                    title: biositeData.title,
                    slug: biositeData.slug,
                    themeId: biositeData.themeId,
                    colors: JSON.stringify(currentColors),
                    fonts: font,
                    backgroundImage: biositeData.backgroundImage || '',
                    isActive: biositeData.isActive
                };

                const updatedBiosite = await updateBiositeHook(updateData);

                if (updatedBiosite) {
                    // Forzar actualización del estado local
                    setBiosite(prev => prev ? {
                        ...prev,
                        fonts: font
                    } : null);

                    console.log('Font family updated successfully:', font);
                }
            }
        } catch (error) {
            console.error('Error updating font family:', error);
            // Revertir el estado si hay error
            setFontFamilyState(prevFont => prevFont);
            throw error;
        }
    }, [biositeData, updateBiositeHook, setBiosite]);

    const contextValue: PreviewContextType = {
        biosite,
        socialLinks,
        regularLinks,
        appLinks,
        whatsAppLinks,
        loading,
        error,
        themeColor,
        fontFamily,
        setFontFamily,
        setThemeColor,
        updatePreview,
        clearError,
        getMusicEmbed,
        getSocialPost,
        getVideoEmbed,
        ...biositeOperations,
        ...linkOperations,
        setAppLinks: setAppLinksState,
        addAppLink,
        removeAppLink,
        updateAppLink,
       setWhatsAppLinks: setWhatsAppLinksState,
        addWhatsAppLink,
       removeWhatsAppLink,
       updateWhatsAppLink
    };

    return (
        <PreviewContext.Provider value={contextValue}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = (): PreviewContextType => {
    const context = useContext(PreviewContext);
    if (context === undefined) {
        throw new Error('usePreview must be used within a PreviewProvider');
    }
    return context;
};