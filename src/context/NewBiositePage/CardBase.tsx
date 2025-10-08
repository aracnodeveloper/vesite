import React from "react";
import type { LucideIcon } from "lucide-react";

export default function Cardbase({
  themeConfig,
  title,
  id,
  icon,
  image,
  url,
  onClick,
  onTrack,
  children,
}: {
  themeConfig: any;
  title?: string;
  id?: string;
  icon?: string | LucideIcon;
  image?: string;
  url?: string;
  onClick?: () => void;
  onTrack?: (id: string) => void;
  children?: any;
}) {
  const commonClasses =
    "w-full p-1 h-[55px] rounded-lg shadow-lg transition-all flex items-center duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
  const commonStyles = {
    backgroundColor: themeConfig.colors.accent,
    background: themeConfig.colors.accent,
  };

  const isDarkTheme = () => {
    const backgroundColor = themeConfig.colors.background;

    if (backgroundColor.includes('gradient')) {

      const hexColors = backgroundColor.match(/#[0-9A-Fa-f]{6}/g);
      const rgbColors = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/g);

      let colors: { r: number; g: number; b: number }[] = [];

      if (hexColors) {
        colors = colors.concat(
            hexColors.map(hex => {
              const cleanHex = hex.replace('#', '');
              return {
                r: parseInt(cleanHex.substr(0, 2), 16),
                g: parseInt(cleanHex.substr(2, 2), 16),
                b: parseInt(cleanHex.substr(4, 2), 16)
              };
            })
        );
      }
      if (rgbColors) {
        colors = colors.concat(
            rgbColors.map(rgb => {
              const match = rgb.match(/(\d+)/g);
              if (match && match.length >= 3) {
                return {
                  r: parseInt(match[0]),
                  g: parseInt(match[1]),
                  b: parseInt(match[2])
                };
              }
              return { r: 255, g: 255, b: 255 };
            })
        );
      }

      if (colors.length === 0) {
        return false;
      }

      const avgLuminance = colors.reduce((sum, color) => {
        const luminance = (0.299 * color.r + 0.587 * color.g + 0.114 * color.b) / 255;
        return sum + luminance;
      }, 0) / colors.length;

      return avgLuminance < 0.5;
    }

    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance < 0.5;
  };

  const getIconClassName = () => {
    return isDarkTheme()
        ? "invert brightness-0 contrast-100"
        : "";
  };


  const cardContent = (
    <>
      {image && (
        <div className="flex-shrink-0 w-12 h-12 mr-3 rounded-lg overflow-hidden bg-white flex items-center justify-center">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Título al centro */}
      <div className="flex-1 text-left">
        <span
          className="text-sm font-semibold line-clamp-2"
          style={{
            color: themeConfig.colors.text,
            fontFamily:
              themeConfig.fonts.secondary || themeConfig.fonts.primary,
          }}
        >
          {title}
        </span>
      </div>

      {/* Icono a la derecha */}
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 ml-3 flex items-center justify-center">
          {typeof icon === "string" ? (
            <img
              src={icon}
              alt={title}
              className={getIconClassName()}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            React.createElement(icon, {
              size: 24,
              color: themeConfig.colors.text,
              className: "transition-colors duration-200",
            })
          )}
        </div>
      )}
    </>
  );

  // Si no hay ni URL ni onClick, renderizar como div simple
  return (
    <div
      onClick={() => {
        onClick?.();
        onTrack?.(id);
      }}
      className="p-0 m-0"
    >
      <a
        key={id}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={commonClasses}
        style={commonStyles}
      >
        {cardContent}
      </a>
    </div>
  );
}
