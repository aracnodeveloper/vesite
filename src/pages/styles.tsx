import { usePreview } from "../context/PreviewContext";
import React, { useState } from "react";

const fontOptions = [
    { name: "Arial", value: "arial" },
    { name: "MV Boli", value: "MV Boli" },
    { name: "Courier New", value: "Courier New" },
    { name: "Times New Roman", value: "Times New Roman" },
    { name: "calibri", value: "calibri" },
    { name: "INK FREE", value: "INK FREE" },
    { name: "Gabriola", value: "Gabriola" },
    { name: "Impact", value: "Impact" },
    { name: "Symbol", value: "Symbol" },
    { name: "SimSun", value: "SimSun" },
    { name: "Segoe Script", value: "Segoe Script" },
    { name: "Bahnschrift", value: "Bahnschrift" }
];


const colorCategories = {
    light: [
        { name: "Blanco", value: "#ffffff", textColor: "#000000", accentColor: "#f3f4f6" },
        { name: "Lavanda Suave", value: "#EAE2F2", textColor: "#15074D", accentColor: "#DDD6FE" },
        { name: "Amarillo ", value: "#FDF46B", textColor: "#92400E", accentColor: "#FEF3C7" },
        { name: "Verde Lima", value: "#F1FEDD", textColor: "#1A4442", accentColor: "#D1FAE5" },
        { name: "Azul Jeans", value: "#E2EEEE", textColor: "#061861", accentColor: "#DBEAFE" },
        { name: "Beige Cálido", value: "#F3F0E7", textColor: "#92400E", accentColor: "#FEF7CD" },
        { name: "Rosa Pálido", value: "#EFDBDB", textColor: "#272727", accentColor: "#FECACA" },
        { name: "Gradiente Seoul", value: "linear-gradient(180deg, #A7F3D0 0%, #F3E8FF 100%)", textColor: "#4D1A81", accentColor: "#E9D5FF" },
        { name: "Rosa Berlin", value: "linear-gradient(135deg, #E8D3C1 0%, #EC9FE4 100%)", textColor: "#000000", accentColor: "#F3E8FF" },
    ],
    dark: [
        { name: "Negro", value: "#000000", textColor: "#B1B1B1", accentColor: "#374151" },
        { name: "Naranja", value: "#EB8201", textColor: "#FFFFFF", accentColor: "#FB923C" },
        { name: "Azul Marino", value: "#110054", textColor: "#A884F3", accentColor: "#3730A3" },
        {name: 'Verde militar', value: '#373E24', textColor: '#E3DFF3', accentColor: '#6B728049'},
        { name: "Sao Paulo", value: "#1C2928", textColor: "#B0FF2E", accentColor: "#6B728049" },
        { name: "Azul Nocturno", value: "#080221", textColor: "#FFFFFF", accentColor: "rgba(30,27,75,0.51)" },
        { name: "Azul Acero", value: "#4A7BA8", textColor: "#FFFFFF", accentColor: "#60A5FA" },
        { name: "Marrón Canela", value: "#BF6737", textColor: "#FFFFFF", accentColor: "#F59E0B" },
    ]
};

const StylesPage = () => {
    const {
        biosite,
        themeColor,
        setThemeColor,
        fontFamily,
        setFontFamily,
        loading
    } = usePreview();

    const [activeTab, setActiveTab] = useState('light');
    const [showWarning, setShowWarning] = useState(true);

    const handleThemeColorChange = async (color: string, textColor: string, accentColor: string) => {
        try {
            console.log('Changing theme color to:', { color, textColor, accentColor });
            await setThemeColor(color, textColor, accentColor);

            // Opcional: Forzar re-render después de un pequeño delay
            setTimeout(() => {
                console.log('Theme color change completed');
            }, 100);

        } catch (error) {
            console.error("Error updating theme color:", error);
            // Mostrar mensaje de error al usuario
            alert('Error al actualizar el color. Por favor intenta de nuevo.');
        }
    };

    const handleFontFamilyChange = async (font: string) => {
        try {
            console.log('Changing font to:', font);
            await setFontFamily(font);

            // ✅ AGREGAR: Forzar re-render con pequeño delay
            setTimeout(() => {
                console.log('Font change completed, forcing refresh');
                // Opcional: forzar refresh del componente padre si es necesario
            }, 200);

        } catch (error) {
            console.error("Error updating font family:", error);
            alert('Error al actualizar la fuente. Por favor intenta de nuevo.');
        }
    };

    const toggleWarning = () => {
        setShowWarning(!showWarning);
    };

    // Componente para renderizar una grid de colores
    const ColorGrid = ({ colors }) => (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {colors.map((color) => (
                <button
                    key={color.value}
                    onClick={() => handleThemeColorChange(color.value, color.textColor, color.accentColor)}
                    className={`p-4 w-40 h-20 rounded-lg cursor-pointer  transition-all duration-200 hover:shadow-md flex flex-col items-center space-y-2 bg-white ${
                        themeColor === color.value
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{
                        background: color.value.startsWith('linear-gradient') ? color.value : color.value,
                        backgroundColor: color.value.startsWith('linear-gradient') ? undefined : color.value
                    }}
                >
                    <div
                        className="w-8 h-8 rounded-full border border-gray-300"
                        style={{
                            backgroundColor: 'white',
                            color: color.textColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }}
                    >
                        Aa
                    </div>
                    {/* Preview del color de accent para links */}
                    <div
                        className="w-12 h-3 rounded text-xs flex items-center justify-center"
                        style={{
                            backgroundColor: color.accentColor,
                            color: color.textColor,
                            fontSize: '8px'
                        }}
                    >
                        Link
                    </div>
                    <div className="text-xs font-medium text-center"
                         style={{ color: color.textColor }}>
                        {color.name}
                    </div>
                </button>
            ))}
        </div>
    );

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
        <div className="p-6 space-y-8 max-w-150 mx-auto h-full mt-0 lg:mt-20 ">
            {/* Información del biosite */}
            {biosite && (
                <div className=" rounded-lg p-4 mb-0">

                    <h1 className="text-medium font-bold text-gray-800 mb-5 uppercase tracking-wide text-start sr-only sm:not-sr-only"> Estilos</h1>
                    <p className="text-sm text-gray-600">
                        {biosite.title} Personaliza la apariencia de tu vesite con las opciones disponibles.
                    </p>
                </div>
            )}
            {/* Selector de fuente    */}
            <div className=" rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">
                Tipografía
            </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {fontOptions.map((font) => (
                        <button
                            key={font.value}
                            onClick={() => handleFontFamilyChange(font.value)}
                            className={`p-3 rounded-lg cursor-pointer border-2 bg-white transition-all duration-200 hover:shadow-md text-left ${
                                fontFamily === font.value
                                    ? "border-blue-500 bg-blue-50 text-blue-700"
                                    : "border-gray-200 text-gray-700 hover:border-gray-300"
                            }`}
                            style={{ fontFamily: font.value }}
                        >
                            <div className="font-medium text-sm">{font.name}</div>
                            <div className="text-xs opacity-60 mt-1"
                            style={{fontFamily: font.value}}>
                                Ejemplo de texto
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Selector de color de tema */}
            <div className="rounded-lg border border-gray-200 p-3">
                <h3 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wide text-start">
                    Themas
                </h3>


                {/* Pestañas Light/Dark */}
                <div className="flex mb-6">
                    <button
                        onClick={() => setActiveTab('light')}
                        className={`px-6 py-2 rounded-l-lg font-medium cursor-pointer text-sm transition-all duration-200 ${
                            activeTab === 'light'
                                ? 'bg-white text-gray-900 border border-gray-300 shadow-sm'
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Light
                    </button>
                    <button
                        onClick={() => setActiveTab('dark')}
                        className={`px-6 py-2 rounded-r-lg cursor-pointer font-medium text-sm transition-all duration-200 ${
                            activeTab === 'dark'
                                ? 'bg-gray-800 text-white border border-gray-800 shadow-sm'
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        Dark
                    </button>
                </div>

                {/* Grid de colores según la pestaña activa */}
                <ColorGrid colors={colorCategories[activeTab]} />
            </div>

            {/* Información adicional */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200" onClick={toggleWarning}>
                <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 cursor-pointer">
                        <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    {showWarning && (
                    <div>
                        <h3 className="text-sm font-medium text-blue-800">
                            Consejo de personalización
                        </h3>
                        <p className="text-xs text-blue-700 mt-1">
                            Los cambios se aplican automáticamente. Puedes ver el resultado en tiempo real en la vista previa de tu vesite. El color de fondo incluye también el color para los enlaces.
                        </p>
                    </div>
                        )}
                </div>
            </div>
            <div className="h-20"></div>
        </div>
    );
};

export default StylesPage;