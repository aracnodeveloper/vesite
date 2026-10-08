import type { ColorOption } from "../../constants/styleOptions";

interface ColorGridProps {
  colors: ColorOption[];
  selectedColor: string;
  onSelect: (color: ColorOption) => void;
}

/** Rejilla de paletas predefinidas con una muestra de texto y de link. */
const ColorGrid = ({ colors, selectedColor, onSelect }: ColorGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-4">
    {colors.map((color) => {
      const isSelected = selectedColor === color.value;
      const isGradient = color.value.startsWith("linear-gradient");

      return (
        <button
          key={color.value}
          onClick={() => onSelect(color)}
          className={`group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl transform ${
            isSelected ? "ring-2 sm:ring-3 ring-blue-500 ring-offset-2 shadow-lg scale-105" : "hover:shadow-lg"
          }`}
          style={{
            background: color.value,
            backgroundColor: isGradient ? undefined : color.value,
            minHeight: "100px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10 p-3 sm:p-4 h-full flex flex-col justify-between items-center">
            {isSelected && (
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}

            <div className="flex flex-col items-center space-y-1 sm:space-y-2">
              <div
                className="w-8 h-8 sm:w-8 sm:h-8 rounded-full border-2 border-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  color: color.textColor,
                  fontSize: "10px",
                  fontWeight: "600",
                }}
              >
                Aa
              </div>

              <div
                className="px-2 sm:px-3  rounded-full text-xs font-medium backdrop-blur-sm border border-white/20"
                style={{
                  backgroundColor: color.accentColor.includes("rgb") ? color.accentColor : color.accentColor + "80",
                  color: color.textColor,
                  fontSize: "9px",
                  minWidth: "40px",
                  textAlign: "center",
                }}
              >
                Link
              </div>
            </div>

            <div
              className="text-center mt-2 px-1  sm:px-2  rounded-lg backdrop-blur-sm w-full"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", color: color.textColor }}
            >
              <div className="font-semibold leading-tight" style={{ color: color.textColor, fontSize: "10px" }}>
                {color.name}
              </div>
              {!isGradient && (
                <div
                  className="text-xs opacity-75 font-mono mt-1 hidden sm:block"
                  style={{ color: color.textColor, fontSize: "10px" }}
                >
                  {color.value.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full"
            style={{ animation: isSelected ? "none" : "" }}
          />
        </button>
      );
    })}
  </div>
);

export default ColorGrid;
