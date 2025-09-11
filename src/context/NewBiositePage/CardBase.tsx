import React from "react";
import type { LucideIcon } from "lucide-react";


export default function Cardbase({
                                   themeConfig,
                                   title,
                                   key,
                                   icon,
                                   image,
                                   url,
                                   onClick,
                                 }: {
  themeConfig: any;
  title?: string;
  key?: any;
  icon?: string | LucideIcon;
  image?: string;
  url?: string;
  onClick?: () => void;
}) {

  if (url && onClick) {
    console.warn(
        "CardBase: url y onClick son mutuamente excluyentes. Se usará url y se ignorará onClick."
    );
  }

  const commonClasses =
      "w-full p-3 h-[70px] rounded-lg shadow-lg transition-all flex items-center duration-200 hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98]";
  const commonStyles = {
    backgroundColor: themeConfig.colors.accent,
    background: themeConfig.colors.accent,
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
        )
        }

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
              {typeof icon === 'string' ? (
                  <img
                      src={icon}
                      alt={title}
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

  // Si hay URL, renderizar como enlace
  if (url) {
    return (
        <a
            key={key}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={commonClasses}
            style={commonStyles}
        >
          {cardContent}
        </a>
    );
  }

  // Si hay onClick (y no URL), renderizar como div con función de click
  if (onClick) {
    return (
        <div
            key={key}
            onClick={onClick}
            className={commonClasses}
            style={commonStyles}
        >
          {cardContent}
        </div>
    );
  }

  // Si no hay ni URL ni onClick, renderizar como div simple
  return (
      <div key={key} className={commonClasses} style={commonStyles}>
        {cardContent}
      </div>
  );
}