import type { HeaderLayout, Platilla } from "../types/Templates";

/** Layout de los biosites sin plantilla (o con una que este front no conoce). */
export const DEFAULT_HEADER_LAYOUT: HeaderLayout = "classic";

/** Qué imágenes muestra cada layout; el resto se ignora aunque esté subida. */
export const HEADER_LAYOUT_IMAGES: Record<HeaderLayout, { background: boolean; avatar: boolean }> = {
    classic: { background: true, avatar: true },
    twin: { background: true, avatar: true },
    portrait: { background: false, avatar: true },
    polaroid: { background: true, avatar: false },
    windows: { background: false, avatar: true },
};

const isHeaderLayout = (value: unknown): value is HeaderLayout =>
    typeof value === "string" && value in HEADER_LAYOUT_IMAGES;

export const getTemplateLayout = (template?: Platilla): HeaderLayout | undefined => {
    const layout = template?.config?.layout;
    return isHeaderLayout(layout) ? layout : undefined;
};

export const resolveHeaderLayout = (templates: Platilla[], plantillaId?: string | null): HeaderLayout =>
    getTemplateLayout(templates.find((template) => template.id === plantillaId)) ?? DEFAULT_HEADER_LAYOUT;

/** Plantillas que se pueden elegir: las activas con un layout que el front sabe dibujar. */
export const getSelectableTemplates = (templates: Platilla[]): Platilla[] =>
    templates.filter((template) => getTemplateLayout(template));
