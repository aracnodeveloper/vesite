export type TimeRange = 'last7' | 'last30' | 'lastYear';

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
    linkClicks: LinkClick[];
}

export interface ClickDetail {
    label: string;
    count: number;
    link_type: string;
    url: string;
    isActive: boolean;
}

export interface AnalyticsData {
    biositeId: string;
    biositeSlug: string;
    dailyActivity: DailyActivity[];
    clickDetails: ClickDetail[];
    views: number;
    clicks: number;
}
