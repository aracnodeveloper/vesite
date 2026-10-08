import type { BiositeLink } from "../biosite/types/Biosite";
import type { Section } from "../sections/types/sections";
import type { Section_type } from "./BiositeSection";

const LINK_TYPES = {
  SOCIAL: "social",
  REGULAR: "regular",
  APP: "app",
  WHATSAPP: "whatsapp",
  MUSIC: "music",
  VIDEO: "video",
  SOCIAL_POST: "social_post", // el valor que se guarda en link_type
} as const;

/**
 * Enhanced icon identifier detection
 */
const getIconIdentifier = (iconPath: string): string => {
  const iconMap: { [key: string]: string } = {
    "/assets/icons/instagram.svg": "instagram",
    "/assets/icons/tiktok.svg": "tiktok",
    "/assets/icons/X.svg": "twitter",
    "/assets/icons/facebook.svg": "facebook",
    "/assets/icons/twitch.svg": "twitch",
    "/assets/icons/linkdl.svg": "linkedin",
    "/assets/icons/snapchat.svg": "snapchat",
    "/assets/icons/threads.svg": "threads",
    "/assets/icons/gmail.svg": "email",
    "/assets/icons/pinterest.svg": "pinterest",
    "/assets/icons/spottufy.svg": "spotify",
    "/assets/icons/music.svg": "apple-music",
    "/assets/icons/discord.svg": "discord",
    "/assets/icons/tumblr.svg": "tumblr",
    "/assets/icons/whatsapp.svg": "whatsapp",
    "/assets/icons/telegram.svg": "telegram",
    "/assets/icons/amazon.svg": "amazon",
    "/assets/icons/onlyfans.svg": "onlyfans",
    "/assets/icons/appstore.svg": "appstore",
    "/assets/icons/googleplay.svg": "googleplay",
  };

  if (iconPath === "link") return "link";
  if (iconPath === "social-post") return "social-post";
  if (iconPath === "music-embed") return "music-embed";
  if (iconPath === "video-embed") return "video-embed";
  if (iconPath === "whatsapp") return "whatsapp";
  if (iconPath === "appstore") return "appstore";
  if (iconPath === "googleplay") return "googleplay";

  if (iconPath === "svg%3e" || iconPath.includes("%")) {
    return "link";
  }

  const fullPath = Object.keys(iconMap).find((path) => path.includes(iconPath));
  if (fullPath) return iconMap[fullPath];

  const fileName = iconPath.split("/").pop()?.replace(".svg", "") || "link";
  return fileName.toLowerCase();
};

/**
 * Enhanced link type detection
 */
const detectLinkType = (link: BiositeLink): string => {
  // First check if link_type is explicitly set
  if (link.link_type && link.link_type !== null) {
    return link.link_type;
  }

  const iconIdentifier = getIconIdentifier(link.icon || "");
  const labelLower = link.label?.toLowerCase() || "";
  const urlLower = link.url?.toLowerCase() || "";

  // WhatsApp detection
  if (iconIdentifier === "whatsapp" || urlLower.includes("api.whatsapp.com")) {
    return LINK_TYPES.WHATSAPP;
  }

  // App store detection
  if (
    iconIdentifier === "appstore" ||
    iconIdentifier === "googleplay" ||
    labelLower.includes("app store") ||
    labelLower.includes("google play") ||
    urlLower.includes("apps.apple.com") ||
    urlLower.includes("play.google.com")
  ) {
    return LINK_TYPES.APP;
  }

  // Music detection
  if (
    iconIdentifier === "music-embed" ||
    labelLower.includes("music") ||
    labelLower.includes("podcast") ||
    urlLower.includes("spotify.com/track/") ||
    urlLower.includes("open.spotify.com") ||
    urlLower.includes("music.apple.com") ||
    urlLower.includes("soundcloud.com") ||
    urlLower.includes("deezer.com") ||
    urlLower.includes("tidal.com")
  ) {
    return LINK_TYPES.MUSIC;
  }

  // Video detection
  if (
    iconIdentifier === "video-embed" ||
    labelLower.includes("video") ||
    urlLower.includes("youtube.com/watch") ||
    urlLower.includes("youtu.be/") ||
    urlLower.includes("vimeo.com")
  ) {
    return LINK_TYPES.VIDEO;
  }

  if (
      iconIdentifier === "social-post" ||
      labelLower.includes("social post") ||
      labelLower.includes("post") ||
      labelLower.includes("publicacion") ||
      labelLower.includes("contenido") ||
      // Instagram posts and reels
      (urlLower.includes("instagram.com") &&
          (urlLower.includes("/p/") || urlLower.includes("/reel/"))) ||
      // TikTok videos (un perfil /@usuario no es un post: va a Social, como en el editor)
      urlLower.includes("vm.tiktok.com") ||
      urlLower.includes("tiktok.com/t/") ||
      (urlLower.includes("tiktok.com") && urlLower.includes("/video/")) ||
      (urlLower.includes("tiktok.com") &&
          !urlLower.match(/tiktok\.com\/?$/) &&
          !urlLower.includes("/@"))
  ) {
    return LINK_TYPES.SOCIAL_POST;
  }

  // Social media detection
  const socialPlatforms = [
    "instagram",
    "tiktok",
    "x",
    "twitter",
    "facebook",
    "twitch",
    "linkedin",
    "snapchat",
    "threads",
    "pinterest",
    "discord",
    "tumblr",
    "telegram",
    "onlyfans",
    "amazon",
    "gmail",
    "spotify",
    "youtube",
  ];

  const isSocialIcon = socialPlatforms.includes(iconIdentifier);
  const isSocialDomain = socialPlatforms.some(
    (platform) =>
      urlLower.includes(`${platform}.com`) ||
      urlLower.includes(`${platform}.net`) ||
      urlLower.includes(`${platform}.tv`)
  );
  const isSocialLabel = socialPlatforms.some(
    (platform) => labelLower === platform || labelLower.includes(platform)
  );

  if (isSocialIcon || isSocialDomain || isSocialLabel) {
    // Special case for YouTube channels vs videos
    if (
      urlLower.includes("youtube.com/@") ||
      (urlLower.includes("youtube.com") && !urlLower.includes("/watch"))
    ) {
      return LINK_TYPES.SOCIAL;
    }
    if (urlLower.includes("tiktok.com")) {
      // If it's already detected as social post above, don't override
      if (
          urlLower.includes("vm.tiktok.com") ||
          urlLower.includes("tiktok.com/t/") ||
          urlLower.includes("/video/") ||
          (!urlLower.match(/tiktok\.com\/?$/) && !urlLower.includes("/@"))
      ) {
        return LINK_TYPES.SOCIAL_POST;
      }
    }
    return LINK_TYPES.SOCIAL;
  }

  return LINK_TYPES.REGULAR;
};

/** Sección del biosite en la que se muestra cada tipo de link. */
function getSectionTitle(linkType: string): string {
  switch (linkType) {
    case "social":
      return "Social";
    case "regular":
      return "Links";
    case "app":
      return "Link de mi App";
    case "whatsapp":
      return "Contactame";
    case "music":
      return "Music / Podcast";
    case "video":
      return "Video";
    case "social_post":
      return "Social Post";
    default:
      return "Links";
  }
}

/** Agrupa los links activos por título de sección, respetando el orden de `sections`. */
const groupLinksBySection = (links: BiositeLink[], sections: Section[]): Map<string, BiositeLink[]> => {
  const grouped = new Map<string, BiositeLink[]>();
  sections.forEach((section) => grouped.set(section.titulo, []));

  links
    .filter((link) => link.isActive)
    .forEach((link) => {
      const sectionTitle = getSectionTitle(detectLinkType(link));
      grouped.get(sectionTitle)?.push(link);
    });

  return grouped;
};

/** Secciones sin duplicados (se queda la más reciente), ordenadas por orderIndex. */
const uniqueSortedSections = (sections: Section[]): Section[] =>
  sections
    .reduce((acc, current) => {
      const index = acc.findIndex((section) => section.titulo === current.titulo);
      if (index === -1) {
        acc.push(current);
      } else if (new Date(current.updatedAt || 0).getTime() > new Date(acc[index].updatedAt || 0).getTime()) {
        acc[index] = current;
      }
      return acc;
    }, [] as Section[])
    .sort((a, b) => a.orderIndex - b.orderIndex);

/**
 * En el preview del editor cada sección lleva a su pantalla de edición.
 * `keepUrl`: el bloque necesita la URL para pintar el embed.
 */
const PREVIEW_ROUTES: Record<string, { route: string; keepUrl?: boolean }> = {
  Links: { route: "/links" },
  Social: { route: "/social" },
  "Social Post": { route: "/post", keepUrl: true },
  Contactame: { route: "/whatsApp" },
  VCard: { route: "/VCard" },
  "Link de mi App": { route: "/app" },
  "Music / Podcast": { route: "/music", keepUrl: true },
  Video: { route: "/videos", keepUrl: true },
};

/**
 * Agrupa los links del biosite en sus secciones, en el orden configurado.
 * Solo incluye secciones con links (o VCard/Profile, que siempre se muestran).
 */
export const createOrderedSectionsRecord = (
  links: BiositeLink[],
  sections: Section[],
  isPreview: boolean = false,
  navigate: (route: string) => void
): Map<Section_type, BiositeLink[]> => {
  const uniqueSections = uniqueSortedSections(sections);
  const grouped = groupLinksBySection(links, uniqueSections);

  const orderedMap = new Map<Section_type, BiositeLink[]>();
  uniqueSections.forEach((section) => {
    const sectionLinks = grouped.get(section.titulo) || [];
    const titleLower = section.titulo.toLowerCase();
    const alwaysShown = titleLower.includes("vcard") || titleLower.includes("profile");

    if (sectionLinks.length > 0 || alwaysShown) {
      orderedMap.set(section.titulo as Section_type, sectionLinks);
    }
  });

  // Los botones de tiendas de apps usan la URL como etiqueta
  orderedMap.get("Link de mi App" as Section_type)?.forEach((link) => {
    link.tag = link.url;
  });

  if (!isPreview) {
    return orderedMap;
  }

  return new Map(
    Array.from(orderedMap.entries()).map(([sectionType, sectionLinks]) => {
      const preview = PREVIEW_ROUTES[sectionType];
      const modifiedLinks = sectionLinks.map((link) =>
        preview
          ? {
              ...link,
              ...(preview.keepUrl ? {} : { url: undefined }),
              id: undefined,
              onClick: () => navigate(preview.route),
            }
          : { ...link, url: link.url.startsWith("/") ? link.url : `/${link.url}` }
      );
      return [sectionType, modifiedLinks];
    })
  );
};
