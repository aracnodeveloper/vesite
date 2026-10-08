import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../../../core/api/errors";
import { useFetchBiosite } from "../../biosite/hooks/useFetchBiosite";
import { defaultFilters, type FilterState } from "../components/SearchAndFilters";
import type { BiositeFull } from "../types/AdminData";
import { filtersToListParams } from "../utils/adminUtils";
import type { AdminPermissions } from "./useAdminPermissions";
import { usePagination } from "./usePagination";

export type ViewMode = "all" | "children";

interface UseAdminBiositeListOptions {
  permissions: AdminPermissions;
  userId?: string;
  /** Se llama con los biosites hijos recién cargados (para precargar sus detalles). */
  onChildBiositesLoaded: (biosites: BiositeFull[]) => void;
}

/**
 * Listado del panel: todos los biosites (paginados y filtrados) para
 * super-admins, o los biosites hijos del admin en sesión.
 */
export const useAdminBiositeList = ({ permissions, userId, onChildBiositesLoaded }: UseAdminBiositeListOptions) => {
  const { fetchAllBiosites, fetchChildBiosites } = useFetchBiosite();

  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>(defaultFilters);
  const [filteredData, setFilteredData] = useState<BiositeFull[]>([]);
  const [childBiosites, setChildBiosites] = useState<BiositeFull[]>([]);

  const allBiositesPagination = usePagination<BiositeFull>({ initialPage: 1, initialSize: 10 });
  const childBiositesPagination = usePagination<BiositeFull>({ initialPage: 1, initialSize: 10 });

  const shouldShowAllBiosites = permissions.hasFullAccess && viewMode === "all";

  const getCurrentPagination = useCallback(() => {
    if (permissions.hasFullAccess && viewMode === "all") {
      return allBiositesPagination;
    } else if (permissions.hasChildBiositeAccess) {
      return childBiositesPagination;
    }
    return allBiositesPagination;
  }, [
    permissions.hasFullAccess,
    permissions.hasChildBiositeAccess,
    viewMode,
    allBiositesPagination,
    childBiositesPagination,
  ]);

  const changeViewMode = useCallback(
    (newViewMode: ViewMode) => {
      if (!permissions.canToggleView) return;

      setViewMode(newViewMode);
      setCurrentFilters(defaultFilters);
      setFilteredData([]);
      setInitialized(false);
    },
    [permissions.canToggleView]
  );

  const applyFilters = useCallback(
    async (page: number, size: number, filters: FilterState): Promise<BiositeFull[]> => {
      try {
        const response = await fetchAllBiosites(filtersToListParams(filters, page, size));
        return Array.isArray(response) ? response : response?.data || [];
      } catch (err) {
        console.error("Error en applyFilters:", err);
        return [];
      }
    },
    [fetchAllBiosites]
  );

  const handleSearch = useCallback(
    async (filters: FilterState) => {
      setCurrentFilters(filters);
      const currentPagination = getCurrentPagination();

      if (currentPagination.data.length > 0) {
        setFilteredData(await applyFilters(currentPagination.currentPage, currentPagination.pageSize, filters));
      }

      currentPagination.setPage(1);
    },
    [getCurrentPagination, applyFilters]
  );

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(defaultFilters);
    const currentPagination = getCurrentPagination();
    setFilteredData(currentPagination.data);
    currentPagination.setPage(1);
  }, [getCurrentPagination]);

  const loadData = useCallback(async () => {
    if (!permissions.hasChildBiositeAccess || !userId) return;

    const currentPagination = getCurrentPagination();
    try {
      currentPagination.setLoading(true);
      currentPagination.setError(null);

      if (shouldShowAllBiosites) {
        const response = await fetchAllBiosites(currentPagination.getPaginationParams());
        currentPagination.setPaginatedData(response);
        const responseData = Array.isArray(response) ? response : response?.data || [];

        if (responseData.length > 0) {
          setFilteredData(
            await applyFilters(currentPagination.currentPage, currentPagination.pageSize, currentFilters)
          );
        }
      } else {
        const children = await fetchChildBiosites(userId);
        setChildBiosites(children);
        onChildBiositesLoaded(children);
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err, "Error al cargar biosites");
      currentPagination.setError(errorMessage);
      setError(errorMessage);
    } finally {
      currentPagination.setLoading(false);
    }
  }, [
    permissions.hasChildBiositeAccess,
    shouldShowAllBiosites,
    userId,
    fetchAllBiosites,
    fetchChildBiosites,
    getCurrentPagination,
    applyFilters,
    currentFilters,
    onChildBiositesLoaded,
  ]);

  // Carga inicial y al cambiar de vista
  useEffect(() => {
    if (!permissions.hasChildBiositeAccess || !userId || initialized) return;

    setInitialized(true);
    loadData().catch((err) => {
      console.error("Error initializing data:", err);
      setError("Error al inicializar datos");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissions.hasChildBiositeAccess, userId, viewMode]);

  // Reaplica los filtros al cambiar de página o de filtros
  const currentPagination = getCurrentPagination();
  useEffect(() => {
    if (currentPagination.data.length > 0) {
      applyFilters(currentPagination.currentPage, currentPagination.pageSize, currentFilters).then(setFilteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFilters, currentPagination.currentPage, currentPagination.pageSize]);

  // Datos que se muestran según el modo de vista
  const currentData = useMemo(() => {
    if (viewMode === "children") return childBiosites;
    return filteredData.length > 0 ? filteredData : currentPagination.data;
  }, [viewMode, childBiosites, filteredData, currentPagination.data]);

  return {
    viewMode,
    changeViewMode,
    error,
    initialized,
    shouldShowAllBiosites,
    currentPagination,
    allBiositesPagination,
    childBiositesPagination,
    filteredData,
    childBiosites,
    currentData,
    handleSearch,
    handleResetFilters,
    refresh: loadData,
  };
};
