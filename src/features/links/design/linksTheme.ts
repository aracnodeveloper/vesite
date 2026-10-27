/** Colores y fuentes del tema que usan los diseños de links. */
export interface LinksTheme {
  colors: { accent?: string; accentText?: string; text?: string; border?: string; background?: string };
  fonts: { primary?: string; secondary?: string };
}

/** El color con transparencia, para fondos suaves y separadores. */
export const tint = (color: string | undefined, percent: number) =>
  color ? `color-mix(in srgb, ${color} ${percent}%, transparent)` : undefined;
