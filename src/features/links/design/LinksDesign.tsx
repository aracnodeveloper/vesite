import { useEffect, useState, type CSSProperties, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronRight, Link2 } from "lucide-react";
import type { LinkLayout } from "./linkLayouts";
import { tint, type LinksTheme } from "./linksTheme";

/** Un link listo para pintar; en el editor no lleva url y `onClick` lleva a editarlo. */
export interface DesignLink {
  id?: string;
  label: string;
  url?: string;
  image?: string;
  onClick?: (e: MouseEvent) => void;
}

interface LayoutProps {
  links: DesignLink[];
  theme: LinksTheme;
  onTrack?: (id: string) => void;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Dominio del link para mostrarlo como subtítulo ("visitaecuador.com"). */
const hostOf = (url?: string) => {
  if (!url) return "";
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
};

/** Estilos comunes: la tarjeta con el color de acento y el texto de links. */
const styles = ({ colors, fonts }: LinksTheme) => ({
  card: { background: colors.accent, border: `1px solid ${colors.border || "transparent"}` } as CSSProperties,
  linkText: { color: colors.accentText, fontFamily: fonts.secondary || fonts.primary } as CSSProperties,
  pageText: { color: colors.text, fontFamily: fonts.secondary || fonts.primary } as CSSProperties,
  title: { color: colors.accentText, fontFamily: fonts.primary } as CSSProperties,
});

const OVERLAY = { background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" };

const LinkAnchor = ({
  link,
  onTrack,
  className = "",
  style,
  children,
}: {
  link: DesignLink;
  onTrack?: (id: string) => void;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <a
    href={link.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`cursor-pointer transition-transform duration-200 active:scale-[0.98] ${className}`}
    style={style}
    onClick={(e) => {
      link.onClick?.(e);
      if (link.id) onTrack?.(link.id);
    }}
  >
    {children}
  </a>
);

/** Imagen del link o, si no tiene o no carga, un bloque suave con el icono de enlace. */
const LinkImage = ({ link, theme, className }: { link: DesignLink; theme: LinksTheme; className: string }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [link.image]);

  if (!link.image || failed) {
    const color = theme.colors.accentText || theme.colors.text;
    return (
      <span className={`flex items-center justify-center ${className}`} style={{ background: tint(color, 12), color }}>
        <Link2 className="h-1/3 w-1/3 max-h-8 max-w-8 opacity-70" />
      </span>
    );
  }
  return <img src={link.image} alt="" className={`object-cover ${className}`} onError={() => setFailed(true)} />;
};

const keyOf = (link: DesignLink, index: number) => link.id ?? `${link.label}-${index}`;

const PillLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-2">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="flex items-center gap-3 rounded-full p-1.5 pr-5 shadow-lg hover:scale-[1.02]"
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="h-11 w-11 shrink-0 rounded-full" />
          <span className="line-clamp-2 flex-1 text-sm font-semibold" style={s.linkText}>{link.label}</span>
        </LinkAnchor>
      ))}
    </div>
  );
};

const ThumbnailLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-2">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="flex h-[72px] overflow-hidden rounded-xl shadow-lg hover:scale-[1.02]"
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="h-full w-[72px] shrink-0" />
          <span className="flex flex-1 items-center px-4">
            <span className="line-clamp-2 text-sm font-semibold" style={s.linkText}>{link.label}</span>
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

/** La imagen redonda va a la izquierda y a la derecha, una vez cada lado. */
const AlternateLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className={`flex items-center gap-2 hover:scale-[1.02] ${i % 2 ? "flex-row-reverse" : ""}`}
        >
          <LinkImage link={link} theme={theme} className="h-16 w-16 shrink-0 rounded-full shadow-lg" />
          <span className="flex h-16 flex-1 items-center rounded-full px-6 shadow-lg" style={s.card}>
            <span className="line-clamp-2 text-sm font-semibold" style={s.linkText}>{link.label}</span>
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

/** Sin tarjeta: el texto va sobre el fondo de la página, así que usa su color. */
const NumberedLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  const divider = `1px solid ${tint(theme.colors.text, 25) ?? "transparent"}`;
  return (
    <div className="mt-2">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="flex items-center gap-3 py-3 hover:opacity-80"
          style={i < links.length - 1 ? { borderBottom: divider } : undefined}
        >
          <LinkImage link={link} theme={theme} className="h-10 w-10 shrink-0 rounded-full" />
          <span className="line-clamp-2 flex-1 text-sm font-semibold uppercase tracking-wide" style={s.pageText}>
            {link.label}
          </span>
          <span className="text-xl" style={{ color: theme.colors.text, fontFamily: theme.fonts.primary }}>
            {pad(i + 1)}
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

const CardLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="block overflow-hidden rounded-2xl shadow-lg hover:scale-[1.01]"
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="block aspect-[4/3] w-full" />
          <span className="flex items-center gap-3 px-4 py-3">
            <span className="line-clamp-2 flex-1 text-sm font-semibold" style={s.linkText}>{link.label}</span>
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
              style={{ borderColor: theme.colors.accentText, color: theme.colors.accentText }}
            >
              <ChevronRight size={14} />
            </span>
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

/** Fila que se desliza de lado; sale hasta los bordes de la página. */
const SideScroller = ({ children }: { children: ReactNode }) => (
  <div
    className="-mx-4 mt-2 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2"
    // Sin scroll-padding el ajuste pega la primera tarjeta al borde de la pantalla
    style={{ scrollbarWidth: "none", scrollPaddingInline: 16 }}
  >
    {children}
  </div>
);

const CarouselLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <SideScroller>
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="relative block aspect-square w-[46%] shrink-0 snap-start overflow-hidden rounded-xl shadow-lg"
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="absolute inset-0 h-full w-full" />
          <span className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-8" style={OVERLAY}>
            <span className="line-clamp-2 text-xs font-semibold text-white" style={{ fontFamily: s.linkText.fontFamily }}>
              {link.label}
            </span>
          </span>
        </LinkAnchor>
      ))}
    </SideScroller>
  );
};

const GridLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 grid grid-cols-2 gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="block overflow-hidden rounded-xl p-1.5 shadow-lg hover:scale-[1.02]"
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="block aspect-[4/3] w-full rounded-lg" />
          <span className="block px-1.5 pb-1 pt-2">
            <span className="line-clamp-2 text-xs font-semibold" style={s.linkText}>{link.label}</span>
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

/** La imagen llena la tarjeta y el título va en una caja encima, abajo. */
const FramedLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  const hasAccent = !!theme.colors.accent;
  return (
    <div className="mt-2 flex flex-col gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="relative block aspect-square overflow-hidden rounded-2xl shadow-lg hover:scale-[1.01]"
          style={{ border: s.card.border }}
        >
          <LinkImage link={link} theme={theme} className="absolute inset-0 h-full w-full" />
          <span
            className="absolute inset-x-1.5 bottom-1.5 rounded-xl px-4 py-3 text-center"
            style={{ background: theme.colors.accent || "rgba(0,0,0,0.6)" }}
          >
            <span
              className="line-clamp-2 text-sm font-semibold"
              style={hasAccent ? s.linkText : { color: "#fff", fontFamily: s.linkText.fontFamily }}
            >
              {link.label}
            </span>
          </span>
        </LinkAnchor>
      ))}
    </div>
  );
};

/** Tarjetas altas numeradas con la imagen en un círculo. */
const StoryLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="flex aspect-[4/5] flex-col rounded-2xl p-5 shadow-lg hover:scale-[1.01]"
          style={s.card}
        >
          <span className="flex items-center justify-between text-[11px] font-semibold" style={s.linkText}>
            <span>
              {pad(i + 1)}/{pad(links.length)}
            </span>
            <ArrowUpRight size={16} />
          </span>
          <span className="flex flex-1 items-center justify-center py-4">
            <LinkImage link={link} theme={theme} className="aspect-square w-[80%] rounded-full" />
          </span>
          <span className="line-clamp-2 text-xl font-semibold" style={s.title}>{link.label}</span>
          {hostOf(link.url) && (
            <span className="mt-1 text-[10px] uppercase tracking-wide opacity-60" style={s.linkText}>
              {hostOf(link.url)}
            </span>
          )}
        </LinkAnchor>
      ))}
    </div>
  );
};

/** Tarjetas numeradas con el título grande encima de la imagen. */
const PosterLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <div className="mt-2 flex flex-col gap-3">
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className="flex flex-col items-center rounded-2xl px-5 pb-5 pt-4 text-center shadow-lg hover:scale-[1.01]"
          style={s.card}
        >
          <span className="text-[11px] font-semibold" style={s.linkText}>
            {pad(i + 1)}/{pad(links.length)}
          </span>
          <span className="mt-3 line-clamp-2 break-words text-4xl leading-tight" style={s.title}>{link.label}</span>
          <LinkImage link={link} theme={theme} className="mt-4 aspect-square w-[85%]" />
          {hostOf(link.url) && (
            <span className="mt-4 text-[10px] uppercase tracking-wide opacity-60" style={s.linkText}>
              {hostOf(link.url)}
            </span>
          )}
        </LinkAnchor>
      ))}
    </div>
  );
};

const SliderLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  return (
    <SideScroller>
      {links.map((link, i) => (
        <LinkAnchor
          key={keyOf(link, i)}
          link={link}
          onTrack={onTrack}
          className={`relative block aspect-video shrink-0 snap-center overflow-hidden rounded-xl shadow-lg ${
            links.length > 1 ? "w-[82%]" : "w-full"
          }`}
          style={s.card}
        >
          <LinkImage link={link} theme={theme} className="absolute inset-0 h-full w-full" />
          <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 px-3 pb-3 pt-10" style={OVERLAY}>
            <span className="line-clamp-1 flex-1 text-sm font-semibold text-white" style={{ fontFamily: s.linkText.fontFamily }}>
              {link.label}
            </span>
            <ArrowRight size={18} className="shrink-0 text-white" />
          </span>
        </LinkAnchor>
      ))}
    </SideScroller>
  );
};

/** Plegados se ve el primero con el resto asomando debajo; la flecha los despliega. */
const StackLinks = ({ links, theme, onTrack }: LayoutProps) => {
  const s = styles(theme);
  const [open, setOpen] = useState(false);
  const canStack = links.length > 1;
  const stacked = canStack && !open;
  const visible = stacked ? links.slice(0, 1) : links;

  const toggle = (e: MouseEvent | KeyboardEvent) => {
    // La flecha va dentro del link: que no lo abra
    e.preventDefault();
    e.stopPropagation();
    setOpen((value) => !value);
  };

  return (
    <div className="relative mt-2" style={{ paddingBottom: stacked ? 14 : 0 }}>
      {stacked &&
        [2, 1].slice(-(links.length - 1)).map((depth) => (
          <span
            key={depth}
            aria-hidden
            className="absolute inset-x-0 top-0 h-[72px] rounded-xl shadow"
            style={{ ...s.card, transform: `translateY(${depth * 7}px) scaleX(${1 - depth * 0.05})`, opacity: 1 - depth * 0.3 }}
          />
        ))}
      <div className="relative flex flex-col gap-2">
        {visible.map((link, i) => (
          <LinkAnchor
            key={keyOf(link, i)}
            link={link}
            onTrack={onTrack}
            className="flex h-[72px] items-center gap-3 rounded-xl p-3 shadow-lg"
            style={s.card}
          >
            <LinkImage link={link} theme={theme} className="h-12 w-12 shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1">
              <span className="line-clamp-1 text-sm font-semibold" style={s.linkText}>{link.label}</span>
              {hostOf(link.url) && (
                <span className="block truncate text-[10px] opacity-60" style={s.linkText}>{hostOf(link.url)}</span>
              )}
            </span>
            {i === 0 && canStack && (
              <span
                role="button"
                tabIndex={0}
                aria-expanded={open}
                aria-label={open ? "Plegar los links" : "Ver todos los links"}
                onClick={toggle}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggle(e)}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border"
                style={{ borderColor: theme.colors.accentText, color: theme.colors.accentText }}
              >
                <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
              </span>
            )}
          </LinkAnchor>
        ))}
      </div>
    </div>
  );
};

const LAYOUTS: Record<Exclude<LinkLayout, "button">, (props: LayoutProps) => ReactNode> = {
  pill: PillLinks,
  thumbnail: ThumbnailLinks,
  alternate: AlternateLinks,
  numbered: NumberedLinks,
  card: CardLinks,
  carousel: CarouselLinks,
  grid: GridLinks,
  framed: FramedLinks,
  story: StoryLinks,
  poster: PosterLinks,
  slider: SliderLinks,
  stack: StackLinks,
};

/**
 * La sección de links con el diseño elegido. "button" (el de siempre) lo sigue
 * pintando cada vista con su componente, así que aquí no dibuja nada.
 */
const LinksDesign = ({
  layout,
  links,
  themeConfig,
  onTrack,
}: {
  layout: LinkLayout;
  links: DesignLink[];
  themeConfig: LinksTheme;
  onTrack?: (id: string) => void;
}) => {
  if (layout === "button" || links.length === 0) return null;
  const Layout = LAYOUTS[layout];
  return <Layout links={links} theme={themeConfig} onTrack={onTrack} />;
};

export default LinksDesign;
