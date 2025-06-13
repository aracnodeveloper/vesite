import {usePreview} from "../context/PreviewContext.tsx";


const COLORS = [
    { name: "London", value: "#ffffff" },
    { name: "Stockholm", value: "#ede9fe" },
    { name: "Brussels", value: "#fef08a" },
    { name: "Dublin", value: "#d9f99d" },
    { name: "San Diego", value: "#dbeafe" },
    { name: "Phoenix", value: "#fca5a5" },
    { name: "Paris", value: "#fce7f3" },
    { name: "Seoul", value: "#f5d0fe" },
    { name: "Berlin", value: "#f0abfc" },
];

const FONTS = [
    "Lato",
    "Roboto",
    "Playfair",
    "Playfair Black",
    "Bebas",
    "Open Sans",
    "Cinzel",
    "Cinzel Pack",
    "Bebas Pack",
    "Slab",
    "Alegreya",
    "Oswald",
];

const Styles = () => {
    const { themeColor, fontFamily, setThemeColor, setFontFamily } = usePreview();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Panel izquierdo */}
            <div className="w-[60%] p-6 text-white overflow-y-auto">
                <h2 className="text-2xl font-semibold mb-4">Style</h2>

                <div className="mb-6">
                    <h3 className="text-sm font-semibold mb-2">THEMES</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {COLORS.map((theme) => (
                            <button
                                key={theme.name}
                                onClick={() => setThemeColor(theme.value)}
                                className={`h-16 rounded-lg shadow-inner border-2 transition-all ${
                                    themeColor === theme.value
                                        ? "ring-4 ring-white border-white"
                                        : "border-transparent"
                                }`}
                                style={{ backgroundColor: theme.value }}
                            />
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-semibold mb-2">FONTS</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {FONTS.map((font) => (
                            <button
                                key={font}
                                onClick={() => setFontFamily(font)}
                                className={`bg-neutral-800 rounded-md p-3 w-full text-white text-center ${
                                    fontFamily === font ? "ring-2 ring-purple-400" : ""
                                }`}
                                style={{ fontFamily: font }}
                            >
                                {font}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Styles;
