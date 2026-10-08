import React, { useCallback } from "react";
import { Eye } from "lucide-react";
import Cookie from "js-cookie";
import SearchAndFilters from "../components/SearchAndFilters";
import { BiositesTable } from "../components/BiositesTable.tsx";
import { AdminChildBiositesTable } from "../components/AdminChildBiositesTable.tsx";
import AdminHeader from "../components/AdminHeader";
import AdminStats from "../components/AdminStats";
import { useAdminPermissions } from "../hooks/useAdminPermissions";
import { useAdminBiositeList } from "../hooks/useAdminBiositeList";
import { useBiositeDetails } from "../hooks/useBiositeDetails";
import { categorizeLinks, formatDate, parseVCardData } from "../utils/adminUtils";
import type { BiositeFull } from "../types/AdminData.ts";

const AdminPanel: React.FC = () => {
  const role = Cookie.get("roleName");
  const userId = Cookie.get("userId");

  const permissions = useAdminPermissions(role, userId);
  const details = useBiositeDetails();
  const { fetchBiositeAnalytics, fetchBiositeLinks } = details;

  // Los biosites hijos se muestran con sus métricas y links ya cargados
  const preloadChildDetails = useCallback(
    (biosites: BiositeFull[]) => {
      for (const biosite of biosites) {
        if (biosite.id && biosite.ownerId) {
          fetchBiositeAnalytics(biosite.id, biosite.ownerId);
        }
        if (biosite.id) {
          fetchBiositeLinks(biosite.id);
        }
      }
    },
    [fetchBiositeAnalytics, fetchBiositeLinks]
  );

  const list = useAdminBiositeList({ permissions, userId, onChildBiositesLoaded: preloadChildDetails });
  const { currentPagination, viewMode, error, initialized, shouldShowAllBiosites } = list;

  if (!permissions.hasChildBiositeAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600">Acceso Denegado</h2>
          <p className="text-gray-500">Solo los usuarios ADMIN y SUPER_ADMIN pueden acceder a este panel.</p>
        </div>
      </div>
    );
  }

  if (currentPagination.loading && !initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">
            Cargando {shouldShowAllBiosites ? "todos los veSites" : "veSites hijos"}...
          </p>
        </div>
      </div>
    );
  }

  if (error && !initialized) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
            <div className="mt-3">
              <button
                onClick={list.refresh}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalLinks = Object.values(details.biositeLinks).reduce((sum, links) => sum + (links?.length || 0), 0);
  // Un ADMIN (sin acceso total) solo ve a sus hijos
  const biositeCount =
    viewMode === "children" || (role === "ADMIN" && !permissions.isSpecialUser)
      ? list.childBiosites.length
      : currentPagination.totalItems || 0;

  const toggleBiositeExpansion = (biositeId: string) =>
    details.toggleExpansion(biositeId, currentPagination.data.find((b) => b.id === biositeId)?.ownerId);

  const tableProps = {
    biositeLinks: details.biositeLinks,
    loadingBiositeLinks: details.loadingBiositeLinks,
    analyticsData: details.analyticsData,
    loadingAnalytics: details.loadingAnalytics,
    showAnalytics: details.showAnalytics,
    analyticsTimeRange: details.analyticsTimeRange,
    expandedBiosite: details.expandedBiosite,
    businessCards: details.businessCards,
    loadingCards: details.loadingCards,
    categorizeLinks,
    toggleBiositeExpansion,
    toggleAnalytics: details.toggleAnalytics,
    fetchBiositeAnalytics: details.fetchBiositeAnalytics,
    setAnalyticsTimeRange: details.setAnalyticsTimeRange,
    setShowAnalytics: details.setShowAnalytics,
    setAnalyticsData: details.setAnalyticsData,
    formatDate,
    parseVCardData,
    fetchBusinessCard: details.fetchBusinessCard,
    onUpdateVCard: details.handleUpdateVCard,
  };

  return (
    <div className="h-full lg:w-[1450px]  text-white px-4 py-2 lg:px-6 lg:py-16  transform scale-[0.9]">
      <AdminHeader
        permissions={permissions}
        viewMode={viewMode}
        onViewModeChange={list.changeViewMode}
        onRefresh={list.refresh}
        loading={currentPagination.loading}
      />

      <AdminStats
        showAllBiosites={shouldShowAllBiosites}
        biositeCount={biositeCount}
        totalLinks={totalLinks}
        hideLinks={role === "SUPER_ADMIN"}
      />

      {list.currentData.length > 0 && (
        <div className="mb-6">
          <SearchAndFilters
            onSearch={list.handleSearch}
            onReset={list.handleResetFilters}
            loading={currentPagination.loading}
            totalResults={viewMode === "children" ? list.childBiosites.length : list.filteredData.length}
          />
        </div>
      )}

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {shouldShowAllBiosites
                ? `veSites (${list.filteredData.length} de ${currentPagination.totalItems || 0})`
                : `veSites Hijos ${list.childBiosites.length}`}
            </h2>
            {permissions.canToggleView && (
              <div className="flex items-center text-sm text-gray-500">
                <Eye className="w-4 h-4 mr-1" />
                <span>Vista: {viewMode === "all" ? "Completa" : "Hijos"}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 ">
          {currentPagination.loading && initialized && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {error && initialized && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          {shouldShowAllBiosites ? (
            <BiositesTable
              pagination={{
                ...list.allBiositesPagination,
                data: list.filteredData,
                totalItems: list.filteredData.length,
                totalUnfilteredItems: list.allBiositesPagination.totalItems || 0,
              }}
              {...tableProps}
            />
          ) : (
            <AdminChildBiositesTable
              biosites={list.childBiosites}
              totalBiosites={list.childBiosites.length}
              loading={list.childBiositesPagination.loading}
              {...tableProps}
            />
          )}
        </div>
      </div>
      <div className="h-20"></div>
    </div>
  );
};

export default AdminPanel;
