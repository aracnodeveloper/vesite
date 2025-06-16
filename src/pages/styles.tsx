import { usePreview } from "../context/PreviewContext";

const fontOptions = ["Lato", "Inter", "Roboto"];
const colorOptions = ["#ffffff", "#fef3c7", "#f0fdfa", "#ecfdf5", "#f3f4f6"];

const StylesPage = () => {
    const {
        themeColor,
        setThemeColor,
        fontFamily,
        setFontFamily,
        selectedTemplate,
        setSelectedTemplate,
    } = usePreview();

    return (
        <div className="p-6 space-y-8">
            <div>
                <h2 className="font-semibold mb-2">Font</h2>
                <div className="flex gap-3">
                    {fontOptions.map((font) => (
                        <button
                            key={font}
                            onClick={() => setFontFamily(font)}
                            className={`px-4 py-2 rounded-full border ${
                                fontFamily === font
                                    ? "bg-black text-white"
                                    : "border-gray-300 text-gray-700"
                            }`}
                            style={{ fontFamily: font }}
                        >
                            {font}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="font-semibold mb-2">Background Color</h2>
                <div className="flex gap-3">
                    {colorOptions.map((color) => (
                        <button
                            key={color}
                            onClick={() => setThemeColor(color)}
                            className={`w-8 h-8 rounded-full border ${
                                themeColor === color ? "border-black" : "border-gray-300"
                            }`}
                            style={{ backgroundColor: color }}
                        ></button>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="font-semibold mb-2">Template</h2>
                <div className="flex gap-4">
                    {[0, 1].map((tpl) => (
                        <button
                            key={tpl}
                            onClick={() => setSelectedTemplate(tpl)}
                            className={`w-24 h-32 border rounded-xl ${
                                selectedTemplate === tpl
                                    ? "border-black"
                                    : "border-gray-300 opacity-50"
                            }`}
                        >
                            <div className="w-full h-full bg-white">Tpl {tpl}</div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StylesPage;
