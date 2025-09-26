import { usePreview } from "../context/PreviewContext";
import React, { useState } from "react";

const fontOptions = [
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
  { name: "Lucida Console", value: "Lucida Console, Courier New, monospace" },
];

const googleFontOptions = [
  { name: "Open Sans", value: "'Open Sans', Arial, sans-serif" },
  { name: "Roboto", value: "'Roboto', Arial, sans-serif" },
  { name: "Lato", value: "'Lato', Arial, sans-serif" },
  { name: "Montserrat", value: "'Montserrat', Arial, sans-serif" },
  { name: "Poppins", value: "'Poppins', Arial, sans-serif" },
  { name: "Nunito", value: "'Nunito', Arial, sans-serif" },
  { name: "Source Sans Pro", value: "'Source Sans Pro', Arial, sans-serif" },
  { name: "Raleway", value: "'Raleway', Arial, sans-serif" },
  { name: "Inter", value: "'Inter', Arial, sans-serif" },
  { name: "Work Sans", value: "'Work Sans', Arial, sans-serif" },
];

const colorCategories = {
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
      name: "Maldives",
      value:
          "linear-gradient(180deg, #E8F4F8 0%, #B8E6D3 30%, #7ECAA9 60%, #4A7C59 100%)",
      textColor: "#2D4A3A",
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
      value: "#EB8201",
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
  ],
};

// Función para determinar si un color es claro u oscuro
const isLightColor = (hex: string): boolean => {
  if (!hex || hex.length !== 7) return true;

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Fórmula de luminancia
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

// Función para generar color de acento basado en el color principal
const generateAccentColor = (hex: string): string => {
  if (!hex || hex.length !== 7) return "#f3f4f6";

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Hacer el color un poco más oscuro/claro para el acento
  const factor = isLightColor(hex) ? 0.9 : 1.1;
  const newR = Math.min(255, Math.max(0, Math.round(r * factor)));
  const newG = Math.min(255, Math.max(0, Math.round(g * factor)));
  const newB = Math.min(255, Math.max(0, Math.round(b * factor)));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}80`;
};

const StylesPage = () => {
  const {
    biosite,
    themeColor,
    setThemeColor,
    fontFamily,
    setFontFamily,
    loading,
  } = usePreview();

  const [activeTab, setActiveTab] = useState("light");
  const [showWarning, setShowWarning] = useState(true);
  const [customColors, setCustomColors] = useState({
    background: "#ffffff",
    text: "#000000",
    accent: "#3b82f6"
  });
  const [showCustomSelector, setShowCustomSelector] = useState(false);

  const handleThemeColorChange = async (
      color: string,
      textColor: string,
      accentColor: string
  ) => {
    try {
      console.log("Changing theme color to:", {
        color,
        textColor,
        accentColor,
      });
      await setThemeColor(color, textColor, accentColor);

      setTimeout(() => {
        console.log("Theme color change completed");
      }, 100);
    } catch (error) {
      console.error("Error updating theme color:", error);
      alert("Error al actualizar el color. Por favor intenta de nuevo.");
    }
  };

  const handleCustomColorChange = (colorType: 'background' | 'text' | 'accent', value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorType]: value
    }));
  };

  const applyCustomColors = async () => {
    try {
      // Aplicar los colores exactamente como el usuario los configuró
      await handleThemeColorChange(
          customColors.background,
          customColors.text,
          customColors.accent
      );
    } catch (error) {
      console.error("Error applying custom colors:", error);
      alert("Error al aplicar los colores personalizados.");
    }
  };

  const handleFontFamilyChange = async (font: string) => {
    try {
      console.log("Changing font to:", font);
      await setFontFamily(font);

      setTimeout(() => {
        console.log("Font change completed, forcing refresh");
      }, 200);
    } catch (error) {
      console.error("Error updating font family:", error);
      alert("Error al actualizar la fuente. Por favor intenta de nuevo.");
    }
  };

  const toggleWarning = () => {
    setShowWarning(!showWarning);
  };

  // Componente para renderizar una grid de colores
  const ColorGrid = ({ colors }) => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
        {colors.map((color) => (
            <button
                key={color.value}
                onClick={() =>
                    handleThemeColorChange(
                        color.value,
                        color.textColor,
                        color.accentColor
                    )
                }
                className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl transform ${
                    themeColor === color.value
                        ? "ring-2 sm:ring-3 ring-blue-500 ring-offset-2 shadow-lg scale-105"
                        : "hover:shadow-lg"
                }`}
                style={{
                  background: color.value.startsWith("linear-gradient")
                      ? color.value
                      : color.value,
                  backgroundColor: color.value.startsWith("linear-gradient")
                      ? undefined
                      : color.value,
                  minHeight: "100px",
                }}
            >
              {/* Overlay con degradado sutil */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Contenido de la tarjeta */}
              <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between items-center">

                {/* Indicador de selección */}
                {themeColor === color.value && (
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                )}

                {/* Sección superior - Muestra de texto */}
                <div className="flex flex-col items-center space-y-1 sm:space-y-2">
                  <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: "rgba(255, 255, 255, 0.15)",
                        color: color.textColor,
                        fontSize: "10px",
                        fontWeight: "600",
                      }}
                  >
                    Aa
                  </div>

                  {/* Muestra de link/acento */}
                  <div
                      className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium backdrop-blur-sm border border-white/20"
                      style={{
                        backgroundColor: color.accentColor.includes('rgb') ? color.accentColor : color.accentColor + '80',
                        color: color.textColor,
                        fontSize: "9px",
                        minWidth: "40px",
                        textAlign: "center",
                      }}
                  >
                    Link
                  </div>
                </div>

                {/* Sección inferior - Nombre del color */}
                <div
                    className="text-center mt-2 px-1 py-1 sm:px-2 sm:py-1 rounded-lg backdrop-blur-sm w-full"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      color: color.textColor
                    }}
                >
                  <div
                      className="text-xs sm:text-sm font-semibold leading-tight"
                      style={{ color: color.textColor }}
                  >
                    {color.name}
                  </div>
                  {/* Código de color para colores sólidos */}
                  {!color.value.startsWith("linear-gradient") && (
                      <div
                          className="text-xs opacity-75 font-mono mt-1 hidden sm:block"
                          style={{ color: color.textColor, fontSize: "10px" }}
                      >
                        {color.value.toUpperCase()}
                      </div>
                  )}
                </div>
              </div>

              {/* Efecto de brillo en hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full"
                   style={{ animation: themeColor === color.value ? 'none' : '' }} />
            </button>
        ))}
      </div>
  );

  if (loading) {
    return (
        <div className="p-4 sm:p-6 space-y-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded-full w-24"></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="p-6 space-y-8 max-w-150 mx-auto h-full mt-0 lg:mt-20 z-50 ">
        {/* Información del biosite */}
        {biosite && (
            <div className="rounded-lg p-3 sm:p-4 mb-0">
              <h1 className="text-medium font-bold text-gray-800 mb-3 sm:mb-5 uppercase tracking-wide text-start sr-only sm:not-sr-only">
                Estilos
              </h1>
              <p className="text-sm text-gray-600">
                {biosite.title} Personaliza la apariencia de tu sitio con las
                opciones disponibles.
              </p>
            </div>
        )}

        {/* Selector de fuente */}
        <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide text-start">
            Tipografía
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {fontOptions.map((font) => (
                <button
                    key={font.value}
                    onClick={() => handleFontFamilyChange(font.value)}
                    className={`p-2 sm:p-3 rounded-lg cursor-pointer border-2 bg-white transition-all duration-200 hover:shadow-md text-left ${
                        fontFamily === font.value
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                    style={{ fontFamily: font.value }}
                >
                  <div className="font-medium text-sm">{font.name}</div>
                  <div
                      className="text-xs opacity-60 mt-1"
                      style={{ fontFamily: font.value }}
                  >
                    Ejemplo de texto
                  </div>
                </button>
            ))}
          </div>
        </div>

        {/* Selector de color de tema */}
        <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
          <h3 className="text-xs font-bold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide text-start">
            Temas
          </h3>

          {/* Pestañas Light/Dark */}
          <div className="flex mb-4 sm:mb-6">
            <button
                onClick={() => setActiveTab("light")}
                className={`px-4 sm:px-6 py-2 rounded-l-lg font-medium cursor-pointer text-sm transition-all duration-200 ${
                    activeTab === "light"
                        ? "bg-white text-gray-900 border border-gray-300 shadow-sm"
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              Light
            </button>
            <button
                onClick={() => setActiveTab("dark")}
                className={`px-4 sm:px-6 py-2 rounded-r-lg cursor-pointer font-medium text-sm transition-all duration-200 ${
                    activeTab === "dark"
                        ? "bg-gray-800 text-white border border-gray-800 shadow-sm"
                        : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              Dark
            </button>
          </div>

          {/* Grid de colores según la pestaña activa */}
          <ColorGrid colors={colorCategories[activeTab]} />

          {/* Botón para mostrar selector personalizado */}
          <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-200">
            <button
                onClick={() => setShowCustomSelector(!showCustomSelector)}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-white text-gray-600 cursor-pointer rounded-xl hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <div className="relative">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
              <span className='text-black text-xs sm:text-sm'>Crear Color Personalizado</span>
              <svg
                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 text-black ${showCustomSelector ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Selector de color personalizado */}
          {showCustomSelector && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-200/60 shadow-inner">
                <div className="flex items-start sm:items-center gap-3 mb-4 sm:mb-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide text-start">Paleta Personalizada</h4>
                    <p className="text-xs text-gray-500 ml-2 uppercase tracking-wide">Crea tu combinación única de colores</p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  {/* Panel de controles de color */}
                  <div className="space-y-4 sm:space-y-5">
                    {/* Selector de color de fondo */}
                    <div className="group">
                      <label className="flex items-center gap-2 font-semibold mb-2 sm:mb-3 text-xs text-gray-500 uppercase tracking-wide text-start">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.background}}></div>
                        Color de Fondo
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 group-hover:shadow-md transition-all duration-200">
                        <input
                            type="color"
                            value={customColors.background}
                            onChange={(e) => handleCustomColorChange('background', e.target.value)}
                            className="w-full sm:w-14 h-12 rounded-lg border-2 border-white cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        />
                        <input
                            type="text"
                            value={customColors.background}
                            onChange={(e) => handleCustomColorChange('background', e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm border-0 rounded-lg bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400/50 font-mono font-medium tracking-wide transition-all duration-200"
                            placeholder="#ffffff"
                            maxLength={7}
                        />
                      </div>
                    </div>

                    {/* Selector de color de texto */}
                    <div className="group">
                      <label className="flex items-center gap-2 font-semibold mb-2 sm:mb-3 text-xs text-gray-500 uppercase tracking-wide text-start">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.text}}></div>
                        Color de Texto
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 group-hover:shadow-md transition-all duration-200">
                        <input
                            type="color"
                            value={customColors.text}
                            onChange={(e) => handleCustomColorChange('text', e.target.value)}
                            className="w-full sm:w-14 h-12 rounded-lg border-2 border-white cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        />
                        <input
                            type="text"
                            value={customColors.text}
                            onChange={(e) => handleCustomColorChange('text', e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm border-0 rounded-lg bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-gray-400/50 font-mono font-medium tracking-wide transition-all duration-200"
                            placeholder="#000000"
                            maxLength={7}
                        />
                      </div>
                    </div>

                    {/* Selector de color de acento/links */}
                    <div className="group">
                      <label className="flex items-center gap-2 font-semibold mb-2 sm:mb-3 text-xs text-gray-500 uppercase tracking-wide text-start">
                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.accent}}></div>
                        Color de Links/Acento
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 group-hover:shadow-md transition-all duration-200">
                        <input
                            type="color"
                            value={customColors.accent}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="w-full sm:w-14 h-12 rounded-lg border-2 border-white cursor-pointer shadow-lg hover:scale-105 transition-transform"
                        />
                        <input
                            type="text"
                            value={customColors.accent}
                            onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm border-0 rounded-lg bg-gray-50/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-400/50 font-mono font-medium tracking-wide transition-all duration-200"
                            placeholder="#3b82f6"
                            maxLength={7}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center gap-2 font-semibold mb-2 sm:mb-3 text-xs text-gray-500 uppercase tracking-wide text-start">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.background}}></div>
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.text}}></div>
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: customColors.accent}}></div>
                    Vista Previa en Vivo
                  </label>

                  {/* Preview mejorado */}
                  <div
                      className="relative h-24 sm:h-32 rounded-2xl border-2 border-white shadow-xl overflow-hidden"
                      style={{ backgroundColor: customColors.background }}
                  >
                    {/* Patrón de fondo sutil */}
                    <div className="absolute inset-0 opacity-5">
                      <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, ${customColors.text} 1px, transparent 0)`,
                        backgroundSize: '20px 20px'
                      }}></div>
                    </div>

                    <div className="relative h-full p-3 sm:p-6 flex flex-col justify-center items-center space-y-2 sm:space-y-3">
                      <h3
                          className="text-sm sm:text-lg font-bold text-center"
                          style={{ color: customColors.text }}
                      >
                        Mi Sitio Web
                      </h3>
                      <p
                          className="text-xs sm:text-sm text-center opacity-80"
                          style={{ color: customColors.text }}
                      >
                        Este es un texto de ejemplo
                      </p>
                      <div className="flex">
                        <div
                            className="px-3 sm:px-4 py-1 sm:py-2 rounded-lg text-xs font-semibold shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            style={{
                              backgroundColor: customColors.accent,
                              color: customColors.background
                            }}
                        >
                          Link Principal
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Información de contraste */}
                  <div className="p-3 bg-white/60 rounded-lg border border-gray-200/60">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Asegúrate de que haya buen contraste entre colores</span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:pt-6 mt-4 sm:mt-6 border-t border-gray-200/60">
                  <button
                      onClick={() => {
                        setCustomColors({
                          background: "#ffffff",
                          text: "#000000",
                          accent: "#3b82f6"
                        });
                      }}
                      className="flex-1 flex items-center justify-center cursor-pointer gap-2 px-4 sm:px-6 py-3 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-white hover:border-gray-300 hover:text-gray-700 transition-all duration-200 font-medium group"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="text-xs sm:text-sm">Restablecer</span>
                  </button>
                  <button
                      onClick={applyCustomColors}
                      className="flex-1 flex items-center justify-center cursor-pointer gap-2 px-4 sm:px-6 py-3 bg-white text-gray-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 group"
                  >
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs sm:text-sm">Aplicar Colores</span>
                  </button>
                </div>
              </div>
          )}
        </div>

        {/* Información adicional */}
        <div
            className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 mb-10"
            onClick={toggleWarning}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 cursor-pointer">
              <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
              >
                <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                />
              </svg>
            </div>
            {showWarning && (
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800">
                    Consejo de personalización
                  </h3>
                  <p className="text-xs text-blue-700 mt-1">
                    Usa el selector de color personalizado para crear temas únicos. El sistema automáticamente ajustará los colores de texto y acentos para garantizar buena legibilidad.
                  </p>
                </div>
            )}
          </div>
        </div>
        <div className="h-10 sm:h-20"></div>
      </div>
  );
};

export default StylesPage;