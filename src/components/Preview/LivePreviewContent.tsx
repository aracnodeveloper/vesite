import {usePreview} from "../../context/PreviewContext.tsx";


const LivePreviewContent = () => {
    const { biosite } = usePreview();

    if (!biosite) return <div>Loading...</div>;

    const { title, avatarImage, backgroundImage, videoUrl } = biosite;

    return (
        <div className="relative w-full h-full overflow-hidden bg-gray-100">
            {/* Portada o video */}
            {videoUrl ? (
                <video src={videoUrl} autoPlay muted loop className="w-full h-60 object-cover" />
            ) : (
                <img
                    src={backgroundImage || "/placeholder-cover.png"}
                    alt="Background"
                    className="w-full h-60 object-cover"
                />
            )}

            {/* Imagen de perfil */}
            <div className="flex justify-center -mt-12">
                <img
                    src={avatarImage || "/placeholder-avatar.png"}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                />
            </div>

            {/* Nombre del perfil */}
            <div className="text-center mt-4">
                <h1 className="text-lg font-semibold">{title || "Tu nombre aquí"}</h1>
            </div>

            {/* Placeholder para links, redes, etc */}
            <div className="mt-6 px-4">
                <p className="text-center text-sm text-gray-500">Contenido dinámico...</p>
            </div>
        </div>
    );
};

export default LivePreviewContent;
