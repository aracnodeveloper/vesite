import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { useTemplates } from '../../../../hooks/useTemplates'; // Ajusta la ruta según tu estructura

// Interfaces para las plantillas
export interface Platilla {
    id: string;
    name?: string;
    description?: string;
    previewUrl?: string;
    index?: number;
    config: any; // JSON configuration
    isActive?: boolean;
}

interface TemplateSelectorProps {
    currentThemeId: string;
    onTemplateChange: (templateId: string) => void;
    loading?: boolean;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
                                                               currentThemeId,
                                                               onTemplateChange,
                                                               loading = false
                                                           }) => {
    const { templates, loading: loadingTemplates, error, refetch } = useTemplates();
    const [selectedTemplate, setSelectedTemplate] = useState<string>(currentThemeId);

    // Update selected template when currentThemeId changes
    useEffect(() => {
        setSelectedTemplate(currentThemeId);
    }, [currentThemeId]);

    // Retry loading templates if there's an error
    const handleRetry = () => {
        refetch();
    };

    const handleTemplateSelect = (templateId: string) => {
        if (loading || templateId === selectedTemplate) return;

        console.log('Template selected:', templateId);
        setSelectedTemplate(templateId);
        onTemplateChange(templateId);
    };

    // Error state
    if (error && !loadingTemplates) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">
                    <p className="text-sm">Error al cargar las plantillas</p>
                    <p className="text-xs text-gray-500 mt-1">{error}</p>
                </div>
                <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Intentar de nuevo
                </button>
            </div>
        );
    }

    // Loading state
    if (loadingTemplates) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500 mr-2" />
                    <span className="text-sm text-gray-500">Cargando plantillas...</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[9/16] bg-gray-200 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // Empty state
    if (templates.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No hay plantillas disponibles</p>
                <button
                    onClick={handleRetry}
                    className="mt-2 px-4 py-2 bg-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                >
                    Recargar
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Current selected template info */}
            {selectedTemplate && (
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-600 font-medium">
                        {templates.find(t => t.id === selectedTemplate)?.name || 'Plantilla Seleccionada'}
                    </p>
                    {templates.find(t => t.id === selectedTemplate)?.description && (
                        <p className="text-xs text-blue-500 mt-1">
                            {templates.find(t => t.id === selectedTemplate)?.description}
                        </p>
                    )}
                </div>
            )}

            {/* Templates grid */}
            <div className="grid grid-cols-2 gap-3">
                {templates.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    const isLoading = loading && isSelected;

                    return (
                        <div
                            key={template.id}
                            className={`
                                relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer
                                transition-all duration-200 transform border-2
                                ${isSelected
                                ? 'border-blue-500 shadow-lg scale-105 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:scale-102 hover:shadow-md bg-white'
                            }
                                ${loading ? 'opacity-75' : ''}
                                ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
                            `}
                            onClick={() => !isLoading && handleTemplateSelect(template.id)}
                        >
                            {/* Template preview */}
                            <div className="w-full h-full flex flex-col">
                                {template.previewUrl ? (
                                    <div className="flex-1 relative">
                                        <img
                                            src={template.previewUrl}
                                            alt={template.name || 'Template preview'}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.style.display = 'none';
                                                const fallback = target.nextElementSibling as HTMLElement;
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        {/* Fallback placeholder (hidden by default) */}
                                        <div
                                            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center"
                                            style={{ display: 'none' }}
                                        >
                                            <div className="text-center p-4">
                                                <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
                                                <div className="w-16 h-2 bg-gray-400 rounded mx-auto mb-1"></div>
                                                <div className="w-12 h-2 bg-gray-400 rounded mx-auto"></div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Default placeholder when no preview URL
                                    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
                                        <div className="text-center p-4">
                                            <div className="w-8 h-8 bg-gray-400 rounded-full mx-auto mb-2"></div>
                                            <div className="w-16 h-2 bg-gray-400 rounded mx-auto mb-1"></div>
                                            <div className="w-12 h-2 bg-gray-400 rounded mx-auto"></div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                    <Check className="w-4 h-4 text-white" />
                                </div>
                            )}

                            {/* Template name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
                                <p className="text-xs font-medium truncate">
                                    {template.name || `Plantilla ${template.index || 1}`}
                                </p>
                                {template.description && (
                                    <p className="text-xs opacity-75 truncate mt-1">
                                        {template.description}
                                    </p>
                                )}
                            </div>

                            {/* Loading overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-sm">
                                    <div className="bg-white/90 rounded-full p-2">
                                        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                    </div>
                                </div>
                            )}

                            {/* Hover effect indicator */}
                            {!isSelected && !loading && (
                                <div className="absolute inset-0 bg-blue-500/0 hover:bg-blue-500/10 transition-colors duration-200" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Debug info (only in development) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
                    <p><strong>Debug:</strong></p>
                    <p>Templates count: {templates.length}</p>
                    <p>Current theme: {currentThemeId}</p>
                    <p>Selected: {selectedTemplate}</p>
                    <p>Loading: {loading ? 'Yes' : 'No'}</p>
                </div>
            )}
        </div>
    );
};

export default TemplateSelector;
