import type { BiositeFull } from "../../biosite/types/Biosite";
import type { Platilla } from "../../biosite/types/Templates";
import { useTemplates } from "../../biosite/hooks/useTemplates";
import DesignPicker from "../../biosite/components/DesignPicker";
import { getThemeConfig, isValidImageUrl } from "../../../shared/utils/biositeUtils";
import LinkLayoutThumbnail from "./LinkLayoutThumbnail";
import {
  DEFAULT_LINK_LAYOUT,
  LINK_CATEGORIES,
  LINK_LAYOUT_CATEGORY,
  getLinkTemplateLayout,
  getSelectableLinkTemplates,
  type LinkLayout,
} from "./linkLayouts";

const layoutOf = (template: Platilla): LinkLayout => getLinkTemplateLayout(template) ?? DEFAULT_LINK_LAYOUT;

/**
 * Diseño de una sección de links (Links, Contáctame o App); se guarda al tocar
 * una tarjeta.
 */
const LinksTemplatePicker = ({
  biosite,
  selectedId,
  description,
  linkImages,
  imageFit,
  onSelect,
}: {
  biosite: BiositeFull;
  /** La plantilla guardada para esta sección (null = la de por defecto). */
  selectedId?: string | null;
  description: string;
  /** Imágenes de los links de la sección, para las miniaturas. */
  linkImages: (string | undefined)[];
  /** "contain" si las imágenes son iconos (WhatsApp, tiendas de apps). */
  imageFit?: "cover" | "contain";
  onSelect: (plantillaId: string) => Promise<void>;
}) => {
  const { templates, loading } = useTemplates();

  const selectable = getSelectableLinkTemplates(templates);
  if (!loading && selectable.length === 0) return null;

  // Sin plantilla (o con una que ya no existe) se ve la de por defecto
  const current =
    selectable.find((template) => template.id === selectedId) ??
    selectable.find((template) => layoutOf(template) === DEFAULT_LINK_LAYOUT);
  const theme = getThemeConfig(biosite);
  // Los iconos locales (svg importados) no son URLs http, así que solo se filtran los vacíos
  const images = linkImages
    .filter((image): image is string => !!image && (imageFit === "contain" || isValidImageUrl(image)))
    .slice(0, 4);

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 mb-1">Diseño</h3>
      <p className="text-xs text-gray-500 mb-3">{description}</p>
      <DesignPicker
        templates={selectable}
        loading={loading}
        categories={LINK_CATEGORIES}
        categoryOf={(template) => LINK_LAYOUT_CATEGORY[layoutOf(template)]}
        currentId={current?.id}
        thumbnailAspect="aspect-square"
        renderThumbnail={(template) => (
          <LinkLayoutThumbnail layout={layoutOf(template)} images={images} theme={theme} imageFit={imageFit} />
        )}
        onSelect={onSelect}
      />
    </div>
  );
};

export default LinksTemplatePicker;
