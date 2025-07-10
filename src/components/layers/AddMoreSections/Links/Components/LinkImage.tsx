import { useState, useEffect } from "react";
import { Link as LinkIcon } from "lucide-react";

interface LinkImageProps {
    image?: string | null;
    title: string;
    size?: "small" | "medium" | "large";
}

// Función para validar si una URL de imagen es válida
const isValidImageUrl = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;

    // Verificar data URLs (base64)
    if (url.startsWith('data:')) {
        const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
        return dataUrlRegex.test(url);
    }

    // Verificar URLs HTTP/HTTPS - Mejorar la validación
    try {
        const urlObj = new URL(url);
        const isValidProtocol = ['http:', 'https:'].includes(urlObj.protocol);
        const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
            url.includes('/img/') || // Para tu servidor
            url.includes('image-'); // Para archivos con formato image-*

        return isValidProtocol && (hasValidExtension || !urlObj.pathname.includes('.'));
    } catch {
        return false;
    }
};

// Componente mejorado para renderizar la imagen del enlace
const LinkImage = ({ image, title, size = "small" }: LinkImageProps) => {
    const sizeClasses = {
        small: "w-8 h-8",
        medium: "w-12 h-12",
        large: "w-full h-16"
    };

    const iconSizes = {
        small: 16,
        medium: 20,
        large: 24
    };

    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Reset error state when image changes
    useEffect(() => {
        if (image) {
            setImageError(false);
            setIsLoading(true);
        }
    }, [image]);

    const handleImageLoad = () => {
        console.log("Image loaded successfully:", image);
        setIsLoading(false);
        setImageError(false);
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        console.error("Error loading image:", image, e);
        setIsLoading(false);
        setImageError(true);
    };

    console.log("LinkImage render:", {
        image,
        imageError,
        isLoading,
        isValid: isValidImageUrl(image)
    });

    if (!image || !isValidImageUrl(image) || imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 border border-blue-200`}>
                <LinkIcon
                    size={iconSizes[size]}
                    className="text-blue-600"
                />
            </div>
        );
    }

    return (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0 relative`}>
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                </div>
            )}
            <img
                src={image}
                alt={title}
                className={`w-full h-full object-cover rounded-lg transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                crossOrigin="anonymous" // Agregar para evitar problemas CORS
            />
        </div>
    );
};

export default LinkImage;
