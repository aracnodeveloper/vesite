import { useCallback, useEffect, useRef, useState } from "react";
import { CirclePlay } from "lucide-react";
import type { HistoryItem } from "../../interfaces/History";
import { HISTORIES_CHANGED_EVENT, historyService } from "../../service/historyService";
import HistoryViewer from "./HistoryViewer";

interface HistoriesPreviewProps {
  biositeId?: string;
  accentColor?: string;
  textColor?: string;
  display?: "featured" | "avatar-trigger";
}

const isAvailable = (history: HistoryItem) => {
  if (!history.isActive) return false;
  if (!history.expiresAt) return true;
  const expiration = Date.parse(history.expiresAt);
  return Number.isNaN(expiration) || expiration > Date.now();
};

export default function HistoriesPreview({
  biositeId,
  accentColor = "#84cc16",
  textColor = "#111827",
  display = "featured",
}: HistoriesPreviewProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const loadHistories = useCallback(async () => {
    if (!biositeId) {
      setHistories([]);
      return;
    }
    try {
      const items = await historyService.listActiveByBiosite(biositeId);
      setHistories(items.filter(isAvailable));
    } catch {
      setHistories([]);
    }
  }, [biositeId]);

  useEffect(() => {
    void loadHistories();
  }, [loadHistories]);

  useEffect(() => {
    setPortalTarget(
      (anchorRef.current?.closest(".phone-screen") as HTMLElement | null) ??
        document.body,
    );
  }, []);

  useEffect(() => {
    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      if (!detail?.biositeId || detail.biositeId === biositeId) {
        void loadHistories();
      }
    };
    window.addEventListener(HISTORIES_CHANGED_EVENT, handleChange);
    return () => {
      window.removeEventListener(HISTORIES_CHANGED_EVENT, handleChange);
    };
  }, [biositeId, loadHistories]);

  useEffect(() => {
    const openFirstHistory = () => {
      if (histories.length > 0) setActiveIndex(0);
    };
    window.addEventListener("vesite:open-first-history", openFirstHistory);
    return () => window.removeEventListener("vesite:open-first-history", openFirstHistory);
  }, [histories]);

  if (histories.length === 0) return <div ref={anchorRef} />;

  if (display === "avatar-trigger") {
    return (
      <>
        <div ref={anchorRef} className="pointer-events-none absolute -inset-[7px] z-20 rounded-full">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setActiveIndex(0); }}
            className="pointer-events-auto absolute inset-0 rounded-full transition-transform hover:scale-[1.03] active:scale-95"
            aria-label="Ver historias"
          >
            <span
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from 210deg, ${accentColor}, #f97316, #ec4899, ${accentColor})`,
                WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px))",
                boxShadow: `0 0 0 2px rgba(255,255,255,0.95), 0 6px 16px ${accentColor}35`,
              }}
            />
            <span className="absolute inset-[6px] rounded-full border-2 border-white/95" />
            <span className="absolute -right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-[3px] border-white bg-gray-950 text-white shadow-lg">
              <CirclePlay size={12} fill="currentColor" />
            </span>
          </button>
        </div>
        {activeIndex !== null && portalTarget && (
          <HistoryViewer
            histories={histories}
            initialIndex={activeIndex}
            onClose={() => setActiveIndex(null)}
            portalTarget={portalTarget}
            accentColor={accentColor}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div ref={anchorRef} className="w-full px-4 pb-3 pt-1">
        <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
          {histories.map((history, index) => (
            <button
              key={history.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="flex w-[68px] shrink-0 flex-col items-center gap-1.5"
              aria-label={`Ver historia ${history.title}`}
            >
              <span
                className="relative flex h-14 w-14 items-center justify-center rounded-full p-[3px]"
                style={{ background: `linear-gradient(135deg, ${accentColor}, #f97316)` }}
              >
                <span className="relative h-full w-full overflow-hidden rounded-full border-2 border-white bg-gray-900">
                  {history.image && history.mediaType === "image" ? (
                    <img src={history.image} alt="" className="h-full w-full object-cover" />
                  ) : history.image ? (
                    <video src={history.image} className="h-full w-full object-cover" muted preload="metadata" />
                  ) : (
                    <span className="block h-full w-full bg-gradient-to-br from-gray-700 to-gray-950" />
                  )}
                  {history.mediaType === "video" && (
                    <CirclePlay size={20} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
                  )}
                </span>
              </span>
              <span className="w-full truncate text-center text-[11px] font-medium" style={{ color: textColor }}>
                {history.title}
              </span>
            </button>
          ))}
        </div>
      </div>
      {activeIndex !== null && portalTarget && (
        <HistoryViewer
          histories={histories}
          initialIndex={activeIndex}
          onClose={() => setActiveIndex(null)}
          portalTarget={portalTarget}
          accentColor={accentColor}
        />
      )}
    </>
  );
}
