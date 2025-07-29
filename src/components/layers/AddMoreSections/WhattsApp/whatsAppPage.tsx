import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import { WhatsAppOutlined } from "@ant-design/icons";
import { useFetchLinks } from "../../../../hooks/useFetchLinks.ts";

interface WhatsAppLink {
    id?: string;
    phone: string;
    message: string;
    isActive: boolean;
}

const WhatsAppPage = () => {
    const {
        biosite,
    } = usePreview();
    const {
        links,
        createLink,
        updateLink,
        deleteLink,
        fetchLinks,
    } = useFetchLinks();

    const handleBackClick = () => window.history.back();

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState("");

    // Estados para el formulario
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [existingWhatsAppLink, setExistingWhatsAppLink] = useState<any>(null);

    // Buscar enlace de WhatsApp existente - mejorado
    useEffect(() => {
        if (links && Array.isArray(links)) {
            const whatsappLink = links.find(link => {
                // Buscar por múltiples criterios
                return (
                    link.icon === 'whatsapp' ||
                    link.label?.toLowerCase().includes('whatsapp') ||
                    link.url?.includes('api.whatsapp.com/send') ||
                    link.url?.includes('wa.me/') ||
                    link.url?.includes('whatsapp.com')
                );
            });

            if (whatsappLink) {
                console.log('WhatsApp link found:', whatsappLink);
                setExistingWhatsAppLink(whatsappLink);

                // Extraer teléfono y mensaje de la URL existente
                try {
                    let phoneParam = '';
                    let messageParam = '';

                    if (whatsappLink.url.includes('api.whatsapp.com/send')) {
                        const urlParams = new URLSearchParams(whatsappLink.url.split('?')[1] || '');
                        phoneParam = urlParams.get('phone') || '';
                        messageParam = urlParams.get('text') || '';
                    } else if (whatsappLink.url.includes('wa.me/')) {
                        // Formato wa.me/phone?text=message
                        const urlParts = whatsappLink.url.split('wa.me/')[1];
                        if (urlParts) {
                            const [phonePart, queryPart] = urlParts.split('?');
                            phoneParam = phonePart || '';
                            if (queryPart) {
                                const urlParams = new URLSearchParams(queryPart);
                                messageParam = urlParams.get('text') || '';
                            }
                        }
                    }

                    setPhone(phoneParam);
                    setMessage(decodeURIComponent(messageParam || ''));
                } catch (error) {
                    console.error('Error parsing WhatsApp URL:', error);
                }
            } else {
                console.log('No WhatsApp link found');
                setExistingWhatsAppLink(null);
                // No limpiar los campos aquí para mantener los datos del usuario
            }
        }
    }, [links]);

    // Función para generar la URL de WhatsApp
    const generateWhatsAppUrl = (phoneNumber: string, messageText: string): string => {
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, ''); // Limpiar caracteres no numéricos excepto +
        const encodedMessage = encodeURIComponent(messageText);
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    };

    // Función para validar número de teléfono
    const isValidPhoneNumber = (phoneNumber: string): boolean => {
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        // Validar que tenga al menos 10 dígitos y empiece con + o número
        return /^(\+?\d{10,15})$/.test(cleanPhone);
    };

    const handleSave = async () => {
        if (!biosite?.id) {
            setSaveStatus('error');
            setSaveMessage("Error: No se encontró el biosite");
            return;
        }

        // Validaciones
        if (!phone.trim()) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un número de teléfono");
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);
            return;
        }

        if (!isValidPhoneNumber(phone)) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un número de teléfono válido (ej: +593986263432)");
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);
            return;
        }

        if (!message.trim()) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un mensaje predeterminado");
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');
        setSaveMessage("");

        try {
            const whatsappUrl = generateWhatsAppUrl(phone, message);

            if (existingWhatsAppLink) {
                // Actualizar enlace existente
                const updateData = {
                    label: "WhatsApp",
                    url: whatsappUrl,
                    isActive: true,
                    icon: "whatsapp" // Asegurar que el ícono se mantenga
                };

                console.log('Updating WhatsApp link:', existingWhatsAppLink.id, updateData);
                await updateLink(existingWhatsAppLink.id, updateData);
            } else {
                // Crear nuevo enlace
                const maxOrderIndex = Math.max(...(links?.map(l => l.orderIndex) || []), -1);
                const linkData = {
                    biositeId: biosite.id,
                    label: "WhatsApp",
                    url: whatsappUrl,
                    icon: "whatsapp",
                    orderIndex: maxOrderIndex + 1,
                    isActive: true
                };

                console.log('Creating new WhatsApp link:', linkData);
                await createLink(linkData);
            }

            // Refrescar los enlaces
            if (fetchLinks) {
                await fetchLinks();
            }

            setSaveStatus('success');
            setSaveMessage("Enlace de WhatsApp actualizado correctamente");

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);

        } catch (error) {
            console.error('Error saving WhatsApp link:', error);
            setSaveStatus('error');
            setSaveMessage("Error al actualizar el enlace. Inténtalo de nuevo.");

            // Limpiar mensaje después de 5 segundos
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Función para eliminar el enlace de WhatsApp
    const handleDelete = async () => {
        if (!existingWhatsAppLink) return;

        setIsSaving(true);
        try {
            console.log('Deleting WhatsApp link:', existingWhatsAppLink.id);
            await deleteLink(existingWhatsAppLink.id);
            setExistingWhatsAppLink(null);
            setPhone("");
            setMessage("");

            if (fetchLinks) {
                await fetchLinks();
            }

            setSaveStatus('success');
            setSaveMessage("Enlace de WhatsApp eliminado correctamente");

            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);

        } catch (error) {
            console.error('Error deleting WhatsApp link:', error);
            setSaveStatus('error');
            setSaveMessage("Error al eliminar el enlace");

            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Función para previsualizar el enlace
    const handlePreview = () => {
        if (phone && message) {
            const url = generateWhatsAppUrl(phone, message);
            window.open(url, '_blank');
        }
    };

    return (
        <div className="w-full h-full mb-10 mt-14 max-w-md mx-auto rounded-lg">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>WhatsApp Api</h1>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-12 space-y-8 w-full">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <WhatsAppOutlined style={{ fontSize: '48px', color: '#25D366' }} />
                    </div>
                    <h2 className="font-bold text-black text-xl">WhatsApp Directo</h2>
                    <p className="text-gray-600 text-sm">
                        Añade tu número y el mensaje que quieres que te llegue cuando alguien haga clic en tu enlace.
                    </p>

                    {/* Mostrar estado del enlace existente */}
                    {existingWhatsAppLink && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <p className="text-green-700 text-sm font-medium">
                                ✓ Enlace de WhatsApp activo
                            </p>
                        </div>
                    )}
                </div>

                {/* Mensaje de guardado */}
                {saveMessage && (
                    <div className={`w-full max-w-md p-3 border rounded-md flex items-center gap-2 ${
                        saveStatus === 'success'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {saveStatus === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                        ) : (
                            <AlertCircle className="w-4 h-4" />
                        )}
                        <span className="text-sm">{saveMessage}</span>
                    </div>
                )}

                <div className="w-full max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Teléfono
                        </label>
                        <input
                            type="tel"
                            placeholder="Ej: +593986263432"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full bg-[#FAFFF6] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Incluye el código de país (ej: +593 para Ecuador)
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje Predeterminado
                        </label>
                        <textarea
                            placeholder="Ej: Hola, quisiera más información sobre tus servicios"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={3}
                            className="w-full bg-[#FAFFF6] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-200 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este mensaje aparecerá automáticamente cuando alguien abra WhatsApp
                        </p>
                    </div>

                    {/* Vista previa del enlace generado */}
                    {phone && message && (
                        <div className="p-3 bg-gray-50 rounded-md border">
                            <p className="text-xs text-gray-600 mb-1">Vista previa del enlace:</p>
                            <p className="text-xs text-blue-600 break-all">
                                {generateWhatsAppUrl(phone, message)}
                            </p>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={isSaving || !phone || !message}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2"/>
                                    Guardando...
                                </>
                            ) : (
                                existingWhatsAppLink ? 'Actualizar enlace' : 'Crear enlace'
                            )}
                        </button>

                        {phone && message && (
                            <button
                                onClick={handlePreview}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                            >
                                Probar
                            </button>
                        )}
                    </div>

                    {existingWhatsAppLink && (
                        <button
                            onClick={handleDelete}
                            disabled={isSaving}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                        >
                            Eliminar enlace de WhatsApp
                        </button>
                    )}
                </div>

                {/* Información adicional */}
                <div className="w-full max-w-md">
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-2">¿Cómo funciona?</h3>
                        <ul className="text-xs text-blue-700 space-y-1">
                            <li>• El enlace se agregará a tu biosite como un botón de WhatsApp</li>
                            <li>• Cuando alguien haga clic, se abrirá WhatsApp con tu número y mensaje</li>
                            <li>• Funciona tanto en dispositivos móviles como en computadoras</li>
                            <li>• El mensaje aparece pre-escrito, listo para enviar</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default WhatsAppPage;