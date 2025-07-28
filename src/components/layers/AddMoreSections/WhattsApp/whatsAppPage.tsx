import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import {WhatsAppOutlined} from "@ant-design/icons";

const whatsAppPage = () => {
    const handleBackClick = () => window.history.back();


    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState("");



    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        setSaveMessage("");

        try {

            setSaveStatus('success');
            setSaveMessage("Enlaces actualizados correctamente");

            // Limpiar mensaje después de 3 segundos
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);

        } catch (error) {
            console.error('Error saving app links:', error);
            setSaveStatus('error');
            setSaveMessage("Error al actualizar los enlaces. Inténtalo de nuevo.");

            // Limpiar mensaje después de 5 segundos
            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const isValidUrl = (url: string, type: 'appstore' | 'googleplay') => {
        if (!url) return true; // URL vacía es válida

        if (type === 'appstore') {
            return url.includes('apps.apple.com') || url.includes('itunes.apple.com');
        } else {
            return url.includes('play.google.com');
        }
    };


    return (
        <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
            <div className="p-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1 text-black hover:text-gray-400" />
                        <h1 className="text-lg text-gray-600 font-semibold hover:text-gray-400" style={{ fontSize: "17px" }}>
                            WhatsAppApi
                        </h1>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-12 space-y-8 w-full">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <WhatsAppOutlined/>
                    </div>
                    <h2 className="font-bold text-black text-xl">WhatsAppeame</h2>
                    <p className="text-gray-600 text-sm">
                        Añade tu numero y el mensaje que quieres que te llegue.
                    </p>
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
                            Numero
                        </label>
                        <input
                            type="url"
                            placeholder="Numero"
                            className="w-full bg-[#FAFFF6] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 "
/>
                    </div>

                    <div>
                        <label className="text-xs text-gray-600 block mb-2">
                            Mensaje
                        </label>
                        <input
                            type="text"
                            placeholder="Mensaje predeterminado"
                            className="w-full bg-[#FAFFF6] text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 "

                        />
                    </div>
                    <button
                        onClick={handleSave}

                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                Guardando...
                            </>
                        ) : (
                            'Guardar cambios'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default whatsAppPage;
