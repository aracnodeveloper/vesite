import type { TimeRange } from "../types/Analytics";

export const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: "last7", label: "Últimos 7 días" },
  { value: "last30", label: "Últimos 30 días" },
  { value: "lastYear", label: "Último año" },
];

export const getTimeRangeLabel = (timeRange: TimeRange): string =>
  TIME_RANGE_OPTIONS.find((option) => option.value === timeRange)?.label ||
  "Período seleccionado";

/** El rango anual se agrupa por mes; el resto, por día. */
export const getPeriodUnit = (timeRange: TimeRange) =>
  timeRange === "lastYear"
    ? { unit: "Mes", adjective: "Mensual" }
    : { unit: "Día", adjective: "Diaria" };

export const getCtr = (views: number, clicks: number): number =>
  views > 0 ? Math.round((clicks / views) * 100) : 0;
