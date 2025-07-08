import  { useState, useEffect } from 'react';
import { useBusinessCard } from '../../../../hooks/useVCard.ts';
import { useUser } from '../../../../hooks/useUser.ts';
import { ChevronLeft, QrCode, Edit, Save, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from "js-cookie";

const VCardPage = () => {
    const navigate = useNavigate();
    const { slug } = useParams<{ slug?: string }>();
    const [isEditing, setIsEditing] = useState(false);
    const [cardData, setCardData] = useState({
        name: '',   title: '',
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
        if (slug) {
            fetchBusinessCardBySlug(slug);
        } else {
            fetchBusinessCardByUserId(currentUserId);

            if (currentUserId) {
                fetchUser(currentUserId);
            }
        }
    }, [slug, currentUserId]);

    useEffect(() => {
        if (businessCard?.data) {
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
    }, [businessCard]);

    const handleCreateCard = async () => {
        try {
            await createBusinessCard(currentUserId);
        } catch (error) {
            console.error('Error creating business card:', error);
        }
    };

    const handleSave = async () => {
        if (!businessCard || !currentUserId) return;

        try {

            await updateBusinessCard(businessCard.id, {
               id: Cookies.get('userId'),
                ownerId: Cookies.get('userId'),
                data: JSON.stringify(cardData),
                isActive: true
            });

            const userUpdateData: any = {};
            if (cardData.phone) {
                userUpdateData.phone = cardData.phone;
            }
            if (cardData.name) {
                userUpdateData.name = cardData.name;
            }
            if (cardData.website) {
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
        } catch (error) {
            console.error('Error en handleSaveAndGenerate:', error);
        }
    };

    const handleGenerate = async () => {
        try {
            await generarBusinessQR(currentUserId) ;
        }catch (error) {
            console.error('Error de capa 8', error);
        }
    };

    const handleRegenerateQR = async () => {
        try {
            await regenerateQRCode(currentUserId) ;
        } catch (error) {
            console.error('Error regenerating QR code:', error);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setCardData(prev => ({ ...prev, [field]: value }));
    };

    // Combinar loading states
    const isLoading = loading || userLoading;

    if (isLoading) {
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
        <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
            {/* Header */}
            <div className="  p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 cursor-pointer">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-semibold" style={{fontSize:"17px"}}>V-Card</h1>
                </div>

                {!slug && businessCard && (
                    <div className="flex space-x-2">
                        <button
                            onClick={handleRegenerateQR}
                            className="p-2 hover:bg-gray-100 rounded-lg"
                            title="Regenerar código QR"
                        >
                            <QrCode size={20} />
                        </button>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleSaveAndGenerate}
                                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                                    disabled={isLoading}
                                >
                                    <Save size={20} />
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                                >
                                    <X size={20} />
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Edit size={20} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Card Content */}
            <div className="p-4 max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-400">
                    {/* QR Code Section */}
                    {businessCard?.qrCodeUrl && (
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
                                <div className="text-center flex flex-col justify-center">


                                    <button
                                        onClick={handleRegenerateQR}
                                        className="p-2 hover:bg-gray-100 rounded-lg flex flex-wrap  justify-center items-center cursor-pointer mt-4"
                                        title="Generar código QR"
                                    >         Mostrar mi QR
                                        <QrCode size={20} className="ml-2" />
                                    </button>
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    {cardData.name && (
                                        <div className="flex items-center space-x-3">
                                            <span className="text-gray-500 text-sm">Name:</span>
                                            <a href={`mailto:${cardData.name}`} className="text-blue-500">
                                                {cardData.name}
                                            </a>
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

                    {/* Share URL */}
                    {businessCard?.slug && !slug && (
                        <div className="bg-gray-50 p-4 border-t">
                            <p className="text-sm text-gray-600 mb-2">URL de tu tarjeta:</p>
                            <div className="bg-white p-2 rounded border text-sm">
                                {`${window.location.origin}/vcard/${businessCard.slug}`}
                            </div>
                        </div>
                    )}

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