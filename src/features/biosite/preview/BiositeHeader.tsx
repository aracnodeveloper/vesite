import type { HeaderLayout } from "../types/Templates";
import { AvatarSection, BackgroundSection, TwoSquareImagesSection } from "./LivePreviewComponents";
import { PolaroidHeader, PortraitHeader, WindowsHeader, type TemplateHeaderProps } from "./TemplateHeaders";

interface BiositeHeaderProps extends TemplateHeaderProps {
    layout: HeaderLayout;
    // Estado de carga de imágenes que usan las cabeceras clásica y gemela
    imageLoadStates: Record<string, string>;
    handleImageLoadStart?: (key: string) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleImageLoad?: (...args: any[]) => void;
    handleImageError?: (key: string, url?: string) => void;
}

/**
 * Imagen de fondo y foto de perfil del vesite, dibujadas según la plantilla.
 * Lo que va debajo (nombre, descripción, links) no cambia con la plantilla.
 */
const BiositeHeader = ({ layout, historyIndicator, ...props }: BiositeHeaderProps) => {
    switch (layout) {
        case "portrait":
            return <PortraitHeader {...props} historyIndicator={historyIndicator} />;
        case "polaroid":
            return <PolaroidHeader {...props} historyIndicator={historyIndicator} />;
        case "windows":
            return <WindowsHeader {...props} historyIndicator={historyIndicator} />;
        case "twin":
            return (
                <div className="pt-6">
                    <TwoSquareImagesSection {...props} />
                </div>
            );
        default:
            return (
                <>
                    <BackgroundSection {...props} />
                    <AvatarSection {...props} historyIndicator={historyIndicator?.("circle")} />
                </>
            );
    }
};

export default BiositeHeader;
