import type { BiositeListParams } from "../../biosite/services/biositeService";
import type { BusinessCard } from "../../vcard/types/V-Card";
import type { FilterState } from "../components/SearchAndFilters";
import type { LinkData } from "../types/AdminData";

const SOCIAL_PLATFORMS = [
  "instagram", "tiktok", "twitter", "x", "youtube", "facebook", "twitch", "linkedin", "snapchat",
  "threads", "gmail", "pinterest", "spotify", "discord", "tumblr", "telegram", "amazon", "onlyfans",
];
const APP_STORES = ["appstore", "googleplay", "apps.apple.com", "play.google.com"];
const EMBED_KEYWORDS = ["music", "video", "embed", "player", "post", "publicacion"];

/** Cuenta los links de un biosite por categoría para las tablas del panel. */
export const categorizeLinks = (links: LinkData[]) => {
  const categories = {
    total: links?.length || 0,
    social: 0,
    regular: 0,
    whatsApp: 0,
    apps: 0,
    embed: 0,
  };

  (links || []).forEach((link) => {
    const labelLower = link.label?.toLowerCase() || "";
    const urlLower = link.url?.toLowerCase() || "";
    const iconLower = link.icon?.toLowerCase() || "";
    const mentions = (word: string) => labelLower.includes(word) || urlLower.includes(word);

    if (urlLower.includes("api.whatsapp.com") || iconLower === "whatsapp") {
      categories.whatsApp++;
    } else if (APP_STORES.some(mentions)) {
      categories.apps++;
    } else if (EMBED_KEYWORDS.some(mentions)) {
      categories.embed++;
    } else if (SOCIAL_PLATFORMS.some((platform) => mentions(platform) || iconLower.includes(platform))) {
      categories.social++;
    } else {
      categories.regular++;
    }
  });

  return categories;
};

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const parseVCardData = (businessCard: BusinessCard | null) => {
  if (!businessCard?.data) return null;

  try {
    return typeof businessCard.data === "string" ? JSON.parse(businessCard.data) : businessCard.data;
  } catch (error) {
    console.error("Error parsing VCard data:", error);
    return null;
  }
};

/** Convierte los filtros del buscador en parámetros de la API de biosites. */
export const filtersToListParams = (filters: FilterState, page: number, size: number): BiositeListParams => {
  const params: BiositeListParams = { page, size };

  if (filters.search?.trim()) params.search = filters.search.trim();
  if (filters.sortBy) params.sortBy = filters.sortBy;
  if (filters.sortOrder) params.sortOrder = filters.sortOrder;
  if (filters.status !== "all") params.status = filters.status;
  if (filters.dateRange !== "all") params.dateRange = filters.dateRange;

  // La búsqueda exacta de slug tiene prioridad sobre el filtro with-slug/without-slug
  if (filters.slugSearch?.trim()) {
    params.slugSearch = filters.slugSearch.trim();
  } else if (filters.hasSlug !== "all") {
    params.hasSlug = filters.hasSlug;
  }

  return params;
};
