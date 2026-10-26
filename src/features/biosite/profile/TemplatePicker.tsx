import { useState, type CSSProperties } from "react";
import { message } from "antd";
import { Check } from "lucide-react";
import type { BiositeFull } from "../types/Biosite";
import type { HeaderCategory, HeaderLayout, Platilla } from "../types/Templates";
import { useTemplates } from "../hooks/useTemplates";
import {
  DEFAULT_HEADER_LAYOUT,
  HEADER_CATEGORIES,
  HEADER_LAYOUTS,
  getSelectableTemplates,
  getTemplateLayout,
} from "../utils/headerLayouts";
import { getThemeConfig, isValidImageUrl } from "../../../shared/utils/biositeUtils";

interface TemplatePickerProps {
  biosite: BiositeFull;
  onSelect: (plantillaId: string) => Promise<void>;
}

type ThumbnailTheme = ReturnType<typeof getThemeConfig>;

/** Imagen del usuario en la miniatura, o un bloque gris si no la tiene. */
const Pic = ({ src, className, style }: { src?: string; className: string; style?: CSSProperties }) =>
  src ? (
    <img src={src} alt="" className={`object-cover ${className}`} style={style} />
  ) : (
    <span className={`block bg-gray-300 ${className}`} style={style} />
  );

const POLAROID_POSITIONS = ["left center", "center", "right center"];
const WINDOW_POSITIONS = [
  "top-[14%] w-[42%] -translate-x-[92%] -rotate-6 opacity-90",
  "top-[6%] w-[42%] -translate-x-[8%] rotate-6 opacity-90",
  "top-[18%] z-10 w-[48%] -translate-x-1/2",
];

const PRINT_SKETCH = "absolute left-1/2 w-[38%] bg-white p-[2px] shadow ring-1 ring-black/10";

/**
 * Cabecera de cada layout en pequeño, igual que se verá: sin foto de perfil, la
 * clásica la oculta y las demás usan la imagen de fondo. Las medidas en % escalan
 * con la tarjeta.
 */
const HeaderSketch = ({ layout, avatar, background }: { layout: HeaderLayout; avatar?: string; background?: string }) => {
  const profile = avatar ?? background;

  switch (layout) {
    case "twin":
      return (
        <div className="relative h-[36%] shrink-0">
          {avatar && (
            <span className={`${PRINT_SKETCH} top-[22%] -translate-x-[85%] -rotate-[8deg]`}>
              <Pic src={avatar} className="aspect-square w-full" />
            </span>
          )}
          <span
            className={`${PRINT_SKETCH} ${
              avatar ? "top-[30%] -translate-x-[12%] rotate-[14deg]" : "top-[22%] -translate-x-1/2 -rotate-[6deg]"
            }`}
          >
            <Pic src={background} className="aspect-square w-full" />
          </span>
        </div>
      );
    case "portrait":
      return (
        <div className="flex shrink-0 justify-center pt-[14%]">
          <Pic src={profile} className="aspect-square w-[62%] rounded-full" />
        </div>
      );
    case "polaroid":
      return (
        <div className="relative h-[40%] shrink-0 overflow-hidden">
          <Pic src={background} className="h-[62%] w-full blur-[1px]" />
          <div className="absolute inset-x-0 top-[10%] flex justify-center gap-[5%]">
            {POLAROID_POSITIONS.map((position, index) => (
              <span
                key={position}
                className={`shrink-0 bg-white p-[3%] pb-[9%] shadow ${index === 1 ? "w-[40%]" : "mt-[6%] w-[36%] opacity-90"}`}
              >
                <Pic src={background} className="aspect-[4/5] w-full" style={{ objectPosition: position }} />
              </span>
            ))}
          </div>
        </div>
      );
    case "windows":
      return (
        <div className="relative h-[42%] shrink-0">
          {WINDOW_POSITIONS.map((position) => (
            <span key={position} className={`absolute left-1/2 rounded-sm bg-[#1f1f1f] pt-[4px] shadow ${position}`}>
              <Pic src={profile} className="aspect-[4/5] w-full rounded-b-sm" />
            </span>
          ))}
        </div>
      );
    default:
      return (
        <>
          <Pic
            src={background}
            className="h-[30%] w-full shrink-0"
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
          />
          {avatar && (
            <Pic
              src={avatar}
              className="relative mx-auto -mt-[16%] aspect-square w-[32%] shrink-0 rounded-full border-2 border-white"
            />
          )}
        </>
      );
  }
};

/** Miniatura del vesite con los colores, la tipografía y las fotos del usuario. */
const LayoutThumbnail = ({ layout, biosite, theme }: { layout: HeaderLayout; biosite: BiositeFull; theme: ThumbnailTheme }) => {
  const avatar = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : undefined;
  const background = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : undefined;
  const { colors, fonts } = theme;

  return (
    <div
      className="flex aspect-[9/16] w-full flex-col overflow-hidden"
      style={{ background: colors.background, color: colors.text, fontFamily: fonts.primary }}
    >
      <HeaderSketch layout={layout} avatar={avatar} background={background} />
      <div className="mt-[8%] px-[8%] text-center">
        <p className="truncate text-[7px] font-semibold leading-tight">{biosite.title || "Nombre"}</p>
        <p className="truncate text-[5px] uppercase tracking-wide opacity-60">Descripción</p>
      </div>
      <div className="mt-[8%] flex flex-col gap-[4px] px-[10%]">
        {[0, 1, 2].map((bar) => (
          <span
            key={bar}
            className="h-[7px] rounded-sm shadow-sm"
            style={{ background: colors.accent || colors.text, opacity: colors.accent ? 1 : 0.12 }}
          />
        ))}
      </div>
    </div>
  );
};

const usesLabel = (layout: HeaderLayout) => {
  const { background, avatar } = HEADER_LAYOUTS[layout];
  if (background && avatar) return "Fondo y perfil";
  return background ? "Solo fondo" : "Solo perfil";
};

const layoutOf = (template: Platilla): HeaderLayout => getTemplateLayout(template) ?? DEFAULT_HEADER_LAYOUT;

/**
 * Diseño del perfil: la plantilla elegida cambia solo cómo se ven la imagen de
 * fondo y la foto de perfil. Se guarda al tocar una tarjeta.
 */
const TemplatePicker = ({ biosite, onSelect }: TemplatePickerProps) => {
  const { templates, loading } = useTemplates();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<HeaderCategory | null>(null);

  const selectable = getSelectableTemplates(templates);
  if (!loading && selectable.length === 0) return null;

  // Sin plantilla (o con una que ya no existe) se ve la de por defecto
  const current =
    selectable.find((template) => template.id === biosite.plantillaId) ??
    selectable.find((template) => layoutOf(template) === DEFAULT_HEADER_LAYOUT);
  const categories = HEADER_CATEGORIES.filter((category) =>
    selectable.some((template) => HEADER_LAYOUTS[layoutOf(template)].category === category.id)
  );
  const activeTab = tab ?? (current ? HEADER_LAYOUTS[layoutOf(current)].category : categories[0]?.id);
  const visible = selectable.filter((template) => HEADER_LAYOUTS[layoutOf(template)].category === activeTab);
  const theme = getThemeConfig(biosite);
  const hasAvatar = isValidImageUrl(biosite.avatarImage);

  const select = async (plantillaId: string) => {
    if (plantillaId === current?.id || savingId) return;
    setSavingId(plantillaId);
    try {
      await onSelect(plantillaId);
    } catch (error) {
      console.error("Error updating template:", error);
      message.error("No se pudo cambiar el diseño. Inténtalo de nuevo.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">DISEÑO</h3>

      {categories.length > 1 && (
        <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))` }}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setTab(category.id)}
              aria-pressed={category.id === activeTab}
              className={`h-10 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                category.id === activeTab
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {loading
          ? [0, 1, 2, 3].map((placeholder) => (
              <div key={placeholder} className="aspect-[9/16] animate-pulse rounded-xl bg-gray-100" />
            ))
          : visible.map((template) => {
              const layout = layoutOf(template);
              const isSelected = template.id === current?.id;
              const usesBackgroundAsAvatar = !hasAvatar && HEADER_LAYOUTS[layout].backgroundAsAvatar;

              return (
                <button
                  key={template.id}
                  type="button"
                  title={template.description}
                  onClick={() => select(template.id)}
                  disabled={!!savingId}
                  aria-pressed={isSelected}
                  className="group flex min-w-0 flex-col gap-1 text-left cursor-pointer disabled:cursor-wait"
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-xl transition-all ${
                      isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "ring-1 ring-gray-200 group-hover:ring-gray-400"
                    }`}
                  >
                    <LayoutThumbnail layout={layout} biosite={biosite} theme={theme} />
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    {savingId === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500" />
                      </div>
                    )}
                  </div>
                  <span className={`truncate text-[10px] font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                    {template.name}
                  </span>
                  <span className="-mt-1 text-[9px] leading-tight text-gray-400">{usesLabel(layout)}</span>
                  {usesBackgroundAsAvatar && (
                    <span className="text-[9px] leading-tight text-amber-600">
                      Sin foto de perfil: usa la imagen de fondo
                    </span>
                  )}
                </button>
              );
            })}
      </div>
    </div>
  );
};

export default TemplatePicker;
