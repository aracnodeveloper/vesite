import React from 'react';
import {
    Eye,
    MousePointer,
    TrendingUp,
    BarChart3
} from 'lucide-react';
import type { AnalyticsData, TimeRange } from '../../../interfaces/AdminData.ts';

interface AnalyticsRowProps {
    biositeId: string;
    analyticsData: AnalyticsData;
    analyticsTimeRange: TimeRange;
    onRefresh: () => void;
    setAnalyticsTimeRange: (timeRange: TimeRange) => void;
    setAnalyticsData: (data: any) => void;
    isChildBiosite?: boolean;
}

export const AnalyticsExpandedRow: React.FC<AnalyticsRowProps> = ({
                                                                      biositeId,
                                                                      analyticsData,
                                                                      analyticsTimeRange,
                                                                      onRefresh,
                                                                      setAnalyticsTimeRange,
                                                                      setAnalyticsData,
                                                                      isChildBiosite = false
                                                                  }) => {
    const getTimeRangeLabel = (range: TimeRange) => {
        switch (range) {
            case 'last7': return 'Últimos 7 días';
            case 'last30': return 'Últimos 30 días';
            case 'lastYear': return 'Último año';
            default: return 'Últimos 7 días';
        }
    };

    return (
        <tr>
            <td colSpan={8} className={`px-6 py-4 ${isChildBiosite ? 'bg-blue-50 border-l-4 border-blue-500' : 'bg-blue-50 border-l-4 border-blue-500'}`}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-blue-800 flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Analytics del {isChildBiosite ? 'Biosite Hijo' : 'Biosite'} ({getTimeRangeLabel(analyticsTimeRange)})
                        </h4>
                        <div className="mb-4 flex items-center space-x-4">
                            <label className="text-sm font-medium text-gray-700">
                                Rango de tiempo para analytics:
                            </label>
                            <select
                                value={analyticsTimeRange}
                                onChange={(e) => {
                                    setAnalyticsTimeRange(e.target.value as TimeRange);
                                    setAnalyticsData({});
                                }}
                                className="px-3 py-1 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="last7">Últimos 7 días</option>
                                <option value="last30">Últimos 30 días</option>
                                <option value="lastYear">Último año</option>
                            </select>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                        >
                            Actualizar
                        </button>
                    </div>

                    {/* Summary metrics */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white p-3 rounded border">
                            <div className="flex items-center">
                                <Eye className="w-5 h-5 text-blue-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Vistas</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {analyticsData.views}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded border">
                            <div className="flex items-center">
                                <MousePointer className="w-5 h-5 text-green-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500">Total Clicks</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {analyticsData.clicks}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-3 rounded border">
                            <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                                <div>
                                    <p className="text-xs text-gray-500">CTR</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {analyticsData.views > 0
                                            ? Math.round((analyticsData.clicks / analyticsData.views) * 100)
                                            : 0}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {analyticsData.dailyActivity && analyticsData.dailyActivity.length > 0 && (
                        <div className="bg-white p-4 rounded border">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Actividad {analyticsTimeRange === 'lastYear' ? 'Mensual' : 'Diaria'}
                            </h5>
                            <div className="max-h-40 overflow-y-auto">
                                <div className="space-y-2">
                                    {analyticsData.dailyActivity.slice(0, 7).map((activity, index) => (
                                        <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600">{activity.day}</span>
                                            <div className="flex space-x-4 text-sm">
                                                <span className="flex items-center text-blue-600">
                                                    <Eye className="w-3 h-3 mr-1" />
                                                    {activity.views}
                                                </span>
                                                <span className="flex items-center text-green-600">
                                                    <MousePointer className="w-3 h-3 mr-1" />
                                                    {activity.clicks}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Click details */}
                    {analyticsData.clickDetails && analyticsData.clickDetails.length > 0 && (
                        <div className="bg-white p-4 rounded border">
                            <h5 className="text-sm font-medium text-gray-700 mb-3">
                                Clicks por Link
                            </h5>
                            <div className="max-h-40 overflow-y-auto">
                                <div className="space-y-2">
                                    {analyticsData.clickDetails.slice(0, 10).map((click, index) => (
                                        <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                            <span className="text-sm text-gray-600 truncate">
                                                {click.label}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {click.count}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </td>
        </tr>
    );
};

interface AnalyticsCellProps {
    biositeId: string;
    ownerId: string;
    analyticsData?: AnalyticsData;
    isLoadingAnalytics: boolean;
    onToggleAnalytics: (biositeId: string, ownerId: string) => void;
}

export const AnalyticsCell: React.FC<AnalyticsCellProps> = ({
                                                                biositeId,
                                                                ownerId,
                                                                analyticsData,
                                                                isLoadingAnalytics,
                                                                onToggleAnalytics
                                                            }) => {
    if (isLoadingAnalytics) {
        return (
            <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-xs text-gray-500">Cargando...</span>
            </div>
        );
    }

    if (analyticsData) {
        return (
            <div className="flex flex-col space-y-1">
                <div className="flex items-center">
                    <Eye className="w-3 h-3 text-blue-500 mr-1" />
                    <span className="text-sm font-semibold text-gray-900">
                        {analyticsData.views}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">vistas</span>
                </div>
                <div className="flex items-center">
                    <MousePointer className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-gray-900">
                        {analyticsData.clicks}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">clicks</span>
                </div>
                {analyticsData.views > 0 && (
                    <div className="flex items-center">
                        <TrendingUp className="w-3 h-3 text-purple-500 mr-1" />
                        <span className="text-xs text-gray-600">
                            {Math.round((analyticsData.clicks / analyticsData.views) * 100)}% CTR
                        </span>
                    </div>
                )}
            </div>
        );
    }

    return (
        <button
            onClick={() => onToggleAnalytics(biositeId, ownerId)}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
        >
            <BarChart3 className="w-4 h-4 mr-1" />
            Ver analytics
        </button>
    );
};