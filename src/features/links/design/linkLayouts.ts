import type { Platilla } from "../../biosite/types/Templates";

/** Cómo se dibuja la sección de links del vesite. */
export type LinkLayout =
    | "button"
    | "pill"
    | "thumbnail"
    | "alternate"
    | "numbered"
    | "card"
    | "carousel"
    | "grid"
    | "framed"
    | "story"
    | "poster"
    | "slider"
    | "stack";

export type LinkCategory = "buttons" | "cards" | "advanced";

/** Secciones del vesite que eligen su propio diseño de links. */
export type LinkSection = "links" | "contact" | "app";

/** Campo del biosite donde se guarda el diseño de cada sección. */
export const LINK_SECTION_FIELD = {
    links: "linksPlantillaId",
    contact: "contactPlantillaId",
    app: "appPlantillaId",
} as const satisfies Record<LinkSection, string>;

/** El de siempre: botón rectangular con la imagen a la izquierda. */
export const DEFAULT_LINK_LAYOUT: LinkLayout = "button";

/** Pestañas del selector de diseño de links, en orden. */
export const LINK_CATEGORIES: { id: LinkCategory; label: string }[] = [
    { id: "buttons", label: "Botones" },
    { id: "cards", label: "Tarjetas" },
    { id: "advanced", label: "Avanzado" },
];

export const LINK_LAYOUT_CATEGORY: Record<LinkLayout, LinkCategory> = {
    button: "buttons",
    pill: "buttons",
    thumbnail: "buttons",
    alternate: "buttons",
    numbered: "buttons",
    card: "cards",
    carousel: "cards",
    grid: "cards",
    framed: "cards",
    story: "advanced",
    poster: "advanced",
    slider: "advanced",
    stack: "advanced",
};

const isLinkLayout = (value: unknown): value is LinkLayout =>
    typeof value === "string" && value in LINK_LAYOUT_CATEGORY;

export const getLinkTemplateLayout = (template?: Platilla): LinkLayout | undefined => {
    if (template?.config?.type !== "links") return undefined;
    const layout = template.config.layout;
    return isLinkLayout(layout) ? layout : undefined;
};

export const resolveLinkLayout = (templates: Platilla[], linksPlantillaId?: string | null): LinkLayout =>
    getLinkTemplateLayout(templates.find((template) => template.id === linksPlantillaId)) ?? DEFAULT_LINK_LAYOUT;

/** Plantillas de links que se pueden elegir: las activas con un layout que el front sabe dibujar. */
export const getSelectableLinkTemplates = (templates: Platilla[]): Platilla[] =>
    templates.filter((template) => getLinkTemplateLayout(template));
