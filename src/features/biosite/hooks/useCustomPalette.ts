import { useEffect, useState } from "react";
import type { BiositeFull } from "../types/Biosite";

export type PaletteColors = {
  background: string;
  text: string;
  accent: string;
  border: string;
  accentText: string;
};
export type PaletteColorKey = keyof PaletteColors;

const PRESET_COLORS: PaletteColors = {
  background: "#4A7BA8",
  text: "#FFFFFF",
  accent: "#3E648C",
  border: "#4A7BA8",
  accentText: "#FFFFFF",
};

// Border y accentText son opcionales: arrancan apagados
const DEFAULT_SEND: Record<PaletteColorKey, boolean> = {
  background: true,
  text: true,
  accent: true,
  border: false,
  accentText: false,
};

const parseColors = (colors: BiositeFull["colors"] | undefined): Record<string, string> | null => {
  try {
    const parsed = typeof colors === "string" ? JSON.parse(colors) : colors;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export interface PaletteSelection {
  background: string;
  text: string;
  accent: string;
  border?: string;
  accentText?: string;
}

/**
 * Estado de la paleta personalizada. Cada color tiene un interruptor
 * "enviar": si está apagado, al aplicar se conserva el valor del biosite.
 */
export const useCustomPalette = (biosite: BiositeFull | null) => {
  const [customColors, setCustomColors] = useState<PaletteColors>({
    background: "#ffffff",
    text: "#000000",
    accent: "#3b82f6",
    border: "#000000",
    accentText: "#000000",
  });
  const [sendColors, setSendColors] = useState(DEFAULT_SEND);

  // Inicializar con los colores actuales del biosite
  useEffect(() => {
    const parsed = parseColors(biosite?.colors);
    if (!parsed) return;

    const hasBorder = !!parsed.border && parsed.border !== "transparent";
    const hasAccentText = !!parsed.accentText;

    setCustomColors((prev) => ({
      background: parsed.background || prev.background,
      text: parsed.text || prev.text,
      accent: parsed.accent || prev.accent,
      border: hasBorder ? parsed.border : prev.border,
      accentText: hasAccentText ? parsed.accentText : parsed.text || prev.accentText,
    }));
    setSendColors((prev) => ({ ...prev, border: hasBorder, accentText: hasAccentText }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biosite?.id]);

  const setColor = (key: PaletteColorKey, value: string) =>
    setCustomColors((prev) => ({ ...prev, [key]: value }));

  const toggleSend = (key: PaletteColorKey) =>
    setSendColors((prev) => ({ ...prev, [key]: !prev[key] }));

  const reset = () => {
    setCustomColors(PRESET_COLORS);
    setSendColors(DEFAULT_SEND);
  };

  /** Colores a enviar: los apagados conservan el valor actual o no se envían. */
  const getSelection = (): PaletteSelection => {
    const current = parseColors(biosite?.colors) || {};
    const pick = (key: "background" | "text" | "accent") =>
      sendColors[key] ? customColors[key] : current[key] ?? customColors[key];

    return {
      background: pick("background"),
      text: pick("text"),
      accent: pick("accent"),
      border: sendColors.border ? customColors.border : undefined,
      accentText: sendColors.accentText ? customColors.accentText : undefined,
    };
  };

  return { customColors, sendColors, setColor, toggleSend, reset, getSelection };
};

export type CustomPalette = ReturnType<typeof useCustomPalette>;
