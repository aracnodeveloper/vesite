// === AppPage.tsx ===
import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext";

const AppPage = () => {
    const handleBackClick = () => window.history.back();
    const {
        appLinks,
        updateAppLink,
        addAppLink,
    } = usePreview();

    const [appStoreUrl, setAppStoreUrl] = useState("");
    const [googlePlayUrl, setGooglePlayUrl] = useState("");

    useEffect(() => {
        const appStore = appLinks.find(link => link.store === "appstore");
        const googlePlay = appLinks.find(link => link.store === "googleplay");
        if (appStore) setAppStoreUrl(appStore.url);
        if (googlePlay) setGooglePlayUrl(googlePlay.url);
    }, [appLinks]);

    const handleSave = async () => {
        const appStore = appLinks.find(link => link.store === "appstore");
        const googlePlay = appLinks.find(link => link.store === "googleplay");

        if (appStore) {
            await updateAppLink(appStore.id, { url: appStoreUrl, isActive: true });
        } else if (appStoreUrl) {
            await addAppLink({ store: "appstore", url: appStoreUrl, isActive: true });
        }

        if (googlePlay) {
            await updateAppLink(googlePlay.id, { url: googlePlayUrl, isActive: true });
        } else if (googlePlayUrl) {
            await addAppLink({ store: "googleplay", url: googlePlayUrl, isActive: true });
        }

        alert("Enlaces actualizados correctamente");
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
                            Enlaces de descarga
                        </h1>
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-12 space-y-8 w-full">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-lg">
                        <img src="/src/assets/img/img_7.png" alt="App Logo" />
                    </div>
                    <h2 className="font-bold text-black text-xl">VisitaEcuador</h2>
                    <p className="text-gray-600 text-sm">
                        Añade o actualiza los enlaces de tu aplicación móvil para que tus usuarios puedan descargarla fácilmente.
                    </p>
                </div>

                <div className="w-full max-w-md space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">App Store URL</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md text-sm"
                            placeholder="https://apps.apple.com/..."
                            value={appStoreUrl}
                            onChange={(e) => setAppStoreUrl(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Google Play URL</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border rounded-md text-sm"
                            placeholder="https://play.google.com/store/apps/..."
                            value={googlePlayUrl}
                            onChange={(e) => setGooglePlayUrl(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AppPage;