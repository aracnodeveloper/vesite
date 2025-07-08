import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Globe, Building, QrCode, Download, Share2, X } from 'lucide-react';
import Cookies from 'js-cookie';

// Import del hook VCard existente
import { useBusinessCard } from '../../../hooks/useVCard';

// Interfaces
interface VCardData {
    name: string;
    title: string;
    company: string;
    email: string;
    phone: string;
    website: string;
}

interface BusinessCard {
    id: string;
    ownerId: string;
    slug: string;
    qrCodeUrl?: string;
    data?: any;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
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
}

const VCardButton: React.FC<VCardButtonProps> = ({ themeConfig, userId }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [cardData, setCardData] = useState<VCardData>({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: ''
    });

    const currentUserId = userId || Cookies.get('userId');

    // Usar el hook existente
    const {
        businessCard,
        loading,
        error,
        fetchBusinessCardByUserId
    } = useBusinessCard();

    // Obtener business card cuando se abre el modal
    useEffect(() => {
        if (isModalOpen && currentUserId) {
            fetchBusinessCardByUserId(currentUserId);
        }
    }, [isModalOpen, currentUserId]);

    // Actualizar cardData cuando cambie businessCard
    useEffect(() => {
        if (businessCard?.data) {
            try {
                const parsedData = typeof businessCard.data === 'string'
                    ? JSON.parse(businessCard.data)
                    : businessCard.data;
                setCardData(parsedData);
            } catch (error) {
                console.error('Error parsing business card data:', error);
                setCardData({
                    name: '',
                    title: '',
                    company: '',
                    email: '',
                    phone: '',
                    website: ''
                });
            }
        }
    }, [businessCard]);

    const generateVCardString = () => {
        const vcard = [
            'BEGIN:VCARD',
            'VERSION:3.0',
            `FN:${cardData.name}`,
            `TITLE:${cardData.title}`,
            `ORG:${cardData.company}`,
            `EMAIL:${cardData.email}`,
            `TEL:${cardData.phone}`,
            `URL:${cardData.website}`,
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
        a.download = `${cardData.name.replace(/\s+/g, '_')}.vcf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const shareVCard = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Tarjeta de ${cardData.name}`,
                    text: `Conecta conmigo - ${cardData.name}`,
                    url: `${window.location.origin}/vcard/${businessCard?.slug}`
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback - copiar al clipboard
            const shareUrl = `${window.location.origin}/vcard/${businessCard?.slug}`;
            navigator.clipboard.writeText(shareUrl);
            alert('Enlace copiado al portapapeles');
        }
    };

    if (!currentUserId) {
        return null;
    }

    return (
        <>
            {/* Botón VCard */}
            <div className="px-4 mb-4 cursor-pointer">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="block w-full p-4 rounded-xl text-center transition-all duration-300  relative overflow-hidden group border-2 border-gray-400 cursor-pointer"
                    style={{
                        background: `linear-gradient(135deg, ${themeConfig.colors.primary} 100%, ${themeConfig.colors.accent} 100%)`,
                        boxShadow: `0 4px 20px ${themeConfig.colors.primary}20 `
                    }}
                >
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-lg">
                            <User className="w-5 h-5 text-black" />
                        </div>
                        <div className="text-left">
                            <div className="text-black font-bold text-base" style={{ fontFamily: themeConfig.fonts.primary }}>
                                Mi Tarjeta Digital
                            </div>
                            <div className="text-black text-sm opacity-90" style={{ fontFamily: themeConfig.fonts.secondary }}>
                                Comparte tu información de contacto
                            </div>
                        </div>
                        <QrCode className="w-6 h-6 text-black ml-auto" />
                    </div>
                </button>
            </div>

            {/* Modal VCard */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: themeConfig.colors.background }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-xl font-bold" style={{ color: "black", fontFamily: themeConfig.fonts.primary }}>
                                Mi Tarjeta Digital
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={20} style={{ color: themeConfig.colors.text }} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: themeConfig.colors.primary }}></div>
                                <p style={{ color: themeConfig.colors.text }}>Cargando tarjeta...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="text-red-500 mb-4">⚠️</div>
                                <p style={{ color: themeConfig.colors.text }}>{error}</p>
                            </div>
                        ) : (
                            <>
                                {/* QR Code */}
                                {businessCard?.qrCodeUrl && (
                                    <div className="p-6 text-center" style={{ background: `linear-gradient(135deg, ${themeConfig.colors.primary}20 0%, ${themeConfig.colors.accent}20 100%)` }}>
                                        <div className="bg-white p-4 rounded-xl inline-block shadow-md">
                                            <img
                                                src={businessCard.qrCodeUrl}
                                                alt="QR Code"
                                                className="w-32 h-32 mx-auto"
                                            />
                                        </div>
                                        <p className="text-sm mt-3" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                                            Escanea para guardar mi contacto
                                        </p>
                                    </div>
                                )}

                                {/* Contact Info */}
                                <div className="p-6 space-y-4">
                                    {cardData.name && (
                                        <div className="text-center mb-6">
                                            <h3 className="text-2xl text-black font-bold" style={{ color: themeConfig.colors.text, fontFamily: themeConfig.fonts.primary }}>
                                                {cardData.name}
                                            </h3>
                                            {cardData.title && (
                                                <p className="text-sm mt-1" style={{ color: themeConfig.colors.text, opacity: 0.7 }}>
                                                    {cardData.title}
                                                </p>
                                            )}
                                            {cardData.company && (
                                                <p className="text-sm mt-1" style={{ color: themeConfig.colors.primary, fontWeight: 'bold' }}>
                                                    {cardData.company}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Contact Details */}
                                    <div className="space-y-3">
                                        {cardData.email && (
                                            <div className="flex items-center  space-x-3 p-3 rounded-lg" style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                                <Mail className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                                                <div>
                                                    <p className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>Email</p>
                                                    <a href={`mailto:${cardData.email}`} className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                                                        {cardData.email}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {cardData.phone && (
                                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                                <Phone className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                                                <div>
                                                    <p className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>Teléfono</p>
                                                    <a href={`tel:${cardData.phone}`} className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                                                        {cardData.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        )}

                                        {cardData.website && (
                                            <div className="flex items-center space-x-3 p-3 rounded-lg" style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                                <Globe className="w-5 h-5" style={{ color: themeConfig.colors.primary }} />
                                                <div>
                                                    <p className="text-xs" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>Website</p>
                                                    <a href={cardData.website} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: themeConfig.colors.text }}>
                                                        {cardData.website}
                                                    </a>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className=" border-t flex space-x-0">
                                    <button
                                        onClick={downloadVCard}
                                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 hover:shadow-md"
                                        style={{
                                            backgroundColor: themeConfig.colors.primary,
                                            color: 'black'
                                        }}
                                    >
                                        <Download size={18} />
                                        <span className="text-sm font-medium cursor-pointer">Descargar</span>
                                    </button>
                                    <button
                                        onClick={shareVCard}
                                        className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md"
                                        style={{
                                            borderColor: themeConfig.colors.primary,
                                            color: 'black'
                                        }}
                                    >
                                        <Share2 size={18} />
                                        <span className="text-sm font-medium cursor-pointer">Compartir</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default VCardButton;