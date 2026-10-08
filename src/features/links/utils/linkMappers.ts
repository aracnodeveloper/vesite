import type { AppLink, RegularLink, SocialLink, WhatsAppLink } from "../../biosite/types/PreviewContext";
import type { Link } from "../types/Links";

const ICON_MAP: Record<string, string> = {
  "/assets/icons/instagram.svg": "instagram",
  "/assets/icons/tiktok.svg": "tiktok",
  "/assets/icons/X.svg": "twitter",
  "/assets/icons/youtube.svg": "youtube",
  "/assets/icons/facebook.svg": "facebook",
  "/assets/icons/twitch.svg": "twitch",
  "/assets/icons/linkdl.svg": "linkedin",
  "/assets/icons/snapchat.svg": "snapchat",
  "/assets/icons/threads.svg": "threads",
  "/assets/icons/gmail.svg": "email",
  "/assets/icons/pinterest.svg": "pinterest",
  "/assets/icons/spottufy.svg": "spotify",
  "/assets/icons/discord.svg": "discord",
  "/assets/icons/tumblr.svg": "tumblr",
  "/assets/icons/whatsapp.svg": "whatsapp",
  "/assets/icons/telegram.svg": "telegram",
  "/assets/icons/amazon.svg": "amazon",
  "/assets/icons/onlyfans.svg": "onlyfans",
  "/assets/icons/appstore.svg": "appstore",
  "/assets/icons/googleplay.svg": "googleplay",
};

const SPECIAL_ICONS = ["link", "social-post", "music-embed", "video-embed"];

/** Identificador corto de un icono a partir de su ruta (p. ej. "instagram"). */
export const getIconIdentifier = (iconPath: string): string => {
  if (SPECIAL_ICONS.includes(iconPath)) return iconPath;

  const fullPath = Object.keys(ICON_MAP).find((path) => path.includes(iconPath));
  if (fullPath) return ICON_MAP[fullPath];

  return (iconPath.split("/").pop()?.replace(".svg", "") || "link").toLowerCase();
};

export const APP_STORES = {
  appstore: { icon: "appstore", label: "App Store" },
  googleplay: { icon: "googleplay", label: "Google Play" },
} as const;

export const getStoreType = (link: Pick<Link, "label" | "url">): AppLink["store"] => {
  const labelLower = link.label.toLowerCase();
  const urlLower = link.url.toLowerCase();
  return labelLower.includes("google play") || urlLower.includes("play.google.com") ? "googleplay" : "appstore";
};

export const buildWhatsAppUrl = (phone: string, message: string): string =>
  `https://api.whatsapp.com/send?phone=${phone.replace(/[^\d+]/g, "")}&text=${encodeURIComponent(message)}`;

/** Extrae teléfono y mensaje de una URL api.whatsapp.com/send. */
export const parseWhatsAppUrl = (
  url: string,
  label?: string
): { phone: string; message: string; description: string } => {
  const description = label || "WhatsApp";

  try {
    let phone = "";
    let message = "";

    if (url.includes("api.whatsapp.com/send")) {
      const urlParams = new URLSearchParams(url.split("?")[1] || "");
      phone = urlParams.get("phone") || "";
      message = decodeURIComponent(urlParams.get("text") || "");
    }

    phone = phone.replace(/[^\d+]/g, "");

    // El mensaje puede venir codificado varias veces
    if (message) {
      try {
        let previous = "";
        while (message !== previous) {
          previous = message;
          message = decodeURIComponent(message);
        }
      } catch (decodeError) {
        console.warn("Error decoding message:", decodeError);
      }
    }

    return { phone, message, description };
  } catch (error) {
    console.error("Error parsing WhatsApp URL:", error);
    return { phone: "", message: "", description };
  }
};

export const toSocialLink = (link: Link): SocialLink => ({
  id: link.id,
  label: link.label,
  name: link.label,
  url: link.url,
  icon: link.icon,
  color: link.color,
  isActive: link.isActive,
});

export const toRegularLink = (link: Link): RegularLink => ({
  id: link.id,
  title: link.label,
  url: link.url,
  image: link.image,
  orderIndex: link.orderIndex,
  isActive: link.isActive,
  isSelected: link.isSelected || false,
});

export const toAppLink = (link: Link): AppLink => ({
  id: link.id,
  store: getStoreType(link),
  url: link.url,
  isActive: link.isActive,
});

export const toWhatsAppLink = (link: Link): WhatsAppLink => ({
  id: link.id,
  ...parseWhatsAppUrl(link.url, link.label),
  isActive: link.isActive,
});
