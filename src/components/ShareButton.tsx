import { useUpdateShareActions } from '../hooks/useUpdateShareActions';

const ShareButton = () => {
    const { handleShare, isSharing, canShare, shareUrl } = useUpdateShareActions();

    // Configuración del botón según el estado
    const getButtonContent = () => {
        if (!canShare) {
            return {
                text: 'No disponible',
                disabled: true,
                icon: <span>❌</span>
            };
        }

        if (isSharing) {
            return {
                text: 'Compartiendo...',
                disabled: true,
                icon: <span>⏳</span>
            };
        }

        return {
            text: 'Compartir',
            disabled: false,
            icon: <span>🔗</span>
        };
    };

    const buttonContent = getButtonContent();

    const handleClick = async () => {
        if (!canShare || isSharing) return;

        try {
            await handleShare();
        } catch (error) {
            console.error('Error al compartir:', error);
            alert('Hubo un error al compartir. Inténtalo de nuevo.');
        }
    };

    return (
        <div className="share-button-container">
            <button
                onClick={handleClick}
                disabled={buttonContent.disabled}
                className={`px-4 cursor-pointer py-2 text-xs rounded-full flex items-center space-x-1.5 transition-colors ${
                    buttonContent.disabled
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-black hover:bg-gray-100'
                }`}
                title={shareUrl || 'Compartir biosite'}
            >
                {buttonContent.icon}
                <span>{buttonContent.text}</span>
            </button>

        </div>
    );
};

export default ShareButton;
