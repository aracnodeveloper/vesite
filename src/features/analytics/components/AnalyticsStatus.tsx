import type { ReactNode } from "react";
import { useOptionalAnalytics } from "./AnalyticsWrapper";

interface DebugInfoProps {
  borderClass: string;
  biositeId: string | null;
  timeRange: string;
  refreshTrigger: number;
  lastRefresh: Date;
  onReset?: () => void;
}

/** Datos de depuración, visibles solo dentro de un AnalyticsWrapper. */
const DebugInfo = ({ borderClass, biositeId, timeRange, refreshTrigger, lastRefresh, onReset }: DebugInfoProps) => {
  const analyticsContext = useOptionalAnalytics();
  if (!analyticsContext) return null;

  return (
    <div className={`mt-4 text-sm border-t ${borderClass} pt-4`}>
      <p className="text-gray-400">Debug Info:</p>
      <p className="text-gray-300">BiositeId: {biositeId || "Not set"}</p>
      <p className="text-gray-300">Time Range: {timeRange}</p>
      <p className="text-gray-300">Has tracked visit: {analyticsContext.hasTrackedVisit ? "Yes" : "No"}</p>
      <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
      <p className="text-gray-300">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
      {onReset && (
        <button
          onClick={() => {
            analyticsContext.resetTracking();
            onReset();
          }}
          className="mt-2 px-3 py-1 bg-yellow-600 rounded text-white text-xs"
        >
          Reset & Refresh
        </button>
      )}
    </div>
  );
};

type StatusInfo = Omit<DebugInfoProps, "borderClass" | "onReset"> & { onRefresh: () => void };

export const AnalyticsLoading = () => (
  <div className="text-white p-6">
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
      <span>Loading analytics...</span>
    </div>
  </div>
);

const StatusBox = ({ tone, title, children }: { tone: "red" | "yellow"; title: string; children: ReactNode }) => (
  <div className="text-white p-6">
    <div
      className={
        tone === "red"
          ? "bg-red-900/20 border border-red-500 rounded-lg p-4"
          : "bg-yellow-900/20 border border-yellow-500 rounded-lg p-4"
      }
    >
      <h3 className={tone === "red" ? "text-red-400 font-semibold mb-2" : "text-yellow-400 font-semibold mb-2"}>
        {title}
      </h3>
      {children}
    </div>
  </div>
);

export const AnalyticsError = ({ error, onRefresh, ...info }: StatusInfo & { error: string }) => (
  <StatusBox tone="red" title="Error Loading Analytics">
    <p className="text-red-300 mb-4">{error}</p>
    <button
      onClick={onRefresh}
      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
    >
      Retry
    </button>
    <DebugInfo borderClass="border-red-500" onReset={onRefresh} {...info} />
  </StatusBox>
);

export const AnalyticsEmpty = ({ onRefresh, ...info }: StatusInfo) => (
  <StatusBox tone="yellow" title="No Analytics Data">
    <p className="text-yellow-300 mb-4">Unable to load analytics data.</p>
    <button
      onClick={onRefresh}
      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm transition-colors"
    >
      Refresh Data
    </button>
    <DebugInfo borderClass="border-yellow-500" {...info} />
  </StatusBox>
);
