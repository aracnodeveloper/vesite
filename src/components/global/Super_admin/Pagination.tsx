import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  loading?: boolean;
  canGoNext: boolean;
  canGoPrev: boolean;
  visiblePages: number[];
  pageInfo: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onFirst: () => void;
  onLast: () => void;
  onNext: () => void;
  onPrev: () => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  showFirstLast?: boolean;
  className?: string;
  totalUnfilteredItems?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  loading = false,
  canGoNext,
  canGoPrev,
  visiblePages,
  pageInfo,
  onPageChange,
  onPageSizeChange,
  onFirst,
  onLast,
  onNext,
  onPrev,
  pageSizeOptions = [5, 10, 20, 50],
  showPageSizeSelector = true,
  showPageInfo = true,
  showFirstLast = true,
  className = "",
  totalUnfilteredItems = 0,
}) => {
  const shouldShowPagination =
    totalPages > 1 || (totalUnfilteredItems > pageSize && totalItems === 0);

  if (!shouldShowPagination && !showPageSizeSelector) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4 p-2 sm:p-4 bg-white border-t ${className}`}
    >
      {/* Información de página y selector de tamaño */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full sm:w-auto">
        {showPageInfo && (
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            {totalItems === 0 && totalUnfilteredItems > 0
              ? `Sin resultados en página ${currentPage} (${totalUnfilteredItems} totales)`
              : pageInfo}
          </div>
        )}

        {showPageSizeSelector && (
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-xs sm:text-sm text-gray-700 hidden sm:inline">
              Mostrar:
            </span>
            <span className="text-xs sm:text-sm text-gray-700 sm:hidden">
              Por página:
            </span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-1 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer"
              style={{ color: "black" }}
              disabled={loading}
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Controles de navegación - mostrar siempre que haya potencialmente más páginas */}
      {shouldShowPagination && (
        <div className="flex items-center gap-0.5 sm:gap-1">
          {/* Botón Primera página */}
          {showFirstLast && (
            <button
              onClick={onFirst}
              disabled={!canGoPrev || loading}
              className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation"
              title="Primera página"
            >
              <ChevronsLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}

          {/* Botón Página anterior */}
          <button
            onClick={onPrev}
            disabled={!canGoPrev || loading}
            className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation"
            title="Página anterior"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Números de página */}
          <div className="flex items-center gap-0.5 sm:gap-1 mx-1 sm:mx-2">
            {visiblePages.map((page, index) => {
              if (page === -1) {
                // Ellipsis
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 sm:px-2 py-1 text-gray-400 cursor-pointer"
                  >
                    <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4" />
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  disabled={loading}
                  className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors cursor-pointer touch-manipulation ${
                    isActive
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 hover:bg-gray-50 border border-gray-300"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Botón Página siguiente */}
          <button
            onClick={onNext}
            disabled={!canGoNext || loading}
            className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation"
            title="Página siguiente"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>

          {/* Botón Última página */}
          {showFirstLast && (
            <button
              onClick={onLast}
              disabled={!canGoNext || loading}
              className="p-1.5 sm:p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer touch-manipulation"
              title="Última página"
            >
              <ChevronsRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Pagination;
