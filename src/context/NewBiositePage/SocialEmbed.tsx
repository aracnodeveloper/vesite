import type { BiositeLink } from "../../interfaces/Biosite";

interface SocialEmbedProps {
  link: BiositeLink;
  themeConfig: any;
  onLinkClick?: () => void;
  onTrack?: (id) => void;
  isExposedRoute?: boolean;
}

// Función para verificar si es una URL de Instagram
const isInstagramUrl = (url: string): boolean => {
  return (
    url.includes("instagram.com/p/") ||
    url.includes("instagram.com/reel/") ||
    url.includes("instagr.am/p/") ||
    url.includes("instagr.am/reel/")
  );
};

// Función para obtener la URL del embed de Instagram
const getInstagramEmbedUrl = (url: string): string | null => {
  try {
    // Extraer el ID del post de diferentes formatos de URL
    const patterns = [
      // https://www.instagram.com/p/ABC123/
      /https?:\/\/(?:www\.)?instagram\.com\/p\/([a-zA-Z0-9_-]+)/,
      // https://www.instagram.com/reel/ABC123/
      /https?:\/\/(?:www\.)?instagram\.com\/reel\/([a-zA-Z0-9_-]+)/,
      // https://instagr.am/p/ABC123/
      /https?:\/\/instagr\.am\/p\/([a-zA-Z0-9_-]+)/,
      // https://instagr.am/reel/ABC123/
      /https?:\/\/instagr\.am\/reel\/([a-zA-Z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        const postId = match[1];
        const isReel = url.includes("/reel/");
        const type = isReel ? "reel" : "p";
        return `https://www.instagram.com/${type}/${postId}/embed/`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing Instagram URL:", error);
    return null;
  }
};

// Función para verificar si es una URL de TikTok
const isTikTokUrl = (url: string): boolean => {
  return url.includes("vm.tiktok.com") || url.includes("tiktok.com/t/");
};

// Función para obtener la URL del embed de TikTok
const getTikTokEmbedUrl = (url: string): string | null => {
  try {
    // Para TikTok, generalmente necesitamos usar el oEmbed API
    // Por ahora retornamos null para usar el fallback
    return null;
  } catch (error) {
    console.error("Error parsing TikTok URL:", error);
    return null;
  }
};

export default function SocialEmbed({
  link,
  themeConfig,
  onLinkClick,
  onTrack,
  isExposedRoute = true,
}: SocialEmbedProps) {
  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    } else {
      window.open(link.url, "_blank", "noopener,noreferrer");
    }
    if (onTrack) {
      onTrack(link.id);
    }
  };

  // Determinar el tipo de red social y obtener embed URL
  const getEmbedUrl = (): string | null => {
    if (isInstagramUrl(link.url)) {
      return getInstagramEmbedUrl(link.url);
    }
    if (isTikTokUrl(link.url)) {
      return getTikTokEmbedUrl(link.url);
    }
    return null;
  };

  const embedUrl = getEmbedUrl();
  const isInstagram = isInstagramUrl(link.url);
  const isTikTok = isTikTokUrl(link.url);

  return (
    <div
      onClick={handleClick}
      className="relative cursor-pointer rounded-lg shadow-md overflow-hidden"
      style={{
        backgroundColor: themeConfig.colors.profileBackground || "#ffffff",
      }}
    >
      {embedUrl ? (
        <div
          className={`embed-container ${
            isInstagram ? "instagram-embed" : "social-embed"
          }`}
        >
          <iframe
            src={embedUrl}
            width="100%"
            height={isExposedRoute ? (isInstagram ? "700" : "400") : "400"}
            loading="lazy"
            title={link.label}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            style={{ pointerEvents: "none" }}
          />
        </div>
      ) : (
        // Fallback: Mostrar como tarjeta cuando no se puede embebber
        <div
          className="p-4 flex items-center space-x-3 cursor-pointer hover:bg-opacity-90 transition-colors duration-200"
          onClick={handleClick}
        >
          <div className="flex-shrink-0">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: themeConfig.colors.accent || "#8b5cf6",
              }}
            >
              {isInstagram ? (
                // Icono de Instagram
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              ) : isTikTok ? (
                // Icono de TikTok
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              ) : (
                // Icono genérico de chat/post
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
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
              {link.label}
            </h3>
            <p
              className="text-xs opacity-60 truncate mt-1"
              style={{
                color: themeConfig.colors.text,
                fontFamily:
                  themeConfig.fonts.secondary || themeConfig.fonts.primary,
              }}
            >
              {isInstagram ? "Instagram" : isTikTok ? "TikTok" : "Post"} •{" "}
              {link.url}
            </p>
          </div>
          {/* Icono de enlace externo */}
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 opacity-70"
              style={{ color: themeConfig.colors.text }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
