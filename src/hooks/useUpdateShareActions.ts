// hooks/useUpdateShareActions.ts
import { useState } from 'react';
import { usePreview } from '../context/PreviewContext.tsx';

export const useUpdateShareActions = () => {
    const { biosite } = usePreview();
    const [isUpdating, setIsUpdating] = useState(false);

    // Función para actualizar el live preview
    const handleUpdate = async () => {
        setIsUpdating(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            window.location.reload();
        } catch (error) {
            console.error('Error updating preview:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    // Función para compartir el slug
    const handleShare = async () => {
        if (!biosite?.slug) {
            console.warn('No slug available for sharing');
            return;
        }

        const shareUrl = `https://visitaecuador.com/vesite/Ve.site/${biosite.slug}`;

        try {
            // Verificar si el navegador soporta la Web Share API
            if (navigator.share) {
                await navigator.share({
                    title: biosite.title || 'Mi Bio Site',
                    text: `Visita mi perfil en Bio Site`,
                    url: shareUrl
                });
            } else {
                // Fallback: copiar al clipboard
                await navigator.clipboard.writeText(shareUrl);

                // Opcional: mostrar notificación
                console.log('URL copied to clipboard:', shareUrl);

                // También podrías mostrar un toast o notificación aquí
                alert('URL copiada al portapapeles');
            }
        } catch (error) {
            console.error('Error sharing:', error);

            // Fallback final: abrir en nueva ventana
            window.open(shareUrl, '_blank');
        }
    };

    return {
        isUpdating,
        handleUpdate,
        handleShare
    };
};
