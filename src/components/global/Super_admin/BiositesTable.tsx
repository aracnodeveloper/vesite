import React, {useCallback} from "react";
import Pagination from "./Pagination.tsx";
import {
  Users,
  Globe,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Calendar,
  BarChart3,
  TrendingUp,
  MousePointer,
} from "lucide-react";
import type {
  BiositeFull,
  BiositesTableProps,
} from "../../../interfaces/AdminData.ts";
import Loading from "../../shared/Loading.tsx";
import ExpandedAnalytics from "./Biosite/ExpandedAnalytics.tsx";
import ExpandedBiositeDetails from "./Biosite/ExpandedBiositeDetails.tsx";

export const BiositesTable: React.FC<BiositesTableProps> = ({
                                                              pagination,
                                                              biositeLinks,
                                                              loadingBiositeLinks,
                                                              analyticsData,
                                                              loadingAnalytics,
                                                              showAnalytics,
                                                              analyticsTimeRange,
                                                              expandedBiosite,
                                                              businessCards,
                                                              loadingCards,
                                                              toggleBiositeExpansion,
                                                              toggleAnalytics,
                                                              fetchBiositeAnalytics,
                                                              setAnalyticsTimeRange,
                                                              setShowAnalytics,
                                                              setAnalyticsData,
                                                              formatDate,
                                                              parseVCardData,
                                                              fetchBusinessCard, 
                                                            }) => {

  const handleToggleBiositeExpansion = useCallback(
      (biositeId: string) => {
        const wasExpanded = expandedBiosite === biositeId;
        toggleBiositeExpansion(biositeId);

        if (!wasExpanded) {
          const biosite = pagination.data.find((b) => b.id === biositeId);
          if (biosite?.ownerId) {
            fetchBusinessCard(biosite.ownerId);
          }
        }
      },
      [expandedBiosite, toggleBiositeExpansion, pagination.data, fetchBusinessCard]
  );

  if (!pagination.data || pagination.data.length === 0) {
    return (
        <div className="text-center py-8">
          <p className="text-gray-500">No hay biosites para mostrar</p>
        </div>
    );
  }

  return (
      <div>
        <div className="overflow-x-auto">
          <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              loading={pagination.loading}
              canGoNext={pagination.canGoNext}
              canGoPrev={pagination.canGoPrev}
              visiblePages={pagination.visiblePages}
              pageInfo={pagination.pageInfo}
              onPageChange={pagination.setPage}
              onPageSizeChange={pagination.setPageSize}
              onFirst={pagination.goToFirstPage}
              onLast={pagination.goToLastPage}
              onNext={pagination.nextPage}
              onPrev={pagination.prevPage}
              totalUnfilteredItems={pagination.totalUnfilteredItems}
          />
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Biosite
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Analytics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {pagination.data.map((biosite: BiositeFull) => {
              const isExpanded = expandedBiosite === biosite.id;
              const userBusinessCard = businessCards[biosite.ownerId];
              const isLoadingCard = loadingCards[biosite.ownerId];
              const biositeAnalytics = analyticsData[biosite.id];
              const isLoadingAnalytics = loadingAnalytics[biosite.id];
              const isShowingAnalytics = showAnalytics[biosite.id];

              return (
                  <React.Fragment key={biosite.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Globe className="w-5 h-5 text-blue-500 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {biosite.title || "Sin título"}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {biosite.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {biosite.owner?.name ||
                                  biosite.owner?.email ||
                                  "Usuario desconocido"}
                            </div>
                            {biosite.owner?.email && biosite.owner?.name && (
                                <div className="text-xs text-gray-500">
                                  {biosite.owner.email}
                                </div>
                            )}
                            {biosite.owner?.cedula && (
                                <div className="text-xs text-gray-400">
                                  CI: {biosite.owner.cedula}
                                </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-600">
                        {biosite.slug ? `/${biosite.slug}` : "Sin slug"}
                      </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {isLoadingAnalytics ? (
                            <Loading />
                        ) : biositeAnalytics ? (
                            <div className="flex flex-col space-y-1">
                              <div className="flex items-center">
                                <Eye className="w-3 h-3 text-blue-500 mr-1" />
                                <span className="text-sm font-semibold text-gray-900">
                              {biositeAnalytics.views}
                            </span>
                                <span className="text-xs text-gray-500 ml-1">
                              vistas
                            </span>
                              </div>
                              <div className="flex items-center">
                                <MousePointer className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-sm font-semibold text-gray-900">
                              {biositeAnalytics.clicks}
                            </span>
                                <span className="text-xs text-gray-500 ml-1">
                              clicks
                            </span>
                              </div>
                              {biositeAnalytics.views > 0 && (
                                  <div className="flex items-center">
                                    <TrendingUp className="w-3 h-3 text-purple-500 mr-1" />
                                    <span className="text-xs text-gray-600">
                                {Math.round(
                                    (biositeAnalytics.clicks /
                                        biositeAnalytics.views) *
                                    100
                                )}
                                      % CTR
                              </span>
                                  </div>
                              )}
                            </div>
                        ) : (
                            <button
                                onClick={() =>
                                    toggleAnalytics(biosite.id, biosite.ownerId)
                                }
                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                            >
                              <BarChart3 className="w-4 h-4 mr-1" />
                              Ver analytics
                            </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              biosite.isActive
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                          }`}
                      >
                        {biosite.isActive ? (
                            <>
                              <Eye className="w-3 h-3 mr-1" />
                              Activo
                            </>
                        ) : (
                            <>
                              <EyeOff className="w-3 h-3 mr-1" />
                              Inactivo
                            </>
                        )}
                      </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(biosite.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col space-y-2">
                          <button
                              onClick={() => handleToggleBiositeExpansion(biosite.id)}
                              className="text-indigo-600 hover:text-indigo-900 flex items-center cursor-pointer"
                          >
                            {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4 mr-1" />
                                  Ocultar
                                </>
                            ) : (
                                <>
                                  <ChevronDown className="w-4 h-4 mr-1" />
                                  Ver detalles
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
                                  className="text-blue-600 hover:text-blue-900 flex items-center text-xs cursor-pointer"
                              >
                                <BarChart3 className="w-3 h-3 mr-1" />
                                {isShowingAnalytics
                                    ? "Ocultar analytics"
                                    : "Ver analytics"}
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

                    {/* Original expanded biosite details */}
                    {isExpanded && (
                        <ExpandedBiositeDetails
                            biosite={biosite}
                            userBusinessCard={userBusinessCard}
                            isLoadingCard={isLoadingCard}
                            biositeLinks={biositeLinks}
                            loadingBiositeLinks={loadingBiositeLinks}
                            formatDate={formatDate}
                            parseVCardData={parseVCardData}
                        />
                    )}
                  </React.Fragment>
              );
            })}
            </tbody>
          </table>
        </div>

        <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            loading={pagination.loading}
            canGoNext={pagination.canGoNext}
            canGoPrev={pagination.canGoPrev}
            visiblePages={pagination.visiblePages}
            pageInfo={pagination.pageInfo}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
            onFirst={pagination.goToFirstPage}
            onLast={pagination.goToLastPage}
            onNext={pagination.nextPage}
            onPrev={pagination.prevPage}
            totalUnfilteredItems={pagination.totalUnfilteredItems}
        />
      </div>
  );
};