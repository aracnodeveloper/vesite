import { useState } from "react";
import { usePreview } from "../context/PreviewContext";
import { useCustomPalette } from "../hooks/useCustomPalette";
import { COLOR_CATEGORIES, FONT_OPTIONS, PALETTE_ICON } from "../constants/styleOptions";
import ColorGrid from "../components/styles/ColorGrid";
import CustomPaletteEditor from "../components/styles/CustomPaletteEditor";

type ThemeTab = "light" | "dark" | "custom";

const tabClass = (active: boolean, activeClass: string, extra: string) =>
  `${extra} ${active ? activeClass : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50"}`;

const StylesPage = () => {
  const { biosite, themeColor, setThemeColor, fontFamily, setFontFamily, loading } = usePreview();

  const [activeTab, setActiveTab] = useState<ThemeTab>("light");
  const [showWarning, setShowWarning] = useState(true);
  const palette = useCustomPalette(biosite);

  const applyTheme = async (
    color: string,
    textColor: string,
    accentColor: string,
    border?: string,
    accentText?: string
  ) => {
    try {
      await setThemeColor(color, textColor, accentColor, border, accentText);
    } catch (error) {
      console.error("Error updating theme color:", error);
      alert("Error al actualizar el color. Por favor intenta de nuevo.");
    }
  };

  const applyCustomColors = async () => {
    try {
      const { background, text, accent, border, accentText } = palette.getSelection();
      await applyTheme(background, text, accent, border, accentText);
    } catch (error) {
      console.error("Error applying custom colors:", error);
      alert("Error al aplicar los colores personalizados.");
    }
  };

  const changeFont = async (font: string) => {
    try {
      await setFontFamily(font);
    } catch (error) {
      console.error("Error updating font family:", error);
      alert("Error al actualizar la fuente. Por favor intenta de nuevo.");
    }
  };

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
    <div className="p-6 space-y-8 max-w-120 mx-auto h-full mt-0 lg:mt-20 z-50 ">
      {biosite && (
        <div className="rounded-lg p-3 sm:p-4 mb-0">
          <h1 className="text-medium font-bold text-gray-800 mb-3 sm:mb-5 uppercase tracking-wide text-start sr-only sm:not-sr-only">
            Estilos
          </h1>
          <p className="text-sm text-gray-600">
            {biosite.title} Personaliza la apariencia de tu sitio con las opciones disponibles.
          </p>
        </div>
      )}

      {/* Selector de fuente */}
      <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
        <h3 className="text-xs font-bold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide text-start">
          Tipografía
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {FONT_OPTIONS.map((font) => (
            <button
              key={font.value}
              onClick={() => changeFont(font.value)}
              className={`p-2 sm:p-3 rounded-lg cursor-pointer border-2 bg-white transition-all duration-200 hover:shadow-md text-left ${
                fontFamily === font.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
              style={{ fontFamily: font.value }}
            >
              <div className="font-medium text-xs">{font.name}</div>
              <div className=" opacity-60 mt-1" style={{ fontFamily: font.value, fontSize: "10px" }}>
                Ejemplo de texto
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selector de color de tema */}
      <div className="rounded-lg border border-gray-200 p-3 sm:p-4">
        <h3 className="text-xs font-bold text-gray-500 mb-3 sm:mb-4 uppercase tracking-wide text-start">Temas</h3>

        <div className="flex mb-4 sm:mb-6">
          <button
            onClick={() => setActiveTab("light")}
            className={tabClass(
              activeTab === "light",
              "bg-white text-gray-900 border border-gray-300 shadow-sm",
              "px-4 sm:px-6 py-2 rounded-l-lg font-medium cursor-pointer text-sm transition-all duration-200"
            )}
          >
            Light
          </button>
          <button
            onClick={() => setActiveTab("dark")}
            className={tabClass(
              activeTab === "dark",
              "bg-gray-800 text-white border border-gray-800 shadow-sm",
              "px-4 sm:px-6 py-2 cursor-pointer font-medium text-sm transition-all duration-200"
            )}
          >
            Dark
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={tabClass(
              activeTab === "custom",
              "bg-white text-gray-400 border border-blue-500 shadow-lg",
              "group w-full sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 cursor-pointer rounded-r-lg transition-all duration-300 text-sm font-semibold"
            )}
          >
            <div className="relative">
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PALETTE_ICON} />
              </svg>
              {activeTab === "custom" && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <span className="text-xs sm:text-sm">Personalizado</span>
            {activeTab !== "custom" && (
              <svg
                className="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
        </div>

        {activeTab !== "custom" && (
          <ColorGrid
            colors={COLOR_CATEGORIES[activeTab]}
            selectedColor={themeColor}
            onSelect={(color) => applyTheme(color.value, color.textColor, color.accentColor)}
          />
        )}

        {activeTab === "custom" && <CustomPaletteEditor palette={palette} onApply={applyCustomColors} />}
      </div>

      {/* Información adicional */}
      <div
        className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-200 mb-10"
        onClick={() => setShowWarning(!showWarning)}
      >
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 cursor-pointer">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {showWarning && (
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">Consejo de personalización</h3>
              <p className="text-xs text-blue-700 mt-1">
                Usa el selector de color personalizado para crear temas únicos. El sistema automáticamente ajustará
                los colores de texto y acentos para garantizar buena legibilidad.
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
