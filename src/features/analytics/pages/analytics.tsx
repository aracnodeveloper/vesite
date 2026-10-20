import { useEffect } from "react";
import Cookies from "js-cookie";
import { AnalyticsWrapper } from "../components/AnalyticsWrapper";
import { usePreview } from "../../biosite/context/PreviewContext.tsx";
import { useHistory } from "../../history/hooks/useHistory.ts";
import { useAnalyticsData } from "../hooks/useAnalyticsData";
import { useAnalyticsReport } from "../hooks/useAnalyticsReport";
import { getCtr } from "../utils/timeRange";
import AnalyticsToolbar from "../components/AnalyticsToolbar";
import AnalyticsHero from "../components/AnalyticsHero";
import ClickDetailsCard from "../components/ClickDetailsCard";
import { DailyActivityGrid, DailyActivityList } from "../components/DailyActivity";
import { HistoryStatsList, HistoryStatsTable } from "../components/HistoryStats";
import { AnalyticsEmpty, AnalyticsError, AnalyticsLoading } from "../components/AnalyticsStatus";

const AnalyticsContent = () => {
  const { biosite } = usePreview();
  const {
    analyticsData,
    loading,
    error,
    biositeId,
    timeRange,
    changeTimeRange,
    refresh,
    refreshTrigger,
    lastRefresh,
  } = useAnalyticsData();
  const { handleShare, handleDownloadPDF, isDownloading } = useAnalyticsReport(analyticsData, timeRange);
  const { historyItems, fetchHistoryByBiosite, loading: historyLoading } = useHistory();

  useEffect(() => {
    if (biosite?.id) {
      fetchHistoryByBiosite(biosite.id);
    }
  }, [biosite?.id, fetchHistoryByBiosite]);

  const statusInfo = { biositeId, timeRange, refreshTrigger, lastRefresh, onRefresh: refresh };

  if (loading) return <AnalyticsLoading />;
  if (error) return <AnalyticsError error={error} {...statusInfo} />;
  if (!analyticsData) return <AnalyticsEmpty {...statusInfo} />;

  const totalViews = analyticsData.views || 0;
  const totalClicks = analyticsData.clicks || 0;
  const ctr = getCtr(totalViews, totalClicks);
  const totalHistoryViews = historyItems.reduce((total, item) => total + (item.visuals ?? 0), 0);

  return (
    <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
      <div className="max-w-7xl mx-auto">
        <AnalyticsToolbar
          timeRange={timeRange}
          onTimeRangeChange={changeTimeRange}
          onShare={handleShare}
          onDownload={handleDownloadPDF}
          onRefresh={refresh}
          isDownloading={isDownloading}
          loading={loading}
        />

        {/* VISTA MÓVIL */}
        <div className="lg:hidden">
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-medium text-black mb-4">Actividad Total</h2>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex justify-around items-center text-center">
                  {[
                    { value: totalViews, label: "Vistas" },
                    { value: totalClicks, label: "Clicks" },
                    { value: `${ctr}%`, label: "CTR" },
                    { value: totalHistoryViews, label: "Historias" },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <p className="text-2xl font-bold text-black">{metric.value}</p>
                      <p className="text-xs text-gray-500">{metric.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DailyActivityList dailyActivity={analyticsData.dailyActivity} timeRange={timeRange} />
            <ClickDetailsCard clickDetails={analyticsData.clickDetails} />
            <HistoryStatsList historyItems={historyItems} loading={historyLoading} />
          </div>
        </div>

        {/* VISTA DESKTOP */}
        <div className="hidden lg:block">
          <AnalyticsHero slug={biosite?.slug} views={totalViews} clicks={totalClicks} ctr={ctr} />

          <div className="flex  gap-5">
            <DailyActivityGrid dailyActivity={analyticsData.dailyActivity} timeRange={timeRange} />
            <ClickDetailsCard clickDetails={analyticsData.clickDetails} />
          </div>

          <HistoryStatsTable historyItems={historyItems} loading={historyLoading} />
        </div>
      </div>
      <div className="h-10"></div>
    </div>
  );
};

const Analytics = () => {
  const biositeId = Cookies.get("biositeId");

  if (biositeId) {
    return (
      <AnalyticsWrapper biositeId={biositeId} isPublicView={false}>
        <AnalyticsContent />
      </AnalyticsWrapper>
    );
  }

  return <AnalyticsContent />;
};

export default Analytics;
