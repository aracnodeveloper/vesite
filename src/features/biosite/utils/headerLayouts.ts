import type { HeaderCategory, HeaderLayout, Platilla } from "../types/Templates";

/** Layout de los biosites sin plantilla (o con una que este front no conoce). */
export const DEFAULT_HEADER_LAYOUT: HeaderLayout = "classic";

/** Pestañas del selector de diseño, en orden. */
export const HEADER_CATEGORIES: { id: HeaderCategory; label: string }[] = [
    { id: "minimal", label: "Minimalista" },
    { id: "creative", label: "Creativo" },
];

/**
 * Pestaña de cada layout y qué imágenes muestra; el resto se ignora aunque esté
 * subida. `backgroundAsAvatar`: sin foto de perfil, pone la imagen de fondo en
 * su lugar (en vez de la silueta gris), porque la foto es el centro del diseño.
 */
export const HEADER_LAYOUTS: Record<
    HeaderLayout,
    { category: HeaderCategory; background: boolean; avatar: boolean; backgroundAsAvatar: boolean }
> = {
    classic: { category: "minimal", background: true, avatar: true, backgroundAsAvatar: false },
    twin: { category: "minimal", background: true, avatar: true, backgroundAsAvatar: true },
    portrait: { category: "minimal", background: false, avatar: true, backgroundAsAvatar: true },
    polaroid: { category: "creative", background: true, avatar: false, backgroundAsAvatar: false },
    windows: { category: "creative", background: false, avatar: true, backgroundAsAvatar: true },
};

const isHeaderLayout = (value: unknown): value is HeaderLayout =>
    typeof value === "string" && value in HEADER_LAYOUTS;

export const getTemplateLayout = (template?: Platilla): HeaderLayout | undefined => {
    if (template?.config?.type === "links") return undefined;
    const layout = template?.config?.layout;
    return isHeaderLayout(layout) ? layout : undefined;
};

export const resolveHeaderLayout = (templates: Platilla[], plantillaId?: string | null): HeaderLayout =>
    getTemplateLayout(templates.find((template) => template.id === plantillaId)) ?? DEFAULT_HEADER_LAYOUT;

/** Plantillas que se pueden elegir: las activas con un layout que el front sabe dibujar. */
export const getSelectableTemplates = (templates: Platilla[]): Platilla[] =>
    templates.filter((template) => getTemplateLayout(template));
