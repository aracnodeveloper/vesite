import { usePreview } from "../../../../context/PreviewContext";
import { useLocation } from "react-router-dom";
import {WhatsAppOutlined} from "@ant-design/icons";

interface WhatsAppButtonProps {
    onWhatsAppClick?: (e: React.MouseEvent) => void;
    handleWhatsAppLinkClick?: (id: string, url: string) => void;
    themeConfig: {
        colors: {
            primary: string;
            secondary: string;
            accent: string;
            background: string;
            text: string;
            profileBackground: string;
        };
        fonts: {
            primary: string;
            secondary: string;
        };
    };
}

const WhatsAppButton = ({ onWhatsAppClick, handleWhatsAppLinkClick, themeConfig}: WhatsAppButtonProps) => {
    const { whatsAppLinks } = usePreview();
    const location = useLocation();

    const isExposedRoute = location.pathname === '/expoced';

    // Obtener el primer enlace de WhatsApp activo
    const whatsAppLink = whatsAppLinks.find(link => link.isActive);

    // Si no hay enlace de WhatsApp activo, no mostrar nada
    if (!whatsAppLink) {
        return null;
    }

    // Generar la URL de WhatsApp
    const generateWhatsAppUrl = (phone: string, message: string): string => {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        const encodedMessage = encodeURIComponent(message.trim());
        return `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;
    };

    // Imagen/icono de WhatsApp (puedes usar una imagen local o un SVG)
    const whatsAppImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%2325D366' rx='6'/%3E%3Cpath d='M29.472 22.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0020.05 8C13.495 8 8.16 13.335 8.157 19.892c0 2.096.547 4.142 1.588 5.945L8.057 32l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0028.885 11.488' fill='white'/%3E%3C/svg%3E";

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isExposedRoute && handleWhatsAppLinkClick) {
            // En vista pública con analytics
            const url = generateWhatsAppUrl(whatsAppLink.phone, whatsAppLink.message);
            handleWhatsAppLinkClick(whatsAppLink.id, url);
        } else if (isExposedRoute) {
            // En vista pública sin analytics
            const url = generateWhatsAppUrl(whatsAppLink.phone, whatsAppLink.message);
            window.open(url, '_blank');
        } else {
            onWhatsAppClick && onWhatsAppClick(e);
        }
    };

    return (
        <div className="px-4 mb-2">
            <button
                onClick={handleClick}
                className="w-full p-2 rounded-lg bg-white text-center shadow-lg transition-all flex duration-200 hover:shadow-md cursor-pointer"
       style={{backgroundColor: themeConfig.colors.accent,
           background: themeConfig.colors.accent}}
            >
                {/* Imagen de WhatsApp */}
                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <WhatsAppOutlined size={18} className="text-white" style={{color:'white'}} />
                </div>

                {/* Contenido del botón */}
                <div className="grid grid-cols-1 gap-1 ml-2">
                    <div className="flex items-center">
                        <span className="font-medium text-xs truncate">
                            WhatsAppéame
                        </span>
                    </div>
                </div>
            </button>
        </div>
    );
};

export default WhatsAppButton;