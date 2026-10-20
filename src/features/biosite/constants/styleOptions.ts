export interface ColorOption {
  name: string;
  value: string;
  textColor: string;
  accentColor: string;
}

export const PALETTE_ICON =
  "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z";

export const FONT_OPTIONS = [
  { name: "Arial", value: "Arial, sans-serif" },
  { name: "Times New Roman", value: "Times New Roman, Times, serif" },
  { name: "Courier New", value: "Courier New, Courier, monospace" },
  { name: "Georgia", value: "Georgia, Times, serif" },
  { name: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { name: "Helvetica", value: "Helvetica, Arial, sans-serif" },
  { name: "System UI", value: "system-ui, Arial, sans-serif" },
  { name: "Segoe UI", value: "Segoe UI, Arial, sans-serif" },
  { name: "Serif Stack", value: "Georgia, Times New Roman, Times, serif" },
  { name: "Mono Stack", value: "Courier New, Monaco, monospace" },
  { name: "Century Gothic", value: "Century Gothic, Arial, sans-serif" },
  { name: "Lucid Console", value: "Lucida Console, Courier New, monospace" },
];

/** Paletas predefinidas de la pantalla de estilos. */
export const COLOR_CATEGORIES: { light: ColorOption[]; dark: ColorOption[] } = {
  light: [
    {
      name: "Blanco",
      value: "#ffffff",
      textColor: "#000000",
      accentColor: "#f3f4f6",
    },
    {
      name: "Lavanda Suave",
      value: "#EAE2F2",
      textColor: "#15074D",
      accentColor: "#DDD6FE87",
    },
    {
      name: "Terracota",
      value: "#dcc6ad",
      textColor: "#92400E",
      accentColor: "#FEF3C770",
    },
    {
      name: "Verde Lima",
      value: "#F1FEDD",
      textColor: "#1A4442",
      accentColor: "#D1FAE554",
    },
    {
      name: "Azul Jeans",
      value: "#E2EEEE",
      textColor: "#061861",
      accentColor: "#DBEAFE",
    },
    {
      name: "Beige Cálido",
      value: "#F3F0E7",
      textColor: "#92400E",
      accentColor: "#dbdfca",
    },
    {
      name: "Rosa Pálido",
      value: "#EFDBDB",
      textColor: "#272727",
      accentColor: "#FECACA7C",
    },
    {
      name: "Gradiente Seoul",
      value: "linear-gradient(180deg, #A7F3D0 0%, #F3E8FF 100%)",
      textColor: "#4D1A81",
      accentColor: "#E9D5FF6",
    },
    {
      name: "Rosa Berlin",
      value: "linear-gradient(135deg, #E8D3C1 0%, #EC9FE4 100%)",
      textColor: "#000000",
      accentColor: "#F3E8FF7C",
    },
    {
      name: "Mumbai",
      value:
          "linear-gradient(180deg, #F4E4D6 0%, #D4A574 30%, #B8956A 60%, #6B4A3A 100%)",
      textColor: "#3D2817",
      accentColor: "#6B4A3A66",
    },
    {
      name: "VE",
      value:
          "linear-gradient(180deg, #E8F4F8 0%, #C2D58F 30%, #ABC26E 60%, #96C121 100%)",
      textColor: "#FFFFFF",
      accentColor: "#4A7C5966",
    },
  ],
  dark: [
    {
      name: "Negro",
      value: "#000000",
      textColor: "#B1B1B1",
      accentColor: "#3741516B",
    },
    {
      name: "Naranja",
      value: "#b66500",
      textColor: "#FFFFFF",
      accentColor: "#FB923C",
    },
    {
      name: "Los Gallos",
      value: "#1B3444",
      textColor: "#9A7854",
      accentColor: "#DCD8DE",
    },
    {
      name: "Verde militar",
      value: "#373E24",
      textColor: "#E3DFF3",
      accentColor: "#6B728049",
    },
    {
      name: "Sao Paulo",
      value: "#1C2928",
      textColor: "#B0FF2E",
      accentColor: "#6B728049",
    },
    {
      name: "Azul Nocturno",
      value: "#080221",
      textColor: "#FFFFFF",
      accentColor: "#1E1B4B82",
    },
    {
      name: "Azul Acero",
      value: "#4A7BA8",
      textColor: "#FFFFFF",
      accentColor: "#3E648C",
    },
    {
      name: "Marrón Canela",
      value: "#BF6737",
      textColor: "#FFFFFF",
      accentColor: "#F59E0B3A",
    },
    {
      name: "Barcelona",
      value: "linear-gradient(135deg, #F4E4D6 0%, #E8B4A0 50%, #A0564B 100%)",
      textColor: "#5D2C20",
      accentColor: "#A0564B4C",
    },
    {
      name: "verde Metalico",
      value:  "#5A8B6B",
      textColor: "#FFFFFF",
      accentColor: "#32533CFF",
    },
    {
      name: "Terracota Apagado",
      value:  "#A0785A",
      textColor: "#FFFFFF",
      accentColor: "#70543FFF",
    },
    {
      name: "Rosa empolvado oscuro",
      value:  "#8B5A6B",
      textColor: "#FFFFFF",
      accentColor: "#5E3D48FF",
    }
  ],
};
