import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import { WhatsAppOutlined } from "@ant-design/icons";
import {useNavigate} from "react-router-dom";

const WhatsAppPage = () => {
    const {
        biosite,
        whatsAppLinks,
        addWhatsAppLink,
        updateWhatsAppLink,
        removeWhatsAppLink,
        loading,
        error
    } = usePreview();

    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate('/sections');
    };

    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState("");

    // Estados para el formulario
    const [phone, setPhone] = useState("");
    const [message, setMessage] = useState("");
    const [existingWhatsAppLink, setExistingWhatsAppLink] = useState<any>(null);

    // Efecto para manejar cambios en whatsAppLinks
    useEffect(() => {
        console.log('WhatsApp links updated:', whatsAppLinks);

        if (whatsAppLinks && whatsAppLinks.length > 0) {
            // Buscar el primer enlace (solo debe haber uno)
            const whatsAppLink = whatsAppLinks[0];
            console.log('WhatsApp link found:', whatsAppLink);
            setExistingWhatsAppLink(whatsAppLink);
            setPhone(whatsAppLink.phone || '');
            setMessage(whatsAppLink.message || '');
        } else {
            console.log('No WhatsApp links found');
            setExistingWhatsAppLink(null);
            setPhone("");
            setMessage("");
        }
    }, [whatsAppLinks]);

    // Función para validar número de teléfono
    const isValidPhoneNumber = (phoneNumber: string): boolean => {
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
        // Validar que tenga al menos 10 dígitos y empiece con + o número
        return /^(\+?\d{10,15})$/.test(cleanPhone);
    };

    // Función para limpiar y formatear el número de teléfono
    const cleanPhoneNumber = (phoneNumber: string): string => {
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');

        // Si no empieza con +, agregar +593 por defecto (Ecuador)
        if (!cleaned.startsWith('+')) {
            // Si empieza con 0, removerlo y agregar +593
            if (cleaned.startsWith('0')) {
                cleaned = '+593' + cleaned.substring(1);
            }
            // Si no tiene código de país, agregar +593
            else if (cleaned.length === 9 || cleaned.length === 10) {
                cleaned = '+593' + cleaned;
            }
            // Si ya tiene dígitos pero no +, agregarlo
            else if (!cleaned.startsWith('+')) {
                cleaned = '+' + cleaned;
            }
        }

        return cleaned;
    };

    // Función para generar la URL de WhatsApp
    const generateWhatsAppUrl = (phone: string, message: string): string => {
        const cleanPhone = cleanPhoneNumber(phone);
        const encodedMessage = encodeURIComponent(message.trim());
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    };

    const handleSave = async () => {
        if (!biosite?.id) {
            setSaveStatus('error');
            setSaveMessage("Error: No se encontró el biosite");
            return;
        }

        // Validaciones
        const trimmedPhone = phone.trim();
        const trimmedMessage = message.trim();

        if (!trimmedPhone) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un número de teléfono");
            setTimeout(() => setSaveStatus('idle'), 3000);
            return;
        }

        if (!isValidPhoneNumber(trimmedPhone)) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un número de teléfono válido (ej: +593986263432)");
            setTimeout(() => setSaveStatus('idle'), 3000);
            return;
        }

        if (!trimmedMessage) {
            setSaveStatus('error');
            setSaveMessage("Por favor, ingresa un mensaje predeterminado");
            setTimeout(() => setSaveStatus('idle'), 3000);
            return;
        }

        setIsSaving(true);
        setSaveStatus('idle');
        setSaveMessage("");

        try {
            const cleanPhone = cleanPhoneNumber(trimmedPhone);

            if (existingWhatsAppLink) {
                // Actualizar enlace existente (siempre se crea como activo)
                console.log('Updating WhatsApp link:', existingWhatsAppLink.id);
                await updateWhatsAppLink(existingWhatsAppLink.id, {
                    phone: cleanPhone,
                    message: trimmedMessage,
                    isActive: true
                });
            } else {
                // Crear nuevo enlace (siempre activo)
                console.log('Creating new WhatsApp link');
                await addWhatsAppLink({
                    phone: cleanPhone,
                    message: trimmedMessage,
                    isActive: true
                });
            }

            setSaveStatus('success');
            setSaveMessage("Enlace de WhatsApp actualizado correctamente");
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            console.error('Error saving WhatsApp link:', error);
            setSaveStatus('error');
            setSaveMessage("Error al actualizar el enlace. Inténtalo de nuevo.");
            setTimeout(() => setSaveStatus('idle'), 5000);
        } finally {
            setIsSaving(false);
        }
    };

    // Función para eliminar el enlace de WhatsApp
    const handleDelete = async () => {
        if (!existingWhatsAppLink) return;

        const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar el enlace de WhatsApp?');
        if (!confirmDelete) return;

        setIsSaving(true);
        try {
            console.log('Deleting WhatsApp link:', existingWhatsAppLink.id);
            await removeWhatsAppLink(existingWhatsAppLink.id);

            setSaveStatus('success');
            setSaveMessage("Enlace de WhatsApp eliminado correctamente");
            setTimeout(() => setSaveStatus('idle'), 3000);

        } catch (error) {
            console.error('Error deleting WhatsApp link:', error);
            setSaveStatus('error');
            setSaveMessage("Error al eliminar el enlace");
            setTimeout(() => setSaveStatus('idle'), 5000);
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

    // Verificar si hay cambios
    const hasChanges = () => {
        if (!existingWhatsAppLink) {
            return phone.trim() !== "" || message.trim() !== "";
        }

        const cleanCurrentPhone = cleanPhoneNumber(phone.trim());
        return (
            cleanCurrentPhone !== existingWhatsAppLink.phone ||
            message.trim() !== existingWhatsAppLink.message
        );
    };

    return (
        <div className="w-full h-full mb-10 mt-0 lg:mt-20 max-w-md mx-auto rounded-lg">
            <div className="px-6 py-4 border-b border-gray-700 sr-only sm:not-sr-only">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>WhatsApp Directo</h1>
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

                    {/* Mostrar estado del enlace existente - siempre activo */}
                    {existingWhatsAppLink && (
                        <div className="border rounded-md p-3 bg-green-50 border-green-200">
                            <p className="text-sm font-medium text-green-700">
                                ✓ Enlace de WhatsApp configurado
                            </p>
                        </div>
                    )}
                </div>

                {/* Mensajes de error general */}
                {error && (
                    <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

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
                            disabled={isSaving || loading}
                            className={`w-full bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border transition-colors ${
                                phone && !isValidPhoneNumber(phone)
                                    ? 'border-red-300'
                                    : 'border-gray-300'
                            }`}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Incluye el código de país (ej: +593 para Ecuador)
                        </p>
                        {phone && !isValidPhoneNumber(phone) && (
                            <p className="text-xs text-red-600 mt-1">
                                Número de teléfono inválido
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje Predeterminado
                        </label>
                        <textarea
                            placeholder="Ej: Hola, quisiera más información sobre tus servicios"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isSaving || loading}
                            rows={3}
                            className="w-full bg-white text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-300 resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Este mensaje aparecerá automáticamente cuando alguien abra WhatsApp
                        </p>
                    </div>


                    {/* Botones de acción */}
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <button
                                onClick={handleSave}
                                disabled={
                                    isSaving ||
                                    loading ||
                                    !phone.trim() ||
                                    !message.trim() ||
                                    !isValidPhoneNumber(phone) ||
                                    !hasChanges()
                                }
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

                        </div>

                        {/* Botón de eliminar para enlaces existentes */}
                        {existingWhatsAppLink && (
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving || loading}
                                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Eliminar enlace
                                </button>
                            </div>
                        )}
                    </div>
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
                            <li>• Solo puedes tener un enlace de WhatsApp a la vez</li>
                            <li>• El enlace siempre estará activo en tu biosite</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="h-10"></div>
        </div>
    );
};

export default WhatsAppPage;