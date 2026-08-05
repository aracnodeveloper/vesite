import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import BackButton from "../../../shared/BackButton";
import Loading from "../../../shared/Loading";
import { useHistory } from "../../../../hooks/useHistory";
import HistoryCard from "./HistoryCard";
import HistoriesPreview from "../../../Preview/HistoriesPreview";
import HighlightsPreview from "../../../Preview/HighlightsPreview";

const HistoriesListPage = () => {
  const navigate = useNavigate();
  const biositeId = Cookies.get("biositeId");
  const { historyItems, loading, error, fetchHistoryByBiosite, deleteHistory, updateHistory } =
    useHistory();
  const [filter, setFilter] = useState<"all" | "active" | "archived">(
    "all",
  );

  useEffect(() => {
    if (biositeId) void fetchHistoryByBiosite(biositeId);
  }, [biositeId, fetchHistoryByBiosite]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Quieres eliminar esta historia?")) return;
    await deleteHistory(id);
  };

  const handleDeleteHighlight = async (id: string) => {
    if (!biositeId) return;
    if (!window.confirm("¿Quieres eliminar este destacado?")) return;
    try {
      await updateHistory(id, { isHighlight: false });
    } catch (error) {
      console.error(error);
      alert("Error al eliminar el destacado");
    }
  };

  const handleToggleHighlight = async (id: string, currentStatus: boolean) => {
    try {
      await updateHistory(id, { isHighlight: !currentStatus });
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el destacado");
    }
  };

  const activeCount = historyItems.filter(
    (item) =>
      item.isActive && (!item.expiresAt || new Date(item.expiresAt) >= new Date()),
  ).length;

  const archivedCount = historyItems.filter(
    (item) =>
      item.expiresAt && new Date(item.expiresAt) < new Date(),
  ).length;

  const filteredHistoryItems = useMemo(() => {
    if (filter === "active")
      return historyItems.filter(
        (item) =>
          item.isActive && (!item.expiresAt || new Date(item.expiresAt) >= new Date()),
      );
    if (filter === "archived")
      return historyItems.filter(
        (item) =>
          item.expiresAt &&
          new Date(item.expiresAt) < new Date(),
      );
    return historyItems;
  }, [filter, historyItems]);

  return (
    <div className="mx-auto h-full w-full max-w-2xl p-2 pb-10 lg:mt-20">
      <div className="flex items-center justify-between border-b border-gray-700/60 px-4 py-4">
        <BackButton text="Historias" to="/sections" />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigate("/histories/new")}
            className="flex items-center gap-2 rounded-full bg-[#98C022] px-4 py-2 text-sm font-semibold text-white hover:bg-[#86A81E]"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {historyItems.length > 0 && (
        <div className="grid grid-cols-2 gap-2 px-4 pt-4">
          <div className="rounded-2xl bg-emerald-50 p-3">
            <CheckCircle2 size={17} className="mb-2 text-emerald-600" />
            <p className="text-xl font-semibold text-gray-900">{activeCount}</p>
            <p className="text-[11px] text-gray-500">Activas</p>
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <Archive size={17} className="mb-2 text-amber-600" />
            <p className="text-xl font-semibold text-gray-900">
              {archivedCount}
            </p>
            <p className="text-[11px] text-gray-500">Archivadas</p>
          </div>
        </div>
      )}

      <div className="mt-4 rounded-3xl bg-white/45 px-3 py-2 ring-1 ring-black/5">
        <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
          Historias
        </p>
        <HistoriesPreview biositeId={biositeId} display="featured" />
      </div>

      <div className="mt-4 rounded-3xl bg-white/45 px-3 py-2 ring-1 ring-black/5">
        <p className="px-2 pt-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
          Destacados
        </p>
        <HighlightsPreview biositeId={biositeId} onDelete={handleDeleteHighlight} />
      </div>

      <div className="px-4 pt-6">
        {loading && historyItems.length === 0 ? (
          <div className="flex justify-center py-16">
            <Loading />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto mb-3 text-red-500" />
            <p className="font-medium text-red-700">
              No pudimos cargar tus historias
            </p>
            <p className="mt-1 text-sm text-red-600">{error}</p>
            {biositeId && (
              <button
                type="button"
                onClick={() => void fetchHistoryByBiosite(biositeId)}
                className="mx-auto mt-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-red-700"
              >
                <RefreshCw size={14} /> Reintentar
              </button>
            )}
          </div>
        ) : historyItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 px-6 py-14 text-center backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100 text-2xl">
              ✨
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Comparte tu primera historia
            </h2>
            <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
              Publica una imagen, un video o un mensaje breve para tu audiencia.
            </p>
            <button
              type="button"
              onClick={() => navigate("/histories/new")}
              className="mt-6 rounded-full bg-black px-6 py-2.5 font-medium text-white hover:bg-gray-800"
            >
              Crear historia
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 space-y-3 px-1 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-gray-800">
                    Todas tus historias
                  </h2>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Organiza y administra tus publicaciones
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <Filter size={13} /> {filteredHistoryItems.length}
                </span>
              </div>
              <div className="flex gap-1 overflow-x-auto rounded-xl bg-black/[0.04] p-1">
                {(
                  [
                    ["all", "Todas"],
                    ["active", "Activas"],
                    ["archived", "Archivadas"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value as "all" | "active" | "archived")}
                    className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              {filteredHistoryItems.length === 0 ? (
                <div className="rounded-2xl bg-white/50 px-5 py-10 text-center text-sm text-gray-500">
                  No hay historias en este filtro.
                </div>
              ) : (
                filteredHistoryItems.map((history) => (
                  <HistoryCard
                    key={history.id}
                    history={history}
                    onDelete={handleDelete}
                    onToggleHighlight={handleToggleHighlight}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoriesListPage;
