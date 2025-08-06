// VCard.tsx - Fixed version
import React, { useState, useEffect, useCallback } from 'react';
import {Phone, Mail, Globe, QrCode, Download,  X, User, Building } from 'lucide-react';
import Cookies from 'js-cookie';
import { useBusinessCard } from '../../../hooks/useVCard';
import imgP from "../../../../public/img/img.png";
import {usePreview} from "../../../context/PreviewContext.tsx";
import {useLocation} from "react-router-dom";
import {useUser} from "../../../hooks/useUser.ts";

interface VCardData {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
}

interface VCardButtonProps {
    themeConfig: {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            profileBackground: string;
        };
        fonts: {
            primary: string;
            secondary: string;
        };
    };
    userId?: string;
    onVcardClick?: (e: React.MouseEvent) => void;
    biosite?: any;
}

const VCardButton: React.FC<VCardButtonProps> = ({
                                                     themeConfig,
                                                     userId,
                                                     onVcardClick,
                                                     biosite: biositeFromProps
                                                 }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [showQR, setShowQR] = useState(false); // Nuevo estado para controlar la visibilidad del QR

    const { biosite: biositeFromContext } = usePreview() || { biosite: null };
    const biosite = biositeFromContext || biositeFromProps;

    const location = useLocation();
    const isExposedRoute = location.pathname === '/expoced';

    const [cardData, setCardData] = useState<VCardData>({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: ''
    });

    const getCurrentUserId = useCallback(() => {
        if (userId && userId !== 'undefined' && userId.trim() !== '') {
            return userId;
        }

        const cookieUserId = Cookies.get('userId');
        if (cookieUserId && cookieUserId !== 'undefined' && cookieUserId.trim() !== '') {
            return cookieUserId;
        }

        if (biosite?.ownerId && biosite.ownerId.trim() !== 'undefined' && biosite.ownerId.trim() !== '') {
            console.log('Using biosite ownerId:', biosite.ownerId);
            return biosite.ownerId;
        }

        console.warn('No valid userId found');
        return null;
    }, [userId, biosite?.ownerId]);

    const currentUserId = getCurrentUserId();

    const {
        businessCard,
        loading,
        error,
        regenerateQRCode,
        fetchBusinessCardByUserId,
        fetchBusinessCardBySlug
    } = useBusinessCard();

    const {
        fetchUser,
    } = useUser();

    // Función memoizada para cargar datos
    const loadUserData = useCallback(async () => {
        const validUserId = getCurrentUserId();

        if (!validUserId || isDataLoaded) {
            console.log('Skipping load - userId:', validUserId, 'isDataLoaded:', isDataLoaded);
            return;
        }

        try {
            setIsDataLoaded(true);

            await fetchBusinessCardByUserId(validUserId);
            await fetchUser(validUserId);
        } catch (error) {
            console.error('Error loading user data:', error);
            setIsDataLoaded(false); // Reset en caso de error
        }
    }, [getCurrentUserId, fetchBusinessCardByUserId, fetchUser, isDataLoaded]);

    // Effect para cargar datos solo cuando se abre el modal
    useEffect(() => {
        if (isModalOpen && !isDataLoaded) {
            loadUserData();
        }
    }, [isModalOpen, isDataLoaded, loadUserData]);

    // Reset del flag cuando cambia el userId
    useEffect(() => {
        setIsDataLoaded(false);
        console.log('UserId changed, resetting data loaded flag');
    }, [currentUserId]);

    useEffect(() => {
        if (businessCard?.data) {
            try {
                console.log('Raw businessCard.data:', businessCard.data);

                const parsedData = typeof businessCard.data === 'string'
                    ? JSON.parse(businessCard.data)
                    : businessCard.data;
                setCardData(parsedData);


            } catch (error) {
                console.error('Error parsing business card data:', error);
                setCardData(businessCard.data || {
                    name: '',
                    title: '',
                    company: '',
                    email: '',
                    phone: '',
                    website: ''
                });
            }
        } else {
            console.log('No businessCard.data available');
        }
    }, [businessCard]);

    const generateVCardString = () => {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${cardData.name || 'Sin nombre'}`,
            `TITLE:${cardData.title || ''}`,
            `ORG:${cardData.company || ''}`,
            `EMAIL:${cardData.email || ''}`,
            `TEL:${cardData.phone || ''}`,
            `URL:${cardData.website || ''}`,
            'END:VCARD'
        ].join('\n');

        return vcard;
    };

    const downloadVCard = () => {
        const vcard = generateVCardString();
        const blob = new Blob([vcard], { type: 'text/vcard' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${(cardData.name || 'contacto').replace(/\s+/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // No mostrar el botón si no hay userId válido
    if (!currentUserId) {
        console.log('VCardButton: No valid userId, not rendering');
        return null;
    }

    const getAvatarImage = () => {
        if (avatarError || !biosite?.avatarImage) {
            console.log('Using default avatar - error or no image');
            return imgP;
        }

        if (typeof biosite.avatarImage === 'string' && biosite.avatarImage.trim()) {
            if (biosite.avatarImage.startsWith('data:')) {
                const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
                const isValid = dataUrlRegex.test(biosite.avatarImage);
                return isValid ? biosite.avatarImage : imgP;
            }
            try {
                new URL(biosite.avatarImage);
                return biosite.avatarImage;
            } catch {
                console.log('Invalid URL, using default');
                return imgP;
            }
        }

        console.log('No valid avatar found, using default');
        return imgP;
    };

    const handleAvatarError = () => {
        console.log('Avatar image failed to load');
        setAvatarError(true);
    };

    const handleRegenerateQR = async () => {
        const validUserId = getCurrentUserId();
        if (!validUserId) {
            console.error('No valid userId for QR regeneration');
            return;
        }

        try {
            await regenerateQRCode(validUserId);
            setShowQR(true); // Mostrar el QR después de regenerarlo
        } catch (error) {
            console.error('Error regenerating QR code:', error);
        }
    };

    const handleOpenAndGenerate = async () => {
        try {
            setIsModalOpen(true);

                await handleRegenerateQR();

        } catch (error) {
            console.error('Error en handleOpenAndGenerate:', error);
        }
    };

    // Reset cuando se cierra el modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setShowQR(false); // Reset del estado del QR
        // Opcional: resetear isDataLoaded si quieres recargar datos cada vez
        // setIsDataLoaded(false);
    };

    return (
        <>
            <div className="px-4 mb-4 cursor-pointer"
                 onClick={!isExposedRoute ? onVcardClick : undefined}
           >
                <button
                    onClick={handleOpenAndGenerate}
                    className="block w-full p-2 rounded-xl text-center  transition-all duration-300 shadow-md relative overflow-hidden group cursor-pointer"
                    style={{     backgroundColor: themeConfig.colors.accent,
                        background: themeConfig.colors.accent}}
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                        <img
                            src={getAvatarImage()}
                            className="rounded-lg w-10 h-10 xl:w-10 xl:h-10 object-cover"
                            alt="perfil"
                            onError={handleAvatarError}
                        />
                        <div className="text-left">
                            <div className="text-black font-bold text-base" style={{ fontFamily: themeConfig.fonts.primary, color: themeConfig.colors.text }}>
                                VCard
                            </div>
                        </div>
                        <QrCode className="w-6 h-6 text-black ml-auto" />
                    </div>
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold text-black" style={{ fontFamily: themeConfig.fonts.primary }}>
                                Mi Tarjeta Digital
                            </h2>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={20} className="text-gray-600" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: themeConfig.colors.primary }}></div>
                                <p className="text-gray-600">Cargando tarjeta...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="text-red-500 mb-4 text-2xl">⚠️</div>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <p className="text-sm text-gray-500">No tienes una VCard creada aún</p>
                            </div>
                        ) : (
                            <>
                                {/* QR Code - Solo se muestra si showQR es true */}
                                {showQR && businessCard?.qrCodeUrl && (
                                    <div className="p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100">
                                        <div className="bg-white p-4 rounded-xl inline-block shadow-md">
                                            <img
                                                src={businessCard.qrCodeUrl}
                                                alt="QR Code"
                                                className="w-32 h-32 mx-auto"
                                            />
                                        </div>
                                        <p className="text-sm mt-3 text-gray-600">
                                            Escanea para guardar mi contacto
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">Presiona descargar para guardar el contacto </p>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="p-6 space-y-4">
                                    {/* Header con nombre */}
                                    {/* Solo mostrar el botón "Mostrar QR" si el QR no se está mostrando */}
                                    {!showQR && (
                                        <div className="text-center flex flex-col justify-center">
                                            <button
                                                onClick={handleRegenerateQR}
                                                className="p-2 hover:bg-gray-100 rounded-lg flex flex-wrap justify-center items-center cursor-pointer mt-4"
                                                title="Generar código QR"
                                            > Mostrar QR
                                                <QrCode size={20} className="ml-2"/>
                                            </button>
                                            <p className="text-gray-500">Presiona mostrar QR para escanear o Presiona descarga para guardar el contacto</p>
                                        </div>
                                    )}

                                    {cardData.name && (
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl font-bold text-gray-800"
                                                style={{fontFamily: themeConfig.fonts.primary}}>
                                                {cardData.name}
                                            </h3>
                                            {cardData.title && (
                                                <p className="text-gray-600 mt-1">
                                                    {cardData.title}
                                                </p>
                                            )}
                                            {cardData.company && (
                                                <p className="text-sm mt-1 font-semibold"
                                                   style={{color: themeConfig.colors.primary}}>
                                                    {cardData.company}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Mensaje cuando no hay datos */}
                                    {!cardData.name && !cardData.email && !cardData.phone && !cardData.website && !cardData.title && (
                                        <div className="text-center py-8">
                                            <div className="text-gray-400 mb-3">
                                                <User size={48} className="mx-auto"/>
                                            </div>
                                            <p className="text-gray-500">Presiona mostrar QR para ver la informacion</p>
                                            <div className="text-center flex flex-col justify-center">
                                                <button
                                                    onClick={handleRegenerateQR}
                                                    className="p-2 hover:bg-gray-100 rounded-lg flex flex-wrap justify-center items-center cursor-pointer mt-4"
                                                    title="Generar código QR"
                                                > Mostrar QR
                                                    <QrCode size={20} className="ml-2"/>
                                                </button>
                                                <p className="text-gray-500">Presiona mostrar QR para escanear</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact Details */}
                                    <div className="space-y-3">
                                        {cardData.email && (
                                            <div
                                                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Mail className="w-5 h-5 text-blue-600 flex-shrink-0"/>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Email</p>
                                                    <a
                                                        href={`mailto:${cardData.email}`}
                                                        className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors break-all"
                                                    >
                                                        {cardData.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {cardData.phone && (
                                            <div
                                                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Phone className="w-5 h-5 text-green-600 flex-shrink-0"/>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                                                    <a
                                                        href={`tel:${cardData.phone}`}
                                                        className="text-sm font-medium text-gray-800 hover:text-green-600 transition-colors"
                                                    >
                                                        {cardData.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {cardData.website && (
                                            <div
                                                className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <Globe className="w-5 h-5 text-purple-600 flex-shrink-0"/>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Website</p>
                                                    <a
                                                        href={cardData.website.startsWith('http') ? cardData.website : `https://${cardData.website}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm font-medium text-gray-800 hover:text-purple-600 transition-colors break-all"
                                                    >
                                                        {cardData.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {cardData.company && (
                                            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                                                <Building className="w-5 h-5 text-orange-600 flex-shrink-0"/>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500 mb-1">Empresa</p>
                                                    <p className="text-sm font-medium text-gray-800">
                                                        {cardData.company}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {(cardData.name || cardData.email || cardData.phone) && (
                                    <div className="border-t flex">
                                        <button
                                            onClick={downloadVCard}
                                            className="flex-1 flex items-center justify-center py-4 px-4 gap-2 hover:bg-gray-50 transition-colors border-r cursor-pointer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14"><g fill="none" stroke="black" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 13.5h-1a1 1 0 0 1-1-1v-8h13v8a1 1 0 0 1-1 1h-1"/><path d="M4.5 11L7 13.5L9.5 11M7 13.5v-6M11.29 1a1 1 0 0 0-.84-.5h-6.9a1 1 0 0 0-.84.5L.5 4.5h13zM7 .5v4"/></g></svg>

                                            <span className="text-md font-medium text-gray-700">Descargar</span>
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default VCardButton;