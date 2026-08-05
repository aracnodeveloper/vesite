import { useCallback, useEffect, useRef, useState } from "react";
import type { HistoryItem } from "../../interfaces/History";
import { historyService, HISTORIES_CHANGED_EVENT } from "../../service/historyService";
import HistoryViewer from "./HistoryViewer";
import { Trash2 } from "lucide-react";

interface HighlightsPreviewProps {
  biositeId?: string;
  accentColor?: string;
  textColor?: string;
  onDelete?: (id: string) => void;
}

export default function HighlightsPreview({
  biositeId,
  accentColor = "#84cc16",
  textColor = "#111827",
  onDelete,
}: HighlightsPreviewProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [highlights, setHighlights] = useState<HistoryItem[]>([]);
  const [viewerHistories, setViewerHistories] = useState<HistoryItem[] | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const loadHighlights = useCallback(async () => {
    if (!biositeId) {
      setHighlights([]);
      return;
    }
    try {
      const items = await historyService.listActiveByBiosite(biositeId);
      setHighlights(items.filter((item) => item.isHighlight));
    } catch {
      setHighlights([]);
    }
  }, [biositeId]);

  useEffect(() => {
    void loadHighlights();
  }, [loadHighlights]);

  useEffect(() => {
    setPortalTarget(
      (anchorRef.current?.closest(".phone-screen") as HTMLElement | null) ?? document.body
    );
  }, []);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail?.biositeId || detail.biositeId === biositeId) {
        void loadHighlights();
      }
    };
    window.addEventListener(HISTORIES_CHANGED_EVENT, handleChange);
    return () => {
      window.removeEventListener(HISTORIES_CHANGED_EVENT, handleChange);
    };
  }, [biositeId, loadHighlights]);

  const openHighlight = (highlight: HistoryItem) => {
    setViewerHistories([highlight]);
    setActiveHighlightId(highlight.id);
  };

  const visibleHighlights = highlights;

  if (visibleHighlights.length === 0) return <div ref={anchorRef} />;

  return (
    <>
      <div ref={anchorRef} className="w-full px-4 pb-3 pt-1">
        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
          {visibleHighlights.map((highlight) => (
            <button
              key={highlight.id}
              type="button"
              onClick={() => openHighlight(highlight)}
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
            >
              <span className="relative flex h-14 w-14 items-center justify-center rounded-full p-[2px] border border-gray-300">
                <span className="relative h-full w-full overflow-hidden rounded-full bg-gray-100">
                  {highlight.image ? (
                    highlight.mediaType === "video" ? (
                      <video src={highlight.image} className="h-full w-full object-cover" muted preload="metadata" />
                    ) : (
                      <img src={highlight.image} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <span className="block h-full w-full bg-gradient-to-br from-gray-200 to-gray-300" />
                  )}
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium" style={{ color: textColor }}>
                {highlight.title}
              </span>
            </button>
          ))}
        </div>
      </div>
      {viewerHistories !== null && portalTarget && (
        <HistoryViewer
          histories={viewerHistories}
          initialIndex={0}
          onClose={() => {
            setViewerHistories(null);
            setActiveHighlightId(null);
          }}
          portalTarget={portalTarget}
          accentColor={accentColor}
          menuOptions={
            onDelete && activeHighlightId
              ? [
                  {
                    label: "Eliminar destacado",
                    icon: <Trash2 size={18} />,
                    action: () => {
                      onDelete(activeHighlightId);
                      setViewerHistories(null);
                      setActiveHighlightId(null);
                    },
                    isDestructive: true,
                  },
                ]
              : undefined
          }
        />
      )}
    </>
  );
}
