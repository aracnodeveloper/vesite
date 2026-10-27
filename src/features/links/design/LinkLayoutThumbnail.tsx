import type { CSSProperties, ReactNode } from "react";
import type { LinkLayout } from "./linkLayouts";
import { tint, type LinksTheme } from "./linksTheme";

interface SketchColors {
  card: string;
  cardBar: string;
  pageBar: string;
  empty: string;
  text?: string;
}

/** Imagen de un link de ejemplo, o un bloque suave si no hay. */
const Img = ({ src, className, style, colors }: { src?: string; className: string; style?: CSSProperties; colors: SketchColors }) =>
  src ? (
    <img src={src} alt="" className={`object-cover ${className}`} style={style} />
  ) : (
    <span className={`block ${className}`} style={{ background: colors.empty, ...style }} />
  );

const Bar = ({ color, className }: { color: string; className: string }) => (
  <span className={`block h-[3px] shrink-0 rounded-full ${className}`} style={{ background: color }} />
);

/** Tres filas iguales; `row` dibuja cada una. */
const Rows = ({ row }: { row: (index: number) => ReactNode }) => (
  <div className="flex h-full flex-col justify-center gap-[7%]">{[0, 1, 2].map(row)}</div>
);

const sketch = (layout: LinkLayout, image: (i: number) => string | undefined, c: SketchColors): ReactNode => {
  switch (layout) {
    case "pill":
      return (
        <Rows
          row={(i) => (
            <span key={i} className="flex h-[20%] items-center gap-[6%] rounded-full p-[2.5%]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="aspect-square h-full rounded-full" />
              <Bar color={c.cardBar} className="w-[45%]" />
            </span>
          )}
        />
      );
    case "thumbnail":
      return (
        <Rows
          row={(i) => (
            <span key={i} className="flex h-[24%] items-center gap-[8%] overflow-hidden rounded-[4px]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="aspect-square h-full" />
              <Bar color={c.cardBar} className="w-[40%]" />
            </span>
          )}
        />
      );
    case "alternate":
      return (
        <Rows
          row={(i) => (
            <span key={i} className={`flex h-[22%] items-center gap-[4%] ${i % 2 ? "flex-row-reverse" : ""}`}>
              <Img src={image(i)} colors={c} className="aspect-square h-full rounded-full" />
              <span className="flex h-full flex-1 items-center rounded-full px-[8%]" style={{ background: c.card }}>
                <Bar color={c.cardBar} className="w-[60%]" />
              </span>
            </span>
          )}
        />
      );
    case "numbered":
      return (
        <Rows
          row={(i) => (
            <span key={i} className="flex h-[20%] items-center gap-[6%] border-b pb-[3%]" style={{ borderColor: c.pageBar }}>
              <Img src={image(i)} colors={c} className="aspect-square h-[80%] rounded-full" />
              <Bar color={c.pageBar} className="w-[40%]" />
              <span className="ml-auto text-[7px] leading-none" style={{ color: c.text }}>
                0{i + 1}
              </span>
            </span>
          )}
        />
      );
    case "card":
      return (
        <div className="flex h-full flex-col justify-center">
          <span className="overflow-hidden rounded-[4px]" style={{ background: c.card }}>
            <Img src={image(0)} colors={c} className="block aspect-[4/3] w-full" />
            <span className="flex items-center justify-between p-[5%]">
              <Bar color={c.cardBar} className="w-[40%]" />
              <span className="h-[6px] w-[6px] rounded-full border" style={{ borderColor: c.cardBar }} />
            </span>
          </span>
        </div>
      );
    case "carousel":
      return (
        <div className="flex h-full items-center gap-[5%]">
          {[0, 1, 2].map((i) => (
            <span key={i} className="relative aspect-square w-[44%] shrink-0 overflow-hidden rounded-[3px]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="absolute inset-0 h-full w-full" />
              <Bar color="#fff" className="absolute bottom-[10%] left-[10%] w-[40%]" />
            </span>
          ))}
        </div>
      );
    case "grid":
      return (
        <div className="grid h-full grid-cols-2 content-center gap-[6%]">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="rounded-[3px] p-[6%]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="block aspect-[4/3] w-full rounded-[2px]" />
              <Bar color={c.cardBar} className="mt-[8%] w-[50%]" />
            </span>
          ))}
        </div>
      );
    case "framed":
      return (
        <div className="flex h-full items-center justify-center">
          <span className="relative aspect-square w-[85%] overflow-hidden rounded-[4px]">
            <Img src={image(0)} colors={c} className="absolute inset-0 h-full w-full" />
            <span className="absolute inset-x-[4%] bottom-[4%] flex justify-center rounded-[3px] py-[6%]" style={{ background: c.card }}>
              <Bar color={c.cardBar} className="w-[35%]" />
            </span>
          </span>
        </div>
      );
    case "story":
      return (
        <span className="mx-auto flex h-full w-[72%] flex-col rounded-[4px] p-[7%]" style={{ background: c.card }}>
          <Bar color={c.cardBar} className="w-[20%]" />
          <span className="flex flex-1 items-center justify-center">
            <Img src={image(0)} colors={c} className="aspect-square w-[72%] rounded-full" />
          </span>
          <Bar color={c.cardBar} className="w-[45%]" />
          <Bar color={c.cardBar} className="mt-[6%] w-[30%] opacity-60" />
        </span>
      );
    case "poster":
      return (
        <span className="mx-auto flex h-full w-[72%] flex-col items-center rounded-[4px] p-[7%]" style={{ background: c.card }}>
          <Bar color={c.cardBar} className="w-[20%]" />
          <span className="mt-[8%] block h-[7px] w-[70%] rounded-[2px]" style={{ background: c.cardBar }} />
          <Img src={image(0)} colors={c} className="mt-[10%] aspect-square w-[75%]" />
          <Bar color={c.cardBar} className="mt-auto w-[25%] opacity-60" />
        </span>
      );
    case "slider":
      return (
        <div className="flex h-full items-center gap-[5%]">
          {[0, 1].map((i) => (
            <span key={i} className="relative aspect-video w-[82%] shrink-0 overflow-hidden rounded-[3px]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="absolute inset-0 h-full w-full" />
              <Bar color="#fff" className="absolute bottom-[12%] left-[8%] w-[35%]" />
            </span>
          ))}
        </div>
      );
    case "stack":
      return (
        <div className="flex h-full items-center">
          <span className="relative block w-full">
            {[2, 1].map((depth) => (
              <span
                key={depth}
                className="absolute inset-0 rounded-[4px]"
                style={{ background: c.card, transform: `translateY(${depth * 4}px) scaleX(${1 - depth * 0.06})`, opacity: 1 - depth * 0.3 }}
              />
            ))}
            <span className="relative flex h-[22px] items-center gap-[6%] rounded-[4px] p-[3%]" style={{ background: c.card }}>
              <Img src={image(0)} colors={c} className="aspect-square h-full rounded-[2px]" />
              <Bar color={c.cardBar} className="w-[40%]" />
              <span className="ml-auto h-[7px] w-[7px] rounded-full border" style={{ borderColor: c.cardBar }} />
            </span>
          </span>
        </div>
      );
    default:
      return (
        <Rows
          row={(i) => (
            <span key={i} className="flex h-[20%] items-center gap-[6%] rounded-[3px] p-[2.5%]" style={{ background: c.card }}>
              <Img src={image(i)} colors={c} className="aspect-square h-full rounded-[2px]" />
              <Bar color={c.cardBar} className="w-[45%]" />
            </span>
          )}
        />
      );
  }
};

/** Miniatura cuadrada de un diseño de links con las imágenes y colores del usuario. */
const LinkLayoutThumbnail = ({ layout, images, theme }: { layout: LinkLayout; images: string[]; theme: LinksTheme }) => {
  const { colors } = theme;
  const linkColor = colors.accentText || colors.text || "#000000";
  const sketchColors: SketchColors = {
    // Sin color de acento las tarjetas son transparentes: en pequeño se marcan con un tono suave
    card: colors.accent || tint(colors.text || "#000000", 10)!,
    cardBar: tint(linkColor, 70)!,
    pageBar: tint(colors.text || "#000000", 45)!,
    empty: tint(linkColor, 25)!,
    text: colors.text,
  };
  const image = (i: number) => (images.length ? images[i % images.length] : undefined);

  return (
    <div className="relative aspect-square w-full overflow-hidden" style={{ background: colors.background || "#ffffff" }}>
      <div className="absolute inset-0 p-[12%]">{sketch(layout, image, sketchColors)}</div>
    </div>
  );
};

export default LinkLayoutThumbnail;
