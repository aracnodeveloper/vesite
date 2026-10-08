import type { FilterState } from '../components/SearchAndFilters';

/**
 * Construye los parámetros de consulta para la API de biosites
 * Maneja la lógica de prioridad entre slugSearch y hasSlug
 */
export function buildBiositeQueryParams(
    filters: FilterState,
    page: number,
    pageSize: number
): Record<string, string> {
    const params: Record<string, string> = {
        page: page.toString(),
        size: pageSize.toString(),
    };

    // Búsqueda general (título, email, etc.)
    if (filters.search?.trim()) {
        params.search = filters.search.trim();
    }

    // Ordenamiento
    if (filters.sortBy) {
        params.orderBy = filters.sortBy;
    }
    if (filters.sortOrder) {
        params.orderMode = filters.sortOrder;
    }

    // Estado
    if (filters.status && filters.status !== "all") {
        params.status = filters.status;
    }

    // Fecha
    if (filters.dateRange && filters.dateRange !== "all") {
        params.dateRange = filters.dateRange;
    }

    // LÓGICA DE SLUG CON PRIORIDAD
    // 1. Si hay búsqueda específica de slug (slugSearch), tiene prioridad absoluta
    if (filters.slugSearch?.trim()) {
        params.slug = filters.slugSearch.trim();
    }
    // 2. Si no hay búsqueda específica, usar el filtro de estado (with-slug/without-slug)
    else if (filters.hasSlug && filters.hasSlug !== "all") {
        params.slug = filters.hasSlug;
    }

    return params;
}

/**
 * Limpia los parámetros eliminando valores undefined o vacíos
 */
export function cleanParams(params: Record<string, any>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(params).filter(([_, value]) =>
            value !== undefined &&
            value !== null &&
            value !== ''
        )
    ) as Record<string, string>;
}
