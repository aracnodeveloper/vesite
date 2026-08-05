import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CirclePlay, Heart, MoreHorizontal, X } from "lucide-react";
import type { HistoryItem } from "../../interfaces/History";
import { historyService } from "../../service/historyService";

interface HistoryViewerProps {
  histories: HistoryItem[];
  initialIndex: number;
  onClose: () => void;
  portalTarget: HTMLElement;
  accentColor?: string;
  menuOptions?: {
    label: string;
    icon?: React.ReactNode;
    action: () => void;
    isDestructive?: boolean;
  }[];
}

export default function HistoryViewer({
  histories,
  initialIndex,
  onClose,
  portalTarget,
  accentColor = "#84cc16",
  menuOptions,
}: HistoryViewerProps) {
  const touchStartRef = useRef<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [likedHistoryIds, setLikedHistoryIds] = useState<Set<string>>(() => 
    historyService.getInteractedSet("like")
  );
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const STORY_DURATION = 5000;
  const activeHistory = histories[activeIndex];
  const isPhonePreview = portalTarget.classList.contains("phone-screen");

  useEffect(() => {
    if (!activeHistory) return;
    void historyService.recordView(activeHistory.id).catch(() => undefined);
    setProgress(0);
  }, [activeHistory]);

  const goToPrevious = useCallback(() => {
    if (activeIndex === 0) {
      setProgress(0);
    } else {
      setActiveIndex(activeIndex - 1);
    }
  }, [activeIndex]);

  const goToNext = useCallback(() => {
    if (activeIndex + 1 >= histories.length) {
      onClose();
    } else {
      setActiveIndex(activeIndex + 1);
    }
  }, [activeIndex, histories.length, onClose]);

  useEffect(() => {
    if (!activeHistory || isPaused) return;
    if (activeHistory.mediaType === "video") return;

    const interval = 50;
    const step = (interval / STORY_DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p + step >= 100) {
          clearInterval(timer);
          requestAnimationFrame(() => goToNext());
          return 100;
        }
        return p + step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [activeIndex, activeHistory, isPaused, goToNext]);

  const handlePointerDown = () => {
    if (isMenuOpen) return;
    touchStartRef.current = Date.now();
    setIsPaused(true);
  };

  const handlePointerUp = (action: "prev" | "next") => {
    if (isMenuOpen) return;
    setIsPaused(false);
    const duration = Date.now() - touchStartRef.current;
    if (duration < 200) {
      action === "prev" ? goToPrevious() : goToNext();
    }
  };

  const handleVideoTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    if (isPaused) return;
    const video = e.currentTarget;
    const percent = (video.currentTime / video.duration) * 100;
    setProgress(percent);
  };

  if (!activeHistory) return null;

  const handleLike = async () => {
    if (likedHistoryIds.has(activeHistory.id)) return;
    try {
      await historyService.recordInteraction(activeHistory.id, "like");
      setLikedHistoryIds((current) => new Set(current).add(activeHistory.id));
    } catch {}
  };

  return createPortal(
    <div
      className={`${isPhonePreview ? "absolute" : "fixed"} inset-0 z-[100] flex flex-col overflow-hidden bg-black text-white select-none`}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 z-10 flex">
        <div className="w-[30%] h-full" onPointerDown={handlePointerDown} onPointerUp={(e) => { e.stopPropagation(); handlePointerUp("prev"); }} onPointerLeave={() => setIsPaused(false)} />
        <div className="w-[70%] h-full" onPointerDown={handlePointerDown} onPointerUp={(e) => { e.stopPropagation(); handlePointerUp("next"); }} onPointerLeave={() => setIsPaused(false)} />
      </div>

      <div className="absolute left-3 right-3 top-3 z-20 flex gap-1 pointer-events-none">
        {histories.map((history, index) => {
          const isActive = index === activeIndex;
          const isPast = index < activeIndex;
          const currentProgress = isActive ? progress : isPast ? 100 : 0;
          return (
            <div key={history.id} className="h-1 flex-1 rounded-full bg-white/35 overflow-hidden">
              <div
                className="h-full bg-white ease-linear"
                style={{
                  width: `${currentProgress}%`,
                  transitionDuration: isActive && !isPaused ? "50ms" : "0ms",
                }}
              />
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
        className="absolute right-3 top-7 z-[60] rounded-full bg-black/45 p-2 text-white hover:bg-black/60 active:scale-95 transition-all pointer-events-auto cursor-pointer"
        aria-label="Cerrar"
      >
        <X size={24} />
      </button>

      <div className="absolute inset-0 flex items-center justify-center">
        {activeHistory.image ? (
          activeHistory.mediaType === "video" ? (
            <video
              key={activeHistory.id}
              src={activeHistory.image}
              className="h-full w-full object-contain"
              autoPlay
              playsInline
              onTimeUpdate={handleVideoTimeUpdate}
              onEnded={goToNext}
              ref={(el) => { if (el) isPaused ? el.pause() : el.play().catch(() => {}); }}
            />
          ) : (
            <img src={activeHistory.image} alt={activeHistory.title} className="h-full w-full object-contain" />
          )
        ) : (
          <div className="h-full w-full" style={{ background: `linear-gradient(145deg, ${accentColor}, #111827)` }} />
        )}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 to-transparent px-5 pb-7 pt-16 pointer-events-none">
        <h2 className="text-lg font-semibold pointer-events-auto">{activeHistory.title}</h2>
        {activeHistory.description && (
          <p className="mt-1 text-sm text-white/85 pointer-events-auto">{activeHistory.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between pointer-events-auto">
          <button
            type="button"
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void handleLike(); }}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${likedHistoryIds.has(activeHistory.id) ? "bg-red-500 text-white" : "bg-white/20 text-white hover:bg-white/30"}`}
          >
            <Heart size={16} fill={likedHistoryIds.has(activeHistory.id) ? "currentColor" : "none"} />
            Me gusta
          </button>
          
          {menuOptions && menuOptions.length > 0 && (
            <button
              type="button"
              onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onPointerUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsMenuOpen(true); setIsPaused(true); }}
              className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30"
              aria-label="Más opciones"
            >
              <MoreHorizontal size={20} />
            </button>
          )}
        </div>
      </div>

      {isMenuOpen && menuOptions && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/60 pointer-events-auto transition-opacity duration-200">
          <div className="bg-gray-900 rounded-t-2xl p-4 pb-8 space-y-2 translate-y-0 animate-in slide-in-from-bottom-full duration-300">
            <h3 className="text-center text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Opciones</h3>
            {menuOptions.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  setIsPaused(false);
                  opt.action();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium ${opt.isDestructive ? "text-red-500 bg-red-500/10 hover:bg-red-500/20" : "text-white bg-white/10 hover:bg-white/20"}`}
              >
                <span className="flex items-center gap-3">
                  {opt.icon}
                  {opt.label}
                </span>
              </button>
            ))}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                setIsPaused(false);
              }}
              className="w-full flex items-center justify-center px-4 py-3 mt-2 rounded-xl text-white font-medium bg-white/5 hover:bg-white/10"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>,
    portalTarget,
  );
}
