import type { TimeRange } from "../types/Analytics";
import { TIME_RANGE_OPTIONS } from "../utils/timeRange";

interface AnalyticsToolbarProps {
  timeRange: TimeRange;
  onTimeRangeChange: (timeRange: TimeRange) => void;
  onShare: () => void;
  onDownload: () => void;
  onRefresh: () => void;
  isDownloading: boolean;
  loading: boolean;
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
);

const ButtonIcon = ({ d }: { d: string }) => (
  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={d} />
  </svg>
);

const SHARE_ICON =
  "M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z";
const PDF_ICON =
  "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z";
const REFRESH_ICON =
  "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15";

/** Título, selector de rango y acciones (compartir, PDF, actualizar). */
const AnalyticsToolbar = ({
  timeRange,
  onTimeRangeChange,
  onShare,
  onDownload,
  onRefresh,
  isDownloading,
  loading,
}: AnalyticsToolbarProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <div className="flex items-center gap-4">
      <h1 className="text-medium font-bold text-gray-800 mb-5 uppercase tracking-wide text-start sr-only sm:not-sr-only">
        Estadísticas
      </h1>

      <select
        value={timeRange}
        onChange={(e) => onTimeRangeChange(e.target.value as TimeRange)}
        className="px-3 py-2 bg-white border border-gray-600 rounded text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#98C022] transition-colors"
      >
        {TIME_RANGE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>

    <div className="flex gap-2">
      <button
        onClick={onShare}
        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer"
        title="Compartir métricas"
      >
        <ButtonIcon d={SHARE_ICON} />
        Compartir
      </button>

      <button
        onClick={onDownload}
        disabled={isDownloading}
        className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        title="Descargar reporte PDF"
      >
        {isDownloading ? <Spinner /> : <ButtonIcon d={PDF_ICON} />}
        {isDownloading ? "Generando..." : "PDF"}
      </button>

      <button
        onClick={onRefresh}
        className="px-3 py-1 bg-[#98C022] hover:bg-[#86A81E] rounded text-white text-sm transition-colors flex items-center cursor-pointer"
        disabled={loading}
        title="Actualizar datos"
      >
        {loading ? <Spinner /> : <ButtonIcon d={REFRESH_ICON} />}
        Actualizar
      </button>
    </div>
  </div>
);

export default AnalyticsToolbar;
