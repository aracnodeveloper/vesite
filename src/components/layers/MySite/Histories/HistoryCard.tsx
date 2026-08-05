import { Eye, Heart, Pencil, Play, Trash2, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { HistoryItem } from "../../../../interfaces/History";

interface HistoryCardProps {
  history: HistoryItem;
  onDelete: (id: string) => void;
  onToggleHighlight: (id: string, isHighlight: boolean) => void;
}

const HistoryCard = ({ history, onDelete, onToggleHighlight }: HistoryCardProps) => {
  const navigate = useNavigate();
  const expired = Boolean(
    history.expiresAt && new Date(history.expiresAt) < new Date(),
  );
  const status = !history.isActive
    ? "Borrador"
    : expired
      ? "Expirada"
      : "Activa";
  const statusClass =
    status === "Activa"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Expirada"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-600";

  return (
    <article className="group flex gap-4 rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-black/5 transition hover:shadow-md sm:p-4">
      <div className="relative h-28 w-22 shrink-0 overflow-hidden rounded-xl bg-slate-900 sm:h-32 sm:w-24">
        {history.image ? (
          <img
            src={history.image}
            alt={history.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-white/70">
            <Play size={24} />
          </div>
        )}
        <span className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          {history.mediaType === "video" ? "Video" : "Imagen"}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 py-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-semibold text-gray-900">
            {history.title || "Sin título"}
          </h3>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass}`}
          >
            {status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1">
            <Eye size={14} /> {history.visuals ?? 0} vistas
          </span>
          <span className="inline-flex items-center gap-1">
            <Heart size={14} /> {history.interactions ?? 0}
          </span>
        </div>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => navigate(`/histories/${history.id}/edit`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Pencil size={14} /> Editar
          </button>
          <button
            type="button"
            onClick={() => onToggleHighlight(history.id, !!history.isHighlight)}
            aria-label={history.isHighlight ? "Quitar destacado" : "Destacar"}
            className={`rounded-xl border px-3 transition ${history.isHighlight ? "border-yellow-200 text-yellow-500 hover:bg-yellow-50 bg-yellow-50/50" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
          >
            <Star size={16} fill={history.isHighlight ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(history.id)}
            aria-label="Eliminar historia"
            className="rounded-xl border border-red-200 px-3 text-red-500 transition hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default HistoryCard;
