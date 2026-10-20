import type { CustomPalette, PaletteColorKey } from "../../hooks/useCustomPalette";
import { PALETTE_ICON } from "../../constants/styleOptions";

const COLOR_ROWS: { colorKey: PaletteColorKey; label: string; optional?: boolean }[] = [
  { colorKey: "background", label: "Color de Fondo" },
  { colorKey: "text", label: "Color de Texto" },
  { colorKey: "accent", label: "Color de Links/Acento" },
  { colorKey: "border", label: "Color de Borde (links / VCard)", optional: true },
  { colorKey: "accentText", label: "Color de Texto de Links", optional: true },
];

interface ColorRowProps {
  label: string;
  optional?: boolean;
  value: string;
  enabled: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}

/** Selector de un color con el interruptor "enviar / mantener el actual". */
const ColorRow = ({ label, optional, value, enabled, onToggle, onChange }: ColorRowProps) => {
  const validHex = /^#[0-9A-Fa-f]{6}$/.test(value);

  return (
    <div className="group">
      <div
        className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 group-hover:shadow-md transition-all duration-200 ${
          enabled ? "" : "opacity-60"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={enabled}
            onClick={onToggle}
            title={enabled ? "Se enviará este color" : "No se enviará — se mantiene el actual"}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors cursor-pointer ${
              enabled ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                enabled ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>

          <div className="flex flex-col text-start">
            <span className="flex items-center gap-2 font-semibold text-xs text-gray-500 uppercase tracking-wide">
              <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: value }}></span>
              {label}
              {optional && <span className="text-[9px] text-blue-400 normal-case tracking-normal">opcional</span>}
            </span>
            <span className="text-[10px] normal-case tracking-normal text-gray-400 mt-0.5">
              {enabled ? value.toUpperCase() : "No se enviará — se mantiene el actual"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          <input
            type="text"
            value={value}
            disabled={!enabled}
            onChange={(e) => onChange(e.target.value)}
            className="w-20 px-2 py-1 text-xs font-mono rounded-md border border-gray-200 text-gray-600 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
          <div className="relative w-8 h-8">
            <input
              type="color"
              value={validHex ? value : "#000000"}
              disabled={!enabled}
              onChange={(e) => onChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <span
              className={`w-8 h-8 rounded-full border-4 border-white shadow-lg block ${
                enabled ? "hover:scale-105 transition-transform cursor-pointer" : "cursor-not-allowed"
              }`}
              style={{ backgroundColor: value }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface CustomPaletteEditorProps {
  palette: CustomPalette;
  onApply: () => void;
}

/** Editor de paleta personalizada con vista previa en vivo. */
const CustomPaletteEditor = ({ palette, onApply }: CustomPaletteEditorProps) => {
  const { customColors, sendColors } = palette;
  const sampleStyle = {
    background: customColors.accent,
    border: `1.5px solid ${sendColors.border ? customColors.border : "transparent"}`,
  };
  const sampleTextColor = sendColors.accentText ? customColors.accentText : customColors.text;

  return (
    <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-blue-50/40 rounded-2xl border border-gray-200/70 shadow-inner">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md flex-shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={PALETTE_ICON} />
          </svg>
        </div>
        <div className="text-start">
          <h4 className="text-sm font-bold text-gray-800">Paleta personalizada</h4>
          <p className="text-xs text-gray-500">Crea tu combinación única de colores</p>
        </div>
      </div>

      {/* Vista previa en vivo */}
      <div
        className="mb-5 rounded-xl p-4 border border-gray-200/60 transition-colors duration-300"
        style={{ background: customColors.background }}
      >
        <p
          className="text-[10px] uppercase tracking-widest mb-3 font-semibold"
          style={{ color: customColors.text, opacity: 0.55 }}
        >
          Vista previa
        </p>
        <div className="space-y-2">
          <div className="w-full flex items-center gap-3 p-2 rounded-lg shadow-sm transition-all duration-300" style={sampleStyle}>
            <div className="w-8 h-8 rounded-md bg-white/80 flex-shrink-0"></div>
            <span className="text-xs font-semibold truncate" style={{ color: sampleTextColor }}>
              Mi link de ejemplo
            </span>
          </div>
          <div
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg shadow-sm transition-all duration-300"
            style={sampleStyle}
          >
            <div className="w-7 h-7 rounded-md bg-white/80 flex-shrink-0"></div>
            <span className="text-xs font-bold" style={{ color: sampleTextColor }}>
              VCard
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 mb-4 px-1">
        <svg className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-[11px] text-gray-500 leading-relaxed">
          Usa el interruptor de cada color para decidir si se envía. Si lo apagas, ese color no se modifica y
          conserva el valor actual.
        </p>
      </div>

      <div className="space-y-2.5">
        {COLOR_ROWS.map(({ colorKey, label, optional }) => (
          <ColorRow
            key={colorKey}
            label={label}
            optional={optional}
            value={customColors[colorKey]}
            enabled={sendColors[colorKey]}
            onToggle={() => palette.toggleSend(colorKey)}
            onChange={(value) => palette.setColor(colorKey, value)}
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-5 mt-5 border-t border-gray-200/70">
        <button
          onClick={palette.reset}
          className="flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 border border-gray-300 text-gray-600 rounded-xl bg-white hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium group"
        >
          <svg
            className="w-4 h-4 group-hover:-rotate-180 transition-transform duration-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-xs sm:text-sm">Restablecer</span>
        </button>
        <button
          onClick={onApply}
          className="flex-1 flex items-center justify-center cursor-pointer gap-2 px-4 py-2.5 text-white bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 rounded-xl transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] group"
        >
          <svg
            className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-xs sm:text-sm">Aplicar colores</span>
        </button>
      </div>
    </div>
  );
};

export default CustomPaletteEditor;
