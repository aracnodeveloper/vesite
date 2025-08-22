import { useState, useEffect } from 'react';
import { useBusinessCard } from '../../../../hooks/useVCard.ts';
import { useUser } from '../../../../hooks/useUser.ts';
import { ChevronLeft, QrCode, Edit, Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";

const VCardPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
    const [isEditing, setIsEditing] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [cardData, setCardData] = useState({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        website: ''
    });

    const {
        businessCard,
        loading,
        error,
        createBusinessCard,
        fetchBusinessCardBySlug,
        fetchBusinessCardByUserId,
        updateBusinessCard,
        regenerateQRCode,
        generarBusinessQR
    } = useBusinessCard();

    const {
        user,
        loading: userLoading,
        error: userError,
        fetchUser,
        updateUser
    } = useUser();

    const currentUserId = Cookies.get('userId');

    useEffect(() => {
        const loadData = async () => {
            if (slug) {
                await fetchBusinessCardBySlug(slug);
            } else if (currentUserId) {
                await fetchBusinessCardByUserId(currentUserId);
                await fetchUser(currentUserId);
            }
            setInitialLoad(false);
        };

        loadData();
    }, [slug, currentUserId]);

    useEffect(() => {
        const syncAndUpdateCard = async () => {
            if (user && businessCard && !slug && businessCard.id && !isEditing && !loading) {
                try {
                    const parsedData = typeof businessCard.data === 'string'
                        ? JSON.parse(businessCard.data)
                        : businessCard.data || {};

                    const syncedData = {
                        ...parsedData,
                        name: parsedData.name || user.name || '',
                        phone: user.phone || parsedData.phone || '',
                        website: parsedData.website || user.site || ''
                    };

                    const hasChanges = JSON.stringify(parsedData) !== JSON.stringify(syncedData);

                    if (hasChanges) {
                        setCardData(syncedData);

                        try {
                            await updateBusinessCard(businessCard.id, {
                                ownerId: currentUserId,
                                data: JSON.stringify(syncedData),
                                isActive: true
                            });
                            console.log('Business card actualizada automáticamente con datos del usuario');
                        } catch (updateError) {
                            console.error('Error actualizando business card automáticamente:', updateError);
                        }
                    } else {

                        setCardData(syncedData);
                    }
                } catch (error) {
                    console.error('Error syncing user data with VCard:', error);
                }
            }
        };

        syncAndUpdateCard();
    }, [user?.phone, user?.name, user?.site, businessCard?.id, slug, isEditing, currentUserId, initialLoad]);

    useEffect(() => {
        const autoGenerateQR = async () => {

             if (!initialLoad && !slug && currentUserId && businessCard && !loading) {

               if (!businessCard.qrCodeUrl) {
                    try {
                        console.log('Auto-generando QR code...');
                        await regenerateQRCode(currentUserId);
                    } catch (error) {
                        console.error('Error auto-generando QR:', error);

                        try {
                            await generarBusinessQR(currentUserId);
                        } catch (fallbackError) {
                            console.error('Error en fallback QR:', fallbackError);
                        }
                    }
                }
            }
        };

        autoGenerateQR();
    }, [businessCard, initialLoad, slug, currentUserId, loading]);

    useEffect(() => {
        if (businessCard?.data && !user) {

            try {
                const parsedData = typeof businessCard.data === 'string'
                    ? JSON.parse(businessCard.data)
                    : businessCard.data;
                setCardData(parsedData);
            } catch (error) {
                console.error('Error parsing business card data:', error);
                setCardData(businessCard.data || {
                    name: '', title: '', company: '', email: '', phone: '', website: ''
                });
            }
        }
    }, [businessCard, user]);

    const handleCreateCard = async () => {
        try {
            await createBusinessCard(currentUserId);

            setTimeout(async () => {
                try {
                    await regenerateQRCode(currentUserId);
                } catch (error) {
                    console.error('Error generando QR después de crear tarjeta:', error);
                    // Fallback
                    try {
                        await generarBusinessQR(currentUserId);
                    } catch (fallbackError) {
                        console.error('Error en fallback después de crear tarjeta:', fallbackError);
                    }
                }
            }, 500);
        } catch (error) {
            console.error('Error creating business card:', error);
        }
    };

    const handleSave = async () => {
        if (!businessCard || !currentUserId) return;

        try {
            await updateBusinessCard(businessCard.id, {
                ownerId: currentUserId,
                data: JSON.stringify(cardData),
                isActive: true
            });


            const userUpdateData: any = {};

            if (cardData.phone && cardData.phone !== user?.phone) {
                userUpdateData.phone = cardData.phone;
            }
            if (cardData.name && cardData.name !== user?.name) {
                userUpdateData.name = cardData.name;
            }
            if (cardData.website && cardData.website !== user?.site) {
                userUpdateData.site = cardData.website;
            }

            if (Object.keys(userUpdateData).length > 0 && !slug) {
                await updateUser(currentUserId, userUpdateData);
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error updating business card:', error);
        }
    };

    const handleSaveAndGenerate = async () => {
        try {
            await handleSave();
            await handleGenerate();
            setIsEditing(false);
        } catch (error) {
            console.error('Error en handleSaveAndGenerate:', error);
        }
    };

    const handleGenerate = async () => {
        try {
            await generarBusinessQR(currentUserId);
        } catch (error) {
            console.error('Error de capa 8', error);
        }
    };

    const handleRegenerateQR = async () => {
        try {
            await regenerateQRCode(currentUserId);
        } catch (error) {
            console.error('Error regenerating QR code:', error);
        }
    };

    const handleShowQR = async () => {
        try {
            await regenerateQRCode(currentUserId);
        } catch (error) {
            console.error('Error showing QR code:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setCardData(prev => ({ ...prev, [field]: value }));
    };

    const isLoading = loading || userLoading;

    const hasQRCode = businessCard?.qrCodeUrl;

     const hasCardButNoQR = businessCard && !businessCard.qrCodeUrl;

    if (isLoading && initialLoad) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-lg">Cargando...</div>
            </div>
        );
    }

    if (error && !businessCard) {
        return (
            <div className="min-h-screen bg-gray-50 p-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg p-6 text-center">
                        <h2 className="text-xl font-semibold mb-4">No tienes una V-Card</h2>
                        <p className="text-gray-600 mb-6">Crea tu primera tarjeta digital</p>
                        <button
                            onClick={handleCreateCard}
                            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                        >
                            Crear V-Card
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full mt-10 mb-10 max-w-md mx-auto rounded-lg">
            {/* Header */}
            <div className="p-4 flex items-center justify-end lg:justify-between">
                <div className="px-6 py-4 border-b border-gray-700 sr-only sm:not-sr-only">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/sections')} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                            <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                            <h1 className="text-md font-bold text-gray-800  uppercase tracking-wide text-start hover:text-white">VCard</h1>
                        </button>
                    </div>
                </div>

                {!slug && businessCard && (
                    <div className="flex space-x-2">
                        {/* Botón QR siempre visible si existe businessCard */}
                        <button
                            onClick={handleRegenerateQR}
                            className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                            title="Regenerar código QR"
                        >
                            <QrCode size={20} />
                        </button>

                        {/* Botones de editar solo aparecen si ya existe QR code */}
                        {hasQRCode && (
                            <>
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={handleSaveAndGenerate}
                                            className="flex flex-wrap items-center gap-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer"
                                            title="Guardar"
                                            disabled={isLoading}
                                        >
                                            <Save size={18} />
                                            <span className="text-xs">GUARDAR</span>
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            title="Salir"
                                            className="flex flex-wrap items-center gap-1 p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer"
                                        >
                                            <X size={20} />
                                            <span className="text-xs">CERRAR</span>
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        title="Editar"
                                        className="flex flex-wrap items-center gap-1 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                    >
                                        <Edit size={20} />
                                        <span className="text-xs">EDIT</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-400">
                    {/* QR Code Section */}
                    {hasQRCode && (
                        <div className="bg-[#E0EED5] p-6 text-center">
                            <img
                                src={businessCard.qrCodeUrl}
                                alt="QR Code"
                                className="w-32 h-32 mx-auto bg-white p-2 rounded-lg"
                            />
                            <p className="text-white text-sm mt-2">
                                Escanea para ver mi tarjeta
                            </p>
                        </div>
                    )}

                    {/* Loading state for QR generation */}
                    {!hasQRCode && loading && (
                        <div className="bg-[#E0EED5] p-6 text-center">
                            <div className="w-32 h-32 mx-auto bg-white p-2 rounded-lg flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                            </div>
                            <p className="text-white text-sm mt-2">
                                Generando QR...
                            </p>
                        </div>
                    )}

                    {/* Card Info */}
                    <div className="p-6 space-y-4">
                        {isEditing ? (
                            <>
                                <input
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={cardData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Título/Posición"
                                    value={cardData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <input
                                    type="text"
                                    placeholder="Empresa"
                                    value={cardData.company}
                                    onChange={(e) => handleInputChange('company', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={cardData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <input
                                    type="tel"
                                    placeholder="Teléfono"
                                    value={cardData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                                <input
                                    type="url"
                                    placeholder="Sitio web"
                                    value={cardData.website}
                                    onChange={(e) => handleInputChange('website', e.target.value)}
                                    className="w-full p-3 border rounded-lg"
                                />
                            </>
                        ) : (
                            <>
                                {/* Mensaje cuando el QR se está generando automáticamente */}
                                {hasCardButNoQR && loading && (
                                    <div className="text-center flex flex-col justify-center items-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                                        <p className="text-gray-600">Generando tu QR automáticamente...</p>
                                    </div>
                                )}

                                {/* Solo mostrar botón manual si hay error o no se generó automáticamente */}
                                {hasCardButNoQR && !loading && (
                                    <div className="text-center flex flex-col justify-center">
                                        <p className="text-gray-600 mb-4">Tu QR se generará automáticamente, o puedes generarlo manualmente:</p>
                                        <button
                                            onClick={handleShowQR}
                                            className="p-2 hover:bg-gray-100 rounded-lg flex flex-wrap justify-center items-center cursor-pointer mt-2"
                                            title="Generar código QR"
                                        >
                                            Mostrar mi QR
                                            <QrCode size={20} className="ml-2" />
                                        </button>
                                    </div>
                                )}

                                <div className="border-t pt-4 space-y-3">
                                    {cardData.name && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Name:</span>
                                            <span className="text-blue-500">
                                                {cardData.name}
                                            </span>
                                        </div>
                                    )}
                                    {cardData.title && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Título:</span>
                                            <span className="text-gray-700">
                                                {cardData.title}
                                            </span>
                                        </div>
                                    )}
                                    {cardData.company && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Empresa:</span>
                                            <span className="text-gray-700">
                                                {cardData.company}
                                            </span>
                                        </div>
                                    )}
                                    {cardData.email && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Email:</span>
                                            <a href={`mailto:${cardData.email}`} className="text-blue-500">
                                                {cardData.email}
                                            </a>
                                        </div>
                                    )}
                                    {cardData.phone && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Teléfono:</span>
                                            <a href={`tel:${cardData.phone}`} className="text-blue-500">
                                                {cardData.phone}
                                            </a>
                                        </div>
                                    )}
                                    {cardData.website && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Web:</span>
                                            <a
                                                href={cardData.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500"
                                            >
                                                {cardData.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    {/* User sync status */}
                    {userError && !slug && (
                        <div className="bg-yellow-50 p-4 border-t">
                            <p className="text-sm text-yellow-800">
                                Advertencia: No se pudo sincronizar con el perfil de usuario
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VCardPage;