import { useState, type ReactNode } from "react";
import { message } from "antd";
import { Check } from "lucide-react";
import type { Platilla } from "../types/Templates";

interface DesignPickerProps<C extends string> {
  /** Plantillas que se pueden elegir, ya filtradas y ordenadas. */
  templates: Platilla[];
  loading: boolean;
  categories: { id: C; label: string }[];
  categoryOf: (template: Platilla) => C;
  /** La plantilla que se ve ahora (la elegida o la de por defecto). */
  currentId?: string;
  /** Clase de proporción de las miniaturas, para los marcadores de carga. */
  thumbnailAspect: string;
  renderThumbnail: (template: Platilla) => ReactNode;
  /** Líneas extra bajo el nombre de cada tarjeta. */
  renderCaption?: (template: Platilla) => ReactNode;
  onSelect: (plantillaId: string) => Promise<void>;
}

/**
 * Selector de plantillas en pestañas con tarjetas de 4 en fila. Guarda al tocar
 * una tarjeta y avisa si falla. Lo usan el diseño del perfil y el de los links.
 */
const DesignPicker = <C extends string>({
  templates,
  loading,
  categories,
  categoryOf,
  currentId,
  thumbnailAspect,
  renderThumbnail,
  renderCaption,
  onSelect,
}: DesignPickerProps<C>) => {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [tab, setTab] = useState<C | null>(null);

  const current = templates.find((template) => template.id === currentId);
  const tabs = categories.filter((category) => templates.some((template) => categoryOf(template) === category.id));
  const activeTab = tab ?? (current ? categoryOf(current) : tabs[0]?.id);
  const visible = templates.filter((template) => categoryOf(template) === activeTab);

  const select = async (plantillaId: string) => {
    if (plantillaId === currentId || savingId) return;
    setSavingId(plantillaId);
    try {
      await onSelect(plantillaId);
    } catch (error) {
      console.error("Error updating template:", error);
      message.error("No se pudo cambiar el diseño. Inténtalo de nuevo.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <>
      {tabs.length > 1 && (
        <div className="mb-3 grid gap-2" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setTab(category.id)}
              aria-pressed={category.id === activeTab}
              className={`h-10 rounded-lg border text-sm font-medium cursor-pointer transition-colors ${
                category.id === activeTab
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {loading
          ? [0, 1, 2, 3].map((placeholder) => (
              <div key={placeholder} className={`${thumbnailAspect} animate-pulse rounded-xl bg-gray-100`} />
            ))
          : visible.map((template) => {
              const isSelected = template.id === currentId;

              return (
                <button
                  key={template.id}
                  type="button"
                  title={template.description}
                  onClick={() => select(template.id)}
                  disabled={!!savingId}
                  aria-pressed={isSelected}
                  className="group flex min-w-0 flex-col gap-1 text-left cursor-pointer disabled:cursor-wait"
                >
                  <div
                    className={`relative w-full overflow-hidden rounded-xl transition-all ${
                      isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "ring-1 ring-gray-200 group-hover:ring-gray-400"
                    }`}
                  >
                    {renderThumbnail(template)}
                    {isSelected && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white shadow">
                        <Check size={10} strokeWidth={3} />
                      </span>
                    )}
                    {savingId === template.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-500" />
                      </div>
                    )}
                  </div>
                  <span className={`truncate text-[10px] font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                    {template.name}
                  </span>
                  {renderCaption?.(template)}
                </button>
              );
            })}
      </div>
    </>
  );
};

export default DesignPicker;
