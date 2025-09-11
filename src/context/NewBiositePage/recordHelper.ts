import type { BiositeLink } from "../../interfaces/Biosite";
import type { Section } from "../../interfaces/sections";
import type { Section_type } from "./BiositeSection";

/**
 * Link type constants for categorizing links
 */
export const LINK_CATEGORIES = {
  MUSIC: "MUSIC",
  VIDEO: "VIDEO",
  SOCIAL_POST: "SOCIAL_POST",
} as const;

/**
 * Gets the order index for a section by its title
 */
export const getSectionOrderIndex = (
  sectionTitle: string,
  sections: Section[]
): number => {
  const section = sections.find((s) => s.titulo === sectionTitle);
  return section?.orderIndex || 999;
};

/**
 * Finds music-related links from biosite links
 */
export const getMusicLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const musicByType = links.filter(
    (link) => link.link_type === LINK_TYPES.MUSIC && link.isActive
  );
  if (musicByType.length > 0) return musicByType;

  // Fallback to existing logic for backward compatibility
  const musicLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("music") ||
        labelLower.includes("spotify") ||
        urlLower.includes("spotify.com/track/") ||
        urlLower.includes("open.spotify.com"))
    );
  });

  return musicLinks;
};

/**
 * Finds social post links from biosite links
 */
export const getSocialPostLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const socialPostByType = links.filter(
    (link) => link.link_type === LINK_TYPES.SOCIAL_POST && link.isActive
  );
  if (socialPostByType.length > 0) return socialPostByType;

  // Fallback to existing logic for backward compatibility
  const socialPostLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("post") ||
        labelLower.includes("instagram") ||
        urlLower.includes("instagram.com/p/") ||
        urlLower.includes("instagram.com/reel/"))
    );
  });

  return socialPostLinks;
};

/**
 * Finds video-related links from biosite links
 */
export const getVideoLinks = (
  links: BiositeLink[],
  LINK_TYPES: any
): BiositeLink[] => {
  if (!links || !Array.isArray(links)) return [];

  // First try to find by link_type
  const videoByType = links.filter(
    (link) => link.link_type === LINK_TYPES.VIDEO && link.isActive
  );
  if (videoByType.length > 0) return videoByType;

  // Fallback to existing logic for backward compatibility
  const videoLinks = links.filter((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";

    return (
      link.isActive &&
      (labelLower.includes("video") ||
        labelLower.includes("youtube") ||
        urlLower.includes("youtube.com/watch") ||
        urlLower.includes("youtu.be/"))
    );
  });

  return videoLinks;
};

/**
 * Helper functions to identify link types
 */
const isSocialLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const socialPlatforms = [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "linkedin.com",
    "tiktok.com",
    "youtube.com",
  ];
  return (
    link.link_type == "social" ||
    socialPlatforms.some((platform) => url.includes(platform))
  );
};

const isRegularLink = (link: BiositeLink): boolean => {
  // Links that are not social, whatsapp, music, video, etc.
  return !isSocialLink(link) && !isWhatsAppLink(link) && !isMusicLink(link);
};

const isWhatsAppLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const label = link.label?.toLowerCase() || "";
  return (
    url.includes("whatsapp") ||
    label.includes("whatsapp") ||
    url.includes("wa.me")
  );
};

/**
 * Enhanced link categorization functions
 */
const isMusicLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const label = link.label?.toLowerCase() || "";
  return (
    link.link_type == "Music / Podcast" ||
    url.includes("spotify.com") ||
    url.includes("music.apple.com") ||
    url.includes("soundcloud.com") ||
    url.includes("deezer.com") ||
    url.includes("tidal.com") ||
    label.includes("music") ||
    label.includes("spotify") ||
    label.includes("podcast")
  );
};

const isVideoLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const label = link.label?.toLowerCase() || "";
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com") ||
    url.includes("tiktok.com") ||
    label.includes("video") ||
    label.includes("youtube")
  );
};

const isAppLink = (link: BiositeLink): boolean => {
  const url = link.url?.toLowerCase() || "";
  const label = link.label?.toLowerCase() || "";
  return (
    url.includes("play.google.com") ||
    url.includes("apps.apple.com") ||
    url.includes("app.") ||
    label.includes("app") ||
    label.includes("aplicación") ||
    label.includes("aplicacion")
  );
};

/**
 * Groups active links by section title with enhanced matching logic
 * Respects the order of sections passed as parameter
 */
export const groupLinksBySection = (
  links: BiositeLink[],
  sections: Section[]
): Map<string, BiositeLink[]> => {
  const grouped = new Map<string, BiositeLink[]>();

  // Initialize groups for all sections IN THE SAME ORDER as provided
  // Initialize groups preserving the order from sections array
  // Initialize groups preserving the order from sections array
  sections.forEach((section) => {
    grouped.set(section.titulo, []);
  });

  // Group active links by matching section titles
  links
    .filter((link) => link.isActive)
    .forEach((link) => {
      // Enhanced matching logic - find the matching section from the ordered list
      const matchingSection = sections.find((section) => {
        const sectionTitle = section.titulo.toLowerCase();
        const linkLabel = link.label?.toLowerCase() || "";

        // Direct label matching
        if (sectionTitle === linkLabel) return true;

        // Category-based matching
        if (sectionTitle.includes("social") && isSocialLink(link)) return true;
        if (sectionTitle.includes("links") && isRegularLink(link)) return true;
        if (sectionTitle.includes("contactame") && isWhatsAppLink(link))
          return true;
        if (sectionTitle.includes("music") && isMusicLink(link)) return true;
        if (sectionTitle.includes("video") && isVideoLink(link)) return true;
        if (sectionTitle.includes("app") && isAppLink(link)) return true;

        // Partial matching
        return (
          sectionTitle.includes(linkLabel) || linkLabel.includes(sectionTitle)
        );
      });

      if (matchingSection) {
        grouped.get(matchingSection.titulo)?.push(link);
      }
    });

  return grouped;
};

/**
 * Determines which section a link belongs to based on various criteria
 */
const determineLinkSection = (
  link: BiositeLink,
  sectionsInfo: { titulo: string; orderIndex: number }[],
  LINK_TYPES?: any
): { titulo: string; orderIndex: number } | null => {
  const linkLabel = link.label?.toLowerCase() || "";

  // Try exact match first
  let matchingSection = sectionsInfo.find(
    (s) => s.titulo.toLowerCase() === linkLabel
  );
  if (matchingSection) return matchingSection;

  // Try matching by link_type if available
  if (LINK_TYPES && link.link_type) {
    if (link.link_type === LINK_TYPES.MUSIC) {
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("music") ||
          s.titulo.toLowerCase().includes("música") ||
          s.titulo.toLowerCase().includes("podcast")
      );
      if (matchingSection) return matchingSection;
    }

    if (link.link_type === LINK_TYPES.VIDEO) {
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("video") ||
          s.titulo.toLowerCase().includes("vídeo")
      );
      if (matchingSection) return matchingSection;
    }

    if (link.link_type === LINK_TYPES.SOCIAL_POST) {
      matchingSection = sectionsInfo.find(
        (s) =>
          s.titulo.toLowerCase().includes("social") ||
          s.titulo.toLowerCase().includes("post")
      );
      if (matchingSection) return matchingSection;
    }
  }

  // Enhanced category-based matching using improved helper functions
  if (isMusicLink(link)) {
    matchingSection = sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("music") ||
        s.titulo.toLowerCase().includes("música") ||
        s.titulo.toLowerCase().includes("podcast")
    );
    if (matchingSection) return matchingSection;
  }

  if (isVideoLink(link)) {
    matchingSection = sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("video") ||
        s.titulo.toLowerCase().includes("vídeo")
    );
    if (matchingSection) return matchingSection;
  }

  if (isSocialLink(link)) {
    matchingSection = sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("social") ||
        s.titulo.toLowerCase().includes("redes")
    );
    if (matchingSection) return matchingSection;
  }

  if (isWhatsAppLink(link)) {
    matchingSection = sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("contactame") ||
        s.titulo.toLowerCase().includes("contacto") ||
        s.titulo.toLowerCase().includes("whatsapp")
    );
    if (matchingSection) return matchingSection;
  }

  if (isAppLink(link)) {
    matchingSection = sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("app") ||
        s.titulo.toLowerCase().includes("aplicación") ||
        s.titulo.toLowerCase().includes("aplicacion")
    );
    if (matchingSection) return matchingSection;
  }

  // Partial matching fallback
  matchingSection = sectionsInfo.find((s) => {
    const sectionTitle = s.titulo.toLowerCase();
    return sectionTitle.includes(linkLabel) || linkLabel.includes(sectionTitle);
  });
  if (matchingSection) return matchingSection;

  // Default to "Links" section if exists, otherwise return null
  return (
    sectionsInfo.find(
      (s) =>
        s.titulo.toLowerCase().includes("links") ||
        s.titulo.toLowerCase().includes("enlaces")
    ) || null
  );
};

/**
 * Enhanced getSectionsRecord function with intelligent section assignment
 */
export function getSectionsRecord(
  links: BiositeLink[],
  sectionsInfo: { titulo: string; orderIndex: number }[],
  LINK_TYPES?: any
) {
  // Agrupa los links activos por título de sección
  const grouped: Record<string, BiositeLink[]> = {};
  for (const section of sectionsInfo) {
    grouped[section.titulo] = [];
  }

  for (const link of links) {
    if (link.isActive) {
      const matchingSection = determineLinkSection(
        link,
        sectionsInfo,
        LINK_TYPES
      );

      if (matchingSection) {
        grouped[matchingSection.titulo].push(link);
      }
    }
  }

  // Ordena las secciones por orderIndex y elimina títulos repetidos
  const orderedSections = sectionsInfo
    .filter((v, i, a) => a.findIndex((t) => t.titulo === v.titulo) === i)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Construye el record final
  const sections: Record<string, BiositeLink[]> = {};
  for (const section of orderedSections) {
    sections[section.titulo] = grouped[section.titulo] || [];
  }
  return sections;
}

/**
 * Creates an ordered sections record with active links using Section interface
 */
export const createOrderedSectionsRecord = (
  links: BiositeLink[],
  sections: Section[]
): Map<Section_type, BiositeLink[]> => {
  // Remove duplicates and sort by orderIndex
  const uniqueSections = sections
    .reduce((acc, current) => {
      const existing = acc.find((section) => section.titulo === current.titulo);
      if (!existing) {
        acc.push(current);
      } else {
        // Check if current has more recent update (handle both updatedAt and updated_at properties)
        const currentDate =
          current.updatedAt || current.updatedAt || new Date(0);
        const existingDate =
          existing.updatedAt || existing.updatedAt || new Date(0);

        if (
          new Date(currentDate).getTime() > new Date(existingDate).getTime()
        ) {
          const index = acc.findIndex(
            (section) => section.titulo === current.titulo
          );
          acc[index] = current;
        }
      }
      return acc;
    }, [] as Section[])
    .sort((a, b) => a.orderIndex - b.orderIndex);

  // Group links by section (this will respect the order of uniqueSections)
  const grouped = groupLinksBySection(links, uniqueSections);

  // Create final ordered Map - PRESERVE THE ORDER from uniqueSections
  const orderedMap = new Map<Section_type, BiositeLink[]>();

  // Remove empty sections while preserving order
  uniqueSections.forEach((section) => {
    const sectionLinks = grouped.get(section.titulo) || [];

    // Keep sections with links or if it's a vCard section
    const isVCardSection =
      section.titulo.toLowerCase().includes("vcard") ||
      section.titulo.toLowerCase().includes("Profile");

    if (sectionLinks.length > 0 || isVCardSection) {
      orderedMap.set(section.titulo as Section_type, sectionLinks);
    }
  });

  return orderedMap;
};
