import type { HistoryItem } from "../../history/types/History";

interface HistoryStatsProps {
  historyItems: HistoryItem[];
  loading: boolean;
}

const comingSoon = (feature: string) => () => alert(`Próximamente: ${feature}`);

/** Historias activas con sus vistas e interacciones (vista móvil). */
export const HistoryStatsList = ({ historyItems, loading }: HistoryStatsProps) => (
  <div className="bg-white rounded-2xl p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-medium text-black">Mis Historias (24h)</h2>
      <button
        onClick={comingSoon("Formulario para subir historia")}
        className="bg-[#E8FAD5] text-black text-sm font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-[#d4f5b5] transition-colors"
      >
        <span className="text-lg leading-none">+</span> Subir
      </button>
    </div>
    {loading ? (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
      </div>
    ) : historyItems && historyItems.length > 0 ? (
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
        {historyItems.map((item, index) => (
          <div key={item.id || index} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-black font-medium text-sm">
                {new Date(item.createdAt).toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}
              </span>
              {item.image && (
                <span className="text-xs text-blue-500 truncate max-w-[120px] mt-1">📸 Con imagen</span>
              )}
            </div>
            <div className="flex gap-3 text-sm">
              <span className="text-gray-600 font-semibold">👁️ {item.visuals || 0}</span>
              <span className="text-gray-600 font-semibold">👆 {item.interactions || 0}</span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500 text-sm">No hay historial reciente disponible.</p>
      </div>
    )}
  </div>
);

/** Historias activas con sus vistas e interacciones (vista de escritorio). */
export const HistoryStatsTable = ({ historyItems, loading }: HistoryStatsProps) => (
  <div className="bg-white rounded-3xl p-10 w-full mt-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl text-gray-600 font-semibold">Mis Historias Activas (Últimas 24h)</h2>
      <button
        onClick={comingSoon("Formulario para subir historia")}
        className="bg-[#E8FAD5] text-black font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-[#d4f5b5] transition-colors border border-gray-200"
      >
        <span className="text-xl leading-none">+</span> Subir nueva historia
      </button>
    </div>
    {loading ? (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
      </div>
    ) : historyItems && historyItems.length > 0 ? (
      <div className="bg-[#E8FAD5] rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100/50 border-b border-gray-300">
            <tr>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Fecha de subida</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Vistas</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Interacciones</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Contenido</th>
              <th className="px-6 py-4 text-sm font-semibold text-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200/50">
            {historyItems.map((item, index) => (
              <tr key={item.id || index} className="hover:bg-white/40 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-700 font-medium">
                  {new Date(item.createdAt).toLocaleString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 font-semibold">👁️ {item.visuals || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-700 font-semibold">👆 {item.interactions || 0}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {item.image ? (
                    <span className="inline-flex items-center gap-1 text-blue-600">📸 Con imagen</span>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right">
                  <button
                    className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1"
                    onClick={comingSoon("Eliminar historia")}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="bg-gray-50 border border-gray-200 p-8 rounded-xl text-center">
        <p className="text-gray-500 font-medium">No tienes historias activas.</p>
        <p className="text-gray-400 text-sm mt-1">Sube una historia para conectarte con tu audiencia.</p>
      </div>
    )}
  </div>
);
