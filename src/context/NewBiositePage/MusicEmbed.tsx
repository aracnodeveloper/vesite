import { useState, useEffect } from "react";
import type { BiositeLink } from "../../interfaces/Biosite";
import Loading from "../../components/shared/Loading";

interface MusicEmbedProps {
  link: BiositeLink;
}

export default function MusicEmbed({ link }: MusicEmbedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [embedUrl, setEmbedUrl] = useState<string>("");

  const getSpotifyEmbedUrl = (url: string) => {
    const trackMatch = url.match(/track\/([a-zA-Z0-9]+)/);
    if (trackMatch) {
      return `https://open.spotify.com/embed/track/${trackMatch[1]}?utm_source=generator&theme=0`;
    }
    return null;
  };

  useEffect(() => {
    if (link.url) {
      const embed = getSpotifyEmbedUrl(link.url);
      if (embed) {
        setEmbedUrl(embed);
      }
    }
  }, [link.url]);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="rounded-lg shadow-lg transition-all flex items-center duration-200 hover:shadow-md cursor-pointer ">
      {/* Contenedor del embed */}
      <div className="relative w-full rounded-lg overflow-hidden shadow-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <Loading />
          </div>
        )}

        <iframe
          src={embedUrl}
          width="100%"
          height="80"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          onLoad={handleIframeLoad}
          className="rounded-lg"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: "opacity 0.3s ease-in-out",
          }}
        />
      </div>
    </div>
  );
}
