import React from 'react';
import { useAuthContext } from "../hooks/useAuthContext.ts";
import Cookie from "js-cookie";

interface ConditionalNavButtonProps {
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

const ConditionalNavButton: React.FC<ConditionalNavButtonProps> = ({ themeConfig }) => {
    const  isAuthenticated  = Cookie.get('accessToken');

    const handleClick = () => {
    
            window.location.href = 'https://visitaecuador.com/vesite';
        } 

    return (
        <div className="px-3 sm:px-4">
            <button
                onClick={handleClick}
                className="w-full flex items-center cursor-pointer justify-center gap-1.5 sm:gap-2 py-2 sm:py-3 px-3 sm:px-4 rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
                style={{
                    backgroundColor: 'transparent',
                    color: themeConfig.colors.text,
                    fontFamily: themeConfig.fonts.primary
                }}
            >

                <span className="font-medium text-xs sm:text-xs">
                   { 'Actualizar mis datos'}
                </span>

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
