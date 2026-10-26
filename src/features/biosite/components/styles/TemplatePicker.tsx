import { useState, type CSSProperties } from "react";
import { message } from "antd";
import type { BiositeFull } from "../../types/Biosite";
import type { HeaderLayout } from "../../types/Templates";
import { useTemplates } from "../../hooks/useTemplates";
import {
  DEFAULT_HEADER_LAYOUT,
  HEADER_LAYOUT_IMAGES,
  getSelectableTemplates,
  getTemplateLayout,
} from "../../utils/headerLayouts";
import { isValidImageUrl } from "../../../../shared/utils/biositeUtils";

interface TemplatePickerProps {
  biosite: BiositeFull;
  onSelect: (plantillaId: string) => Promise<void>;
}

/** Imagen del usuario en la miniatura, o un bloque gris si no la tiene. */
const Pic = ({ src, className, style }: { src?: string; className: string; style?: CSSProperties }) =>
  src ? (
    <img src={src} alt="" className={`object-cover ${className}`} style={style} />
  ) : (
    <span className={`block bg-gray-300 ${className}`} style={style} />
  );

/** Nombre, descripción y links, iguales en todas las plantillas. */
const ContentLines = () => (
  <div className="mt-2 flex flex-col items-center gap-1 px-2">
    <span className="h-1 w-1/2 rounded-full bg-gray-400" />
    <span className="h-0.5 w-1/3 rounded-full bg-gray-300" />
    {[0, 1, 2].map((line) => (
      <span key={line} className="mt-0.5 h-2 w-full rounded-sm bg-gray-200" />
    ))}
  </div>
);

const LayoutThumbnail = ({ layout, avatar, background }: { layout: HeaderLayout; avatar?: string; background?: string }) => {
  const header = {
    classic: (
      <>
        <Pic
          src={background}
          className="h-12 w-full"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
        />
        <Pic src={avatar} className="relative mx-auto -mt-4 h-8 w-8 rounded-full border-2 border-white" />
      </>
    ),
    twin: (
      <div className="flex justify-center gap-1.5 pt-4">
        <Pic src={avatar} className="h-10 w-10 rounded" />
        <Pic src={background} className="h-10 w-10 rounded" />
      </div>
    ),
    portrait: (
      <div className="flex justify-center pt-3">
        <Pic src={avatar} className="h-14 w-14 rounded-full" />
      </div>
    ),
    polaroid: (
      <div className="relative h-16 overflow-hidden">
        <Pic src={background} className="h-10 w-full blur-[1px]" />
        <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
          {["left center", "center", "right center"].map((position, index) => (
            <span key={position} className={`shrink-0 bg-white p-0.5 pb-1.5 shadow ${index === 1 ? "" : "mt-1 opacity-90"}`}>
              <Pic src={background} className="h-9 w-8" style={{ objectPosition: position }} />
            </span>
          ))}
        </div>
      </div>
    ),
    windows: (
      <div className="relative h-16">
        {["-translate-x-[90%] -rotate-6 top-2", "-translate-x-[10%] rotate-6 top-1", "-translate-x-1/2 top-3 z-10"].map(
          (position) => (
            <span key={position} className={`absolute left-1/2 rounded-sm bg-[#1f1f1f] pt-1 shadow ${position}`}>
              <Pic src={avatar} className="h-11 w-9 rounded-b-sm" />
            </span>
          )
        )}
      </div>
    ),
  }[layout];

  return (
    <div className="aspect-[4/5] w-full overflow-hidden rounded-md border border-gray-200 bg-white">
      {header}
      <ContentLines />
    </div>
  );
};

const usesLabel = (layout: HeaderLayout) => {
  const { background, avatar } = HEADER_LAYOUT_IMAGES[layout];
  if (background && avatar) return "Fondo y foto de perfil";
  return background ? "Solo imagen de fondo" : "Solo foto de perfil";
};

/** Plantillas de cabecera: cambian solo cómo se ven la imagen de fondo y la de perfil. */
const TemplatePicker = ({ biosite, onSelect }: TemplatePickerProps) => {
  const { templates, loading } = useTemplates();
  const [savingId, setSavingId] = useState<string | null>(null);

  const selectable = getSelectableTemplates(templates);
  if (!loading && selectable.length === 0) return null;

  // Sin plantilla (o con una que ya no existe) se ve la de por defecto
  const currentId = selectable.some((template) => template.id === biosite.plantillaId)
    ? biosite.plantillaId
    : selectable.find((template) => getTemplateLayout(template) === DEFAULT_HEADER_LAYOUT)?.id;

  const avatar = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : undefined;
  const background = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : undefined;

  const select = async (plantillaId: string) => {
    if (plantillaId === currentId || savingId) return;
    setSavingId(plantillaId);
    try {
      await onSelect(plantillaId);
    } catch (error) {
      console.error("Error updating template:", error);
      message.error("No se pudo cambiar la plantilla. Inténtalo de nuevo.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
      <h3 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide text-start">Plantilla</h3>
      <p className="text-xs text-gray-500 mb-3 sm:mb-4">
        Cambia cómo se muestran tu imagen de fondo y tu foto de perfil.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
        {loading
          ? [0, 1, 2].map((placeholder) => (
              <div key={placeholder} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-100" />
            ))
          : selectable.map((template) => {
              const layout = getTemplateLayout(template) ?? DEFAULT_HEADER_LAYOUT;
              const isSelected = template.id === currentId;

              return (
                <button
                  key={template.id}
                  type="button"
                  title={template.description}
                  onClick={() => select(template.id)}
                  disabled={!!savingId}
                  aria-pressed={isSelected}
                  className={`relative flex flex-col gap-2 rounded-lg border-2 p-2 text-left cursor-pointer transition-all duration-200 hover:shadow-md disabled:cursor-wait ${
                    isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <LayoutThumbnail layout={layout} avatar={avatar} background={background} />
                  <div>
                    <div className={`text-xs font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                      {template.name}
                    </div>
                    <div className="mt-0.5 text-[10px] leading-snug text-gray-500">{usesLabel(layout)}</div>
                  </div>

                  {savingId === template.id && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/60">
                      <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500" />
                    </div>
                  )}
                </button>
              );
            })}
      </div>
    </div>
  );
};

export default TemplatePicker;
