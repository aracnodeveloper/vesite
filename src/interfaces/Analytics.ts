export interface LinkClick {
    label: string;
    count: number;
    link_type: string;
    url: string;
    isActive: boolean;
}

export interface DailyActivity {
    day: string;
    views: number;
    clicks: number;
    linkClicks: LinkClick[];  // Agregar esto
}

export interface ClickDetail {
    label: string;
    count: number;
    link_type: string;
    url: string;
    isActive: boolean;  // Cambiar de string a boolean
}

export interface AnalyticsData {
    biositeId: string;  // Agregar esto
    biositeSlug: string;  // Agregar esto
    dailyActivity: DailyActivity[];
    clickDetails: ClickDetail[];
    views: number;
    clicks: number;
}