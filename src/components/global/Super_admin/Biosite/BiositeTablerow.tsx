import {
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";
import type {
  BiositeFull,
  LinkData,
  TimeRange,
} from "../../../../interfaces/AdminData";
import Loading from "../../../shared/Loading";
import BiositeAnalyticsSummary from "./BiositeAnalyticsSummary";
import ExpandedAnalytics from "./ExpandedAnalytics";
import ExpandedBiositeDetails from "./ExpandedBiositeDetails";

export default function BiositeTableRow({
  biosite,
  isExpanded,
  businessCards,
  loadingCards,
  analyticsData,
  loadingAnalytics,
  showAnalytics,
  toggleAnalytics,
  formatDate,
  toggleBiositeExpansion,
  setShowAnalytics,
  analyticsTimeRange,
  setAnalyticsTimeRange,
  setAnalyticsData,
  fetchBiositeAnalytics,
  parseVCardData,
  biositeLinks,
  loadingBiositeLinks,
}: {
  biosite: BiositeFull;
  isExpanded: boolean;
  businessCards: { [key: string]: any };
  loadingCards: { [key: string]: boolean };
  analyticsData: { [key: string]: any };
  loadingAnalytics: { [key: string]: boolean };
  showAnalytics: { [key: string]: boolean };
  toggleAnalytics: (biositeId: string, ownerId: string) => void;
  formatDate: (dateString?: string) => string;
  toggleBiositeExpansion: (biositeId: string) => void;
  setShowAnalytics: React.Dispatch<
    React.SetStateAction<{ [key: string]: boolean }>
  >;
  analyticsTimeRange: TimeRange;
  setAnalyticsTimeRange: (range: TimeRange) => void;
  setAnalyticsData: React.Dispatch<
    React.SetStateAction<{ [key: string]: any }>
  >;
  fetchBiositeAnalytics: (biositeId: string, ownerId: string) => void;
  parseVCardData: (businessCard: any) => any;
  biositeLinks: { [key: string]: LinkData[] };
  loadingBiositeLinks: { [key: string]: boolean };
}) {
  const userBusinessCard = businessCards[biosite.ownerId];
  const isLoadingCard = loadingCards[biosite.ownerId];
  const biositeAnalytics = analyticsData[biosite.id];
  const isLoadingAnalytics = loadingAnalytics[biosite.id];
  const isShowingAnalytics = showAnalytics[biosite.id];

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {biosite.title || "Sin título"}
              </div>
              <div className="text-xs text-green-600 font-medium">
                VESITE HIJO
              </div>
              <div className="text-xs text-gray-500">
                ID: {biosite.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="bg-blue-100 p-1 rounded-full mr-1 sm:mr-2 flex-shrink-0">
              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                {biosite.owner?.name ||
                  biosite.owner?.email ||
                  "Usuario desconocido"}
              </div>
              {biosite.owner?.email && biosite.owner?.name && (
                <div className="text-xs text-gray-500 truncate">
                  {biosite.owner.email}
                </div>
              )}
              {biosite.owner?.cedula && (
                <div className="text-xs text-gray-400 truncate">
                  CI: {biosite.owner.cedula}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <span className="text-xs sm:text-sm font-mono text-gray-600 truncate block">
            {biosite.slug ? `/${biosite.slug}` : "Sin slug"}
          </span>
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          {isLoadingAnalytics ? (
            <Loading />
          ) : biositeAnalytics ? (
            <BiositeAnalyticsSummary biositeAnalytics={biositeAnalytics} />
          ) : (
            <button
              onClick={() => toggleAnalytics(biosite.id, biosite.ownerId)}
              className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm cursor-pointer touch-manipulation"
            >
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">Ver analytics</span>
            </button>
          )}
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <span
            className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
              biosite.isActive
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {biosite.isActive ? (
              <>
                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Activo</span>
              </>
            ) : (
              <>
                <EyeOff className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">Inactivo</span>
              </>
            )}
          </span>
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{formatDate(biosite.createdAt)}</span>
          </div>
        </td>
        <td className="px-2 sm:px-3 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
          <div className="flex flex-col space-y-1 sm:space-y-2">
            <button
              onClick={() => toggleBiositeExpansion(biosite.id)}
              className="text-indigo-600 hover:text-indigo-900 flex items-center cursor-pointer touch-manipulation"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Ocultar</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 flex-shrink-0" />
                  <span className="hidden sm:inline">Ver detalles</span>
                </>
              )}
            </button>

            {biositeAnalytics && (
              <button
                onClick={() =>
                  setShowAnalytics((prev) => ({
                    ...prev,
                    [biosite.id]: !prev[biosite.id],
                  }))
                }
                className="text-blue-600 hover:text-blue-900 flex items-center text-xs cursor-pointer touch-manipulation"
              >
                <BarChart3 className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="hidden sm:inline">
                  {isShowingAnalytics ? "Ocultar analytics" : "Ver analytics"}
                </span>
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Analytics expanded view */}
      {isShowingAnalytics && biositeAnalytics && (
        <ExpandedAnalytics
          analyticsTimeRange={analyticsTimeRange}
          setAnalyticsTimeRange={setAnalyticsTimeRange}
          setAnalyticsData={setAnalyticsData}
          fetchBiositeAnalytics={fetchBiositeAnalytics}
          biositeAnalytics={biositeAnalytics}
          biosite={biosite}
        />
      )}

      {/* Expanded biosite details */}
      {isExpanded && (
        <ExpandedBiositeDetails
          ischild
          biosite={biosite}
          userBusinessCard={userBusinessCard}
          isLoadingCard={isLoadingCard}
          biositeLinks={biositeLinks}
          loadingBiositeLinks={loadingBiositeLinks}
          formatDate={formatDate}
          parseVCardData={parseVCardData}
        />
      )}
    </>
  );
}
