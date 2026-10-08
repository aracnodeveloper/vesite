import type React from "react";
import type { PreviewThemeConfig } from "../hooks/useLivePreviewLogic.ts";

interface PreviewEmbedCardProps {
  /** URL del iframe; si es null se muestra una tarjeta con el enlace. */
  embedUrl: string | null;
  label: string;
  url: string;
  /** Texto antes de la URL en la tarjeta de respaldo, p. ej. "Video". */
  kindLabel: string;
  icon: React.ReactNode;
  fallbackAccent: string;
  themeConfig: PreviewThemeConfig;
  onClick: (e: React.MouseEvent) => void;
  iframeProps: React.IframeHTMLAttributes<HTMLIFrameElement>;
  embedClassName: string;
  /** Pinta el fondo del perfil detrás de la tarjeta. */
  withBackground?: boolean;
}

/**
 * Bloque de video / música / post del preview del editor: muestra el embed
 * (o una tarjeta con el enlace) y, al hacer clic, lleva a la pantalla de edición.
 */
const PreviewEmbedCard = ({
  embedUrl,
  label,
  url,
  kindLabel,
  icon,
  fallbackAccent,
  themeConfig,
  onClick,
  iframeProps,
  embedClassName,
  withBackground = true,
}: PreviewEmbedCardProps) => (
  <div className="px-4 mb-4">
    <div
      className="relative rounded-lg shadow-md overflow-hidden"
      style={
        withBackground
          ? { backgroundColor: themeConfig.colors.profileBackground || "#ffffff" }
          : undefined
      }
    >
      {embedUrl ? (
        <div className={`embed-container ${embedClassName}`}>
          <iframe
            src={embedUrl}
            width="100%"
            frameBorder="0"
            loading="lazy"
            title={label}
            {...iframeProps}
          ></iframe>
        </div>
      ) : (
        <div className="p-4 flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: themeConfig.colors.accent || fallbackAccent }}
            >
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-medium text-sm truncate"
              style={{
                color: themeConfig.colors.text,
                fontFamily: themeConfig.fonts.primary,
              }}
            >
              {label}
            </h3>
            <p
              className="text-xs opacity-60 truncate mt-1"
              style={{
                color: themeConfig.colors.text,
                fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary,
              }}
            >
              {kindLabel} • {url}
            </p>
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 bg-transparent cursor-pointer z-10"
        onClick={onClick}
        style={{ backgroundColor: "rgba(0, 0, 0, 0.01)" }}
      />
    </div>
  </div>
);

export default PreviewEmbedCard;
