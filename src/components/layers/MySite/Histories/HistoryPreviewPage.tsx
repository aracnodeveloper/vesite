import { useEffect, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../../../shared/BackButton";
import Loading from "../../../shared/Loading";
import { useHistory } from "../../../../hooks/useHistory";
import type { HistoryItem } from "../../../../interfaces/History";

const HistoryPreviewPage = () => {
  const navigate = useNavigate();
  const { historyId } = useParams();
  const { getHistoryById, loading, error } = useHistory();
  const [history, setHistory] = useState<HistoryItem | null>(null);

  useEffect(() => {
    if (historyId) void getHistoryById(historyId).then(setHistory);
  }, [historyId, getHistoryById]);

  return (
    <div className="mx-auto h-full w-full max-w-xl p-2 pb-10 lg:mt-20">
      <div className="flex items-center justify-between border-b border-gray-700 px-4 py-4">
        <BackButton text="Vista previa" to="/histories" />
        {history && (
          <button type="button" onClick={() => navigate(`/histories/${history.id}/edit`)} className="flex items-center gap-2 rounded-full bg-black px-4 py-2 text-sm text-white">
            <Pencil size={14} /> Editar
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loading /></div>
      ) : !history ? (
        <div className="m-4 rounded-2xl bg-white/60 p-8 text-center">
          <h2 className="font-semibold text-gray-900">Historia no encontrada</h2>
          <p className="mt-2 text-sm text-gray-500">{error ?? "Puede que haya sido eliminada."}</p>
          <button type="button" onClick={() => navigate("/histories")} className="mt-4 rounded-full bg-black px-5 py-2 text-white">Volver a historias</button>
        </div>
      ) : (
        <div className="px-4 pt-6">
          <div className="relative mx-auto aspect-[9/16] max-h-[560px] overflow-hidden rounded-[28px] bg-gradient-to-br from-[#F9B4C0] to-[#F2647C] shadow-xl">
            {history.image && (history.mediaType === "video" ? <video src={history.image} controls autoPlay muted className="h-full w-full object-cover" /> : <img src={history.image} alt={history.title} className="h-full w-full object-cover" />)}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 pt-20 text-white">
              <h1 className="text-2xl font-bold">{history.title}</h1>
              {history.description && <p className="mt-2 text-sm text-white/90">{history.description}</p>}
              <p className="mt-4 flex items-center gap-1 text-xs text-white/75"><Eye size={13} /> {history.visuals ?? 0} visualizaciones</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryPreviewPage;
