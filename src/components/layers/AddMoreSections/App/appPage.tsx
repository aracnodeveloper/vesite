// === AppPage.tsx ===
import { useState, useEffect } from "react";
import { ChevronLeft, Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";
import {useNavigate} from "react-router-dom";

const AppPage = () => {
    const navigate = useNavigate();
    const handleBackClick = () => {
        navigate('/sections');
    };
    const {
        appLinks,
        updateAppLink,
        addAppLink,
        removeAppLink,
        loading,
        error
    } = usePreview();

    const DEFAULT_APP_STORE_URL = "https://apps.apple.com/ec/app/visitaecuador-com/id1385161516";
    const DEFAULT_GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es";

    const [appStoreUrl, setAppStoreUrl] = useState("");
    const [googlePlayUrl, setGooglePlayUrl] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [saveMessage, setSaveMessage] = useState("");

    useEffect(() => {
        const appStore = appLinks.find(link => link.store === "appstore");
        const googlePlay = appLinks.find(link => link.store === "googleplay");

        setAppStoreUrl(appStore?.url || DEFAULT_APP_STORE_URL);
        setGooglePlayUrl(googlePlay?.url || DEFAULT_GOOGLE_PLAY_URL);
    }, [appLinks]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveStatus('idle');
        setSaveMessage("");

        try {
            const appStore = appLinks.find(link => link.store === "appstore");
            const googlePlay = appLinks.find(link => link.store === "googleplay");

            if (appStore && appStoreUrl) {
                await updateAppLink(appStore.id, { url: appStoreUrl, isActive: true });
            } else if (!appStore && appStoreUrl) {
                await addAppLink({ store: "appstore", url: appStoreUrl, isActive: true });
            }

            if (googlePlay && googlePlayUrl) {
                await updateAppLink(googlePlay.id, { url: googlePlayUrl, isActive: true });
            } else if (!googlePlay && googlePlayUrl) {
                await addAppLink({ store: "googleplay", url: googlePlayUrl, isActive: true });
            }

            setSaveStatus('success');
            setSaveMessage("Enlaces actualizados correctamente");

            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 3000);

        } catch (error) {
            console.error('Error saving app links:', error);
            setSaveStatus('error');
            setSaveMessage("Error al actualizar los enlaces. Inténtalo de nuevo.");

            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 5000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteLink = async (store: 'appstore' | 'googleplay') => {
        try {
            const link = appLinks.find(link => link.store === store);
            if (link) {
                await removeAppLink(link.id);
                setSaveStatus('success');
                setSaveMessage(`Enlace de ${store === 'appstore' ? 'App Store' : 'Google Play'} eliminado`);

                if (store === 'appstore') {
                    setAppStoreUrl("");
                } else {
                    setGooglePlayUrl("");
                }

                setTimeout(() => {
                    setSaveStatus('idle');
                    setSaveMessage("");
                }, 3000);
            } else {
                if (store === 'appstore') {
                    setAppStoreUrl("");
                } else {
                    setGooglePlayUrl("");
                }
            }
        } catch (error) {
            console.error('Error deleting app link:', error);
            setSaveStatus('error');
            setSaveMessage("Error al eliminar el enlace. Inténtalo de nuevo.");

            setTimeout(() => {
                setSaveStatus('idle');
                setSaveMessage("");
            }, 5000);
        }
    };

    const isValidUrl = (url: string, type: 'appstore' | 'googleplay') => {
        if (!url) return true;

        if (type === 'appstore') {
            return url.includes('apps.apple.com') || url.includes('itunes.apple.com');
        } else {
            return url.includes('play.google.com');
        }
    };



    const resetToDefault = () => {
        setAppStoreUrl(DEFAULT_APP_STORE_URL);
        setGooglePlayUrl(DEFAULT_GOOGLE_PLAY_URL);
    };

    return (
        <div className="w-full h-full mb-10 mt-0 lg:mt-20 max-w-md mx-auto rounded-lg">
            <div className="px-6 py-4 border-b border-gray-700 sr-only sm:not-sr-only ">
                <div className="flex items-center gap-3 ">
                    <button  onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-md font-bold text-gray-800  uppercase tracking-wide text-start hover:text-white">Enlaces de Descarga</h1>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-12 space-y-8 w-full">
                <div className="text-center space-y-4">
                    <div className="w-24 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <img src="./img/img_9.png" className="h-20" alt="App Logo" />
                    </div>
                    <h2 className="font-bold text-black text-lg uppercase">Apple y Google play</h2>
                    <p className="text-gray-600 text-sm">
                        Añade o actualiza los enlaces de tu aplicación móvil para que tus usuarios puedan descargarla fácilmente.
                    </p>
                </div>

                {error && (
                    <div className="w-full max-w-md p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                    </div>
                )}

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
                            App Store URL
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                className={`w-full px-4 py-2 pr-10 border rounded-md text-sm transition-colors ${
                                    appStoreUrl && !isValidUrl(appStoreUrl, 'appstore')
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="https://apps.apple.com/..."
                                value={appStoreUrl}
                                onChange={(e) => setAppStoreUrl(e.target.value)}
                                disabled={isSaving || loading}
                            />
                            {appStoreUrl && (
                                <button
                                    onClick={() => handleDeleteLink('appstore')}
                                    disabled={isSaving || loading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Eliminar enlace de App Store"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {appStoreUrl && !isValidUrl(appStoreUrl, 'appstore') && (
                            <p className="mt-1 text-sm text-red-600">
                                La URL debe ser de la App Store (apps.apple.com)
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Google Play URL
                        </label>
                        <div className="relative">
                            <input
                                type="url"
                                className={`w-full px-4 py-2 pr-10 border rounded-md text-sm transition-colors ${
                                    googlePlayUrl && !isValidUrl(googlePlayUrl, 'googleplay')
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                }`}
                                placeholder="https://play.google.com/store/apps/..."
                                value={googlePlayUrl}
                                onChange={(e) => setGooglePlayUrl(e.target.value)}
                                disabled={isSaving || loading}
                            />
                            {googlePlayUrl && (
                                <button
                                    onClick={() => handleDeleteLink('googleplay')}
                                    disabled={isSaving || loading}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Eliminar enlace de Google Play"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {googlePlayUrl && !isValidUrl(googlePlayUrl, 'googleplay') && (
                            <p className="mt-1 text-sm text-red-600">
                                La URL debe ser de Google Play (play.google.com)
                            </p>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleSave}
                            disabled={
                                isSaving ||
                                loading ||
                                (appStoreUrl && !isValidUrl(appStoreUrl, 'appstore')) ||
                                (googlePlayUrl && !isValidUrl(googlePlayUrl, 'googleplay'))
                            }
                            className={`flex-1 py-2 px-4 rounded-md transition flex items-center justify-center gap-2 ${
                                isSaving || loading  ||
                                (appStoreUrl && !isValidUrl(appStoreUrl, 'appstore')) ||
                                (googlePlayUrl && !isValidUrl(googlePlayUrl, 'googleplay'))
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                'Guardar cambios'
                            )}
                        </button>

                        <button
                            onClick={resetToDefault}
                            disabled={isSaving || loading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Restaurar URLs por defecto"
                        >
                            Por defecto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppPage;