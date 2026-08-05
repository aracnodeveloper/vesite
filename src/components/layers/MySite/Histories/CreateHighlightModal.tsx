import { useState } from "react";
import { X, Image, Check } from "lucide-react";
import type { HistoryItem } from "../../../../interfaces/History";
import { useHighlight } from "../../../../hooks/useHighlight";

interface Props {
  biositeId: string;
  historyItems: HistoryItem[];
  onClose: () => void;
}

export default function CreateHighlightModal({ biositeId, historyItems, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { createHighlight, loading } = useHighlight();

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSave = async () => {
    if (!title.trim() || selectedIds.size === 0) return;
    await createHighlight({
      biositeId,
      title,
      coverImage: coverImage.trim() || undefined,
      historyIds: Array.from(selectedIds),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Nuevo Destacado</h2>
          <button onClick={onClose} className="rounded-full p-1.5 hover:bg-gray-100">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="mb-5 space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Mis Viajes"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">URL Portada (opcional)</label>
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Selecciona historias ({selectedIds.size})</label>
            {historyItems.length === 0 ? (
              <p className="text-sm text-gray-500">No hay historias disponibles.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {historyItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleSelection(item.id)}
                    className={`relative aspect-[9/16] cursor-pointer overflow-hidden rounded-lg border-2 ${selectedIds.has(item.id) ? "border-blue-500" : "border-transparent"}`}
                  >
                    {item.image && item.mediaType === "image" ? (
                      <img src={item.image} className="h-full w-full object-cover" />
                    ) : item.image && item.mediaType === "video" ? (
                      <video src={item.image} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <Image className="text-gray-400" />
                      </div>
                    )}
                    {selectedIds.has(item.id) && (
                      <div className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t bg-gray-50 px-5 py-4">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || selectedIds.size === 0 || loading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}
