import {
  BarChartHorizontalBig,
  CreditCard,
  GanttChart,
  Palette,
  Shield,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  id: string;
  to: string;
  color: "green" | "orange" | "blue" | "red" | "amber";
}

const BASE_ITEMS: NavItem[] = [
  { icon: GanttChart, label: "Secciones", id: "sections", to: "/sections", color: "green" },
  { icon: Palette, label: "Estilos", id: "droplet", to: "/droplet", color: "orange" },
  { icon: BarChartHorizontalBig, label: "Estadísticas", id: "analytics", to: "/analytics", color: "blue" },
];

/** Entradas del menú lateral / inferior según los permisos del usuario. */
export const getNavItems = ({
  hasAdminAccess,
  hasBlackCard,
  userId,
}: {
  hasAdminAccess: boolean;
  hasBlackCard: boolean;
  userId?: string;
}): NavItem[] => [
  ...BASE_ITEMS,
  ...(hasAdminAccess
    ? [{ icon: Shield, label: "Administración", id: "admin", to: "/admin", color: "red" } as NavItem]
    : []),
  ...(hasBlackCard
    ? [{ icon: CreditCard, label: "Black Card", id: "blackcard", to: `/blackcard/${userId}`, color: "amber" } as NavItem]
    : []),
];

const ACTIVE_ITEM_CLASSES: Record<NavItem["color"], string> = {
  green: "text-[#98C022] border-l-4 border-[#98C022] lg:border-l-4",
  orange: "text-orange-600 border-l-4 border-orange-300 lg:border-l-4",
  blue: "text-blue-600 border-l-4 border-blue-300 lg:border-l-4",
  red: "text-red-600 border-l-4 border-red-300 lg:border-l-4",
  amber: "text-amber-500 border-l-4 border-amber-400 lg:border-l-4",
};

export const getNavItemClass = (item: NavItem, activeItem: string) =>
  activeItem === item.id ? ACTIVE_ITEM_CLASSES[item.color] + " " : "text-gray-600 hover:text-gray-300 ";

/** Devuelve la URL si es una imagen utilizable (http(s) o data:image base64); si no, `fallback`. */
export const toSafeImage = (url: string | null | undefined, fallback: string): string => {
  if (typeof url !== "string" || !url.trim()) return fallback;
  if (url.startsWith("data:")) {
    return /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/.test(url) ? url : fallback;
  }
  try {
    new URL(url);
    return url;
  } catch {
    return fallback;
  }
};
