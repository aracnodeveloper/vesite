import { useEffect, useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import type { BiositeFull, BiositeThemeConfig } from "../types/Biosite";
import { DEFAULT_BACKGROUND } from "./LivePreviewComponents";

/** Cabeceras de las plantillas Minimalista dos, Retrato, Polaroid y Ventanas. */
export interface TemplateHeaderProps {
    biosite?: BiositeFull;
    themeConfig: BiositeThemeConfig;
    validBackgroundImage?: string | null;
    validAvatarImage?: string | null;
    defaultAvatar: string;
    handleImageClick?: (e: MouseEvent) => void;
    isExposedRoute?: boolean;
    /** Aro de historias alrededor de la imagen principal. */
    historyIndicator?: (shape: "circle" | "frame") => ReactNode;
}

/** Imagen que pasa a `fallback` si no hay `src` o no carga. */
const SafeImage = ({ src, fallback, alt, className, style }: {
    src?: string | null;
    fallback: string;
    alt: string;
    className?: string;
    style?: CSSProperties;
}) => {
    const [failed, setFailed] = useState(false);
    useEffect(() => setFailed(false), [src]);

    return (
        <img
            src={!src || failed ? fallback : src}
            alt={alt}
            className={className}
            style={style}
            onError={() => setFailed(true)}
        />
    );
};

/** Color sólido para fundir la imagen con la página (un degradado no se puede anidar). */
const fadeColor = (background?: string) =>
    !background || background.includes("gradient") ? "transparent" : background;

/** Minimalista dos: foto de perfil e imagen de fondo como dos fotos impresas, giradas y solapadas. */
export const TwinHeader = ({
    validAvatarImage,
    validBackgroundImage,
    defaultAvatar,
    handleImageClick,
    isExposedRoute,
    historyIndicator,
}: TemplateHeaderProps) => (
    <div
        className={`relative mx-auto h-60 w-full max-w-sm ${isExposedRoute ? "cursor-pointer" : ""}`}
        onClick={handleImageClick}
    >
        <div className="absolute left-1/2 top-10 w-36 -translate-x-[85%] -rotate-[8deg] bg-white p-1 shadow-xl ring-1 ring-black/10">
            <SafeImage src={validAvatarImage} fallback={defaultAvatar} alt="Avatar" className="aspect-square w-full object-cover" />
            {historyIndicator?.("frame")}
        </div>
        <div className="absolute left-1/2 top-14 w-36 -translate-x-[12%] rotate-[14deg] bg-white p-1 shadow-xl ring-1 ring-black/10">
            <SafeImage
                src={validBackgroundImage}
                fallback={DEFAULT_BACKGROUND}
                alt="Portada"
                className="aspect-square w-full object-cover"
            />
        </div>
    </div>
);

/** Retrato: la foto de perfil grande y circular; no usa la imagen de fondo. */
export const PortraitHeader = ({
    validAvatarImage,
    defaultAvatar,
    handleImageClick,
    isExposedRoute,
    historyIndicator,
}: TemplateHeaderProps) => (
    <div className="flex justify-center px-4 pt-10 pb-6">
        <div className={`relative ${isExposedRoute ? "cursor-pointer" : ""}`} onClick={handleImageClick}>
            <SafeImage
                src={validAvatarImage}
                fallback={defaultAvatar}
                alt="Avatar"
                className="h-52 w-52 rounded-full object-cover shadow-xl"
            />
            {historyIndicator?.("circle")}
        </div>
    </div>
);

const POLAROID_POSITIONS = ["left center", "center", "right center"];

/** Polaroid: la imagen de fondo en tres marcos instantáneos; no usa la foto de perfil. */
export const PolaroidHeader = ({
    validBackgroundImage,
    themeConfig,
    handleImageClick,
    isExposedRoute,
    historyIndicator,
}: TemplateHeaderProps) => (
    <div
        className={`relative h-64 w-full overflow-hidden ${isExposedRoute ? "cursor-pointer" : ""}`}
        onClick={handleImageClick}
    >
        <div className="absolute inset-x-0 top-0 h-40 overflow-hidden">
            <SafeImage
                src={validBackgroundImage}
                fallback={DEFAULT_BACKGROUND}
                alt=""
                className="h-full w-full scale-110 object-cover blur-[2px]"
            />
            <div
                className="absolute inset-0"
                style={{
                    background: `linear-gradient(to bottom, transparent 35%, ${fadeColor(themeConfig.colors.background)} 100%)`,
                }}
            />
        </div>

        {/* La del centro completa; las de los lados asoman por los bordes */}
        <div className="absolute inset-x-0 top-9 flex items-start justify-center gap-4">
            {POLAROID_POSITIONS.map((position, index) => {
                const isCenter = index === 1;
                return (
                    <div
                        key={position}
                        className={`relative shrink-0 bg-white p-2 pb-7 shadow-xl ${
                            isCenter ? "z-10" : "mt-5 opacity-90"
                        }`}
                    >
                        <SafeImage
                            src={validBackgroundImage}
                            fallback={DEFAULT_BACKGROUND}
                            alt={isCenter ? "Portada" : ""}
                            className={`${isCenter ? "h-40 w-36" : "h-36 w-32"} object-cover`}
                            style={{ objectPosition: position }}
                        />
                        {isCenter && historyIndicator?.("frame")}
                    </div>
                );
            })}
        </div>
    </div>
);

const WindowFrame = ({
    image,
    fallback,
    fileName,
    className,
    imageClassName,
    imagePosition = "center",
    children,
}: {
    image?: string | null;
    fallback: string;
    fileName: string;
    className?: string;
    imageClassName: string;
    imagePosition?: string;
    children?: ReactNode;
}) => (
    <div className={`absolute left-1/2 rounded-md bg-[#1f1f1f] shadow-2xl ring-1 ring-black/40 ${className}`}>
        <div className="relative flex h-5 items-center px-2">
            <span className="flex gap-1">
                {[0, 1, 2].map((dot) => (
                    <span key={dot} className="h-1.5 w-1.5 rounded-full bg-white/40" />
                ))}
            </span>
            <span className="absolute inset-x-8 truncate text-center text-[9px] text-white/70">{fileName}</span>
        </div>
        <SafeImage
            src={image}
            fallback={fallback}
            alt=""
            className={`block w-full rounded-b-md object-cover ${imageClassName}`}
            style={{ objectPosition: imagePosition }}
        />
        {children}
    </div>
);

/** Ventanas: la foto de perfil en ventanas apiladas; no usa la imagen de fondo. */
export const WindowsHeader = ({
    biosite,
    validAvatarImage,
    defaultAvatar,
    handleImageClick,
    isExposedRoute,
    historyIndicator,
}: TemplateHeaderProps) => {
    const fileName = `${(biosite?.slug || "perfil").slice(0, 18)}.jpg`;

    return (
        <div
            className={`relative mx-auto h-80 w-full max-w-sm overflow-hidden ${isExposedRoute ? "cursor-pointer" : ""}`}
            onClick={handleImageClick}
        >
            <WindowFrame
                image={validAvatarImage}
                fallback={defaultAvatar}
                fileName={fileName}
                className="top-10 w-40 -translate-x-[95%] -rotate-6 opacity-90"
                imageClassName="h-48 brightness-75"
                imagePosition="left center"
            />
            <WindowFrame
                image={validAvatarImage}
                fallback={defaultAvatar}
                fileName={fileName}
                className="top-6 w-40 -translate-x-[5%] rotate-6 opacity-90"
                imageClassName="h-48 brightness-75"
                imagePosition="right center"
            />
            <WindowFrame
                image={validAvatarImage}
                fallback={defaultAvatar}
                fileName={fileName}
                className="top-12 z-10 w-48 -translate-x-1/2"
                imageClassName="h-56"
            >
                {historyIndicator?.("frame")}
            </WindowFrame>
        </div>
    );
};
