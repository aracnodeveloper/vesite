import React from 'react';

interface ConditionalNavButtonProps {
    isExposedRoute: boolean;
    themeConfig: {
        colors: {
            background: string;
            text: string;
            accent?: string;
        };
        fonts: {
            primary: string;
        };
    };
}

const ConditionalNavButton: React.FC<ConditionalNavButtonProps> = ({
                                                                       isExposedRoute,
                                                                       themeConfig
                                                                   }) => {
    const handleClick = () => {
        if (isExposedRoute) {
            // Si está en la ruta expuesta (preview/editor), ir al editor
            window.location.href = 'vesite/sections';
        } else {
            // Si está en la ruta pública, ir a visitaecuador.com/vesite
            window.location.href = 'https://visitaecuador.com/vesite'  ;
        }
    };

    return (
        <div className="px-3 mb-3 sm:px-4 sm:mb-4">
            <button
                onClick={handleClick}
                className="w-full flex items-center cursor-pointer justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 px-3 sm:px-4 rounded-full border transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                    backgroundColor: isExposedRoute ? themeConfig.colors.accent || '#3B82F6' : 'transparent',
                    borderColor: themeConfig.colors.accent || '#3B82F6',
                    color: isExposedRoute ? '#ffffff' : themeConfig.colors.text,
                    fontFamily: themeConfig.fonts.primary
                }}
            >
                {/* Icono más pequeño en mobile */}
                <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-current opacity-80 flex items-center justify-center">
                    <svg
                        className="w-2 h-2 sm:w-3 sm:h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        style={{ color: isExposedRoute ? '#ffffff' : themeConfig.colors.accent || '#3B82F6' }}
                    >
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                </div>

                {/* Texto más pequeño en mobile */}
                <span className="font-medium text-xs sm:text-xs">
                    {isExposedRoute ? 'IR A ACTUALIZAR MIS DATOS' : 'CREAR UN VESITE GRATIS'}
                </span>

                {/* Flecha más pequeña en mobile */}
                <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
};

export default ConditionalNavButton;
