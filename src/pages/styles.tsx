import { usePreview } from "../context/PreviewContext";

const fontOptions = [
    { name: "Inter", value: "Inter" },
    { name: "Lato", value: "Lato" },
    { name: "Roboto", value: "Roboto" },
    { name: "Poppins", value: "Poppins" },
    { name: "Montserrat", value: "Montserrat" },
    { name: "Open Sans", value: "Open Sans" }
];

const colorOptions = [
    { name: "Blanco", value: "#ffffff" },
    { name: "Amarillo Claro", value: "#fef3c7" },
    { name: "Verde Agua", value: "#f0fdfa" },
    { name: "Verde Claro", value: "#ecfdf5" },
    { name: "Gris Claro", value: "#f3f4f6" },
    { name: "Azul Claro", value: "#eff6ff" },
    { name: "Rosa Claro", value: "#fdf2f8" },
    { name: "Púrpura Claro", value: "#faf5ff" }
];

const StylesPage = () => {
    const {
        biosite,
        themeColor,
        setThemeColor,
        fontFamily,
        setFontFamily,
        loading
    } = usePreview();

    const handleThemeColorChange = async (color: string) => {
        try {
            await setThemeColor(color);
        } catch (error) {
            console.error("Error updating theme color:", error);
        }
    };

    const handleFontFamilyChange = async (font: string) => {
        try {
            await setFontFamily(font);
        } catch (error) {
            console.error("Error updating font family:", error);
        }
    };


    if (loading) {
        return (
            <div className="p-6 space-y-8">
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
        <div className="p-6 space-y-8 max-w-4xl mx-auto h-full  ">
            {/* Información del biosite */}
            {biosite && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h1 className="text-lg font-semibold text-gray-900 mb-2">
                        Personalizando: {biosite.title}
                    </h1>
                    <p className="text-sm text-gray-600">
                        Personaliza la apariencia de tu biosite con las opciones disponibles.
                    </p>
                </div>
            )}

            {/* Selector de fuente */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Tipografía
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Selecciona la fuente que mejor represente tu estilo
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fontOptions.map((font) => (
                        <button
                            key={font.value}
                            onClick={() => handleFontFamilyChange(font.value)}
                            className={`p-3 rounded-lg border-2 transition-all duration-200 hover:shadow-md text-left ${
                                fontFamily === font.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                            style={{ fontFamily: font.value }}
                        >
                            <div className="font-medium text-sm">{font.name}</div>
                            <div className="text-xs opacity-60 mt-1">
                                Ejemplo de texto
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de color de tema */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                    Color de Fondo
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                    Elige el color de fondo que mejor complemente tu contenido
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {colorOptions.map((color) => (
                        <button
                            key={color.value}
                            onClick={() => handleThemeColorChange(color.value)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md flex flex-col items-center space-y-2 ${
                                themeColor === color.value
                                    ? "border-blue-500 ring-2 ring-blue-200"
                                    : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                            <div
                                className="w-8 h-8 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.value }}
                            />
                            <div className="text-xs font-medium text-gray-700 text-center">
                                {color.name}
                            </div>
                        </button>
                    ))}
                </div>
            </div>


            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            Consejo de personalización
                        </h3>
                        <p className="text-xs text-blue-700 mt-1">
                            Los cambios se aplican automáticamente. Puedes ver el resultado en tiempo real en la vista previa de tu biosite.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StylesPage;
