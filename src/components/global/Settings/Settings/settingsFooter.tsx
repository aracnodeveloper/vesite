import React from "react";
import { HelpCircle, FileText, Shield, LogOut } from "lucide-react";

interface SettingsFooterProps {
    onLogout: () => void;
}

const SettingsFooter: React.FC<SettingsFooterProps> = ({ onLogout }) => {
    const handleSupportClick = () => {
        const phoneNumber = "593987769696"; // Formato internacional para Ecuador
        const message = "Necesito ayuda con mi VeSite";
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleTermsClick = () => {
        window.open('https://visitaecuador.com/terminos-condiciones', '_blank');
    };

    const handlePrivacyClick = () => {
        window.open('https://visitaecuador.com/politicas-privacidad', '_blank');
    };

    return (
        <div className="border-t border-[#E0EED5]">
            <div className="p-4 space-y-4">
                {/* Support */}
                <div
                    onClick={handleSupportClick}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                    <HelpCircle size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Soporte</span>
                </div>

                {/* Terms of Use */}
                <div
                    onClick={handleTermsClick}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                    <FileText size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Terminos de Condición</span>
                </div>

                {/* Privacy Policy */}
                <div
                    onClick={handlePrivacyClick}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
                >
                    <Shield size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Politica de Privacidad</span>
                </div>

                {/* Log Out */}
                <div
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                    <LogOut size={20} className="text-gray-400 hover:text-red-500"/>
                    <span className="text-red-600 text-sm font-medium">Cerrar Sesion</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsFooter;