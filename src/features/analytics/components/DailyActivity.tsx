import type { DailyActivity as DailyActivityItem, TimeRange } from "../types/Analytics";
import { getPeriodUnit } from "../utils/timeRange";

interface DailyActivityProps {
  dailyActivity: DailyActivityItem[];
  timeRange: TimeRange;
}

/** Lista de actividad por día/mes para la vista móvil. */
export const DailyActivityList = ({ dailyActivity, timeRange }: DailyActivityProps) => (
  <div className="bg-white rounded-2xl p-6">
    <h2 className="text-lg font-medium text-black mb-4">
      Actividad {getPeriodUnit(timeRange).adjective}
    </h2>
    <div className="space-y-3">
      {dailyActivity.map((activity, index) => (
        <div key={index} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-black font-medium">{activity.day}</span>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-600">👁️ {activity.views}</span>
              <span className="text-gray-600">👆 {activity.clicks}</span>
            </div>
          </div>

          {activity.linkClicks && activity.linkClicks.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Clicks por enlace:</p>
              <div className="space-y-1">
                {activity.linkClicks.slice(0, 3).map((linkClick, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-600 truncate mr-2">{linkClick.label}</span>
                    <span className="text-gray-800 font-medium">{linkClick.count}</span>
                  </div>
                ))}
                {activity.linkClicks.length > 3 && (
                  <p className="text-xs text-gray-400 italic">
                    +{activity.linkClicks.length - 3} más...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

/** Rejilla de actividad por día/mes para la vista de escritorio. */
export const DailyActivityGrid = ({ dailyActivity, timeRange }: DailyActivityProps) => {
  const { unit, adjective } = getPeriodUnit(timeRange);

  return (
    <div className="bg-white rounded-3xl p-10">
      <h2 className="text-xl text-gray-600 font-semibold mb-6">Actividad {adjective}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-col-2 xl:grid-cols-3 gap-6">
        {dailyActivity.map((activity, index) => (
          <div key={index} className="p-6 rounded-xl border border-gray-200 bg-[#E8FAD5]">
            <p className="text-sm text-gray-600 mb-2 font-medium">
              {unit}: {activity.day}
            </p>
            <div className="flex justify-between items-center gap-5 mb-3">
              <div>
                <p className="text-lg font-semibold text-gray-600">{activity.views}</p>
                <p className="text-xs text-gray-500">Vistas</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-600">{activity.clicks}</p>
                <p className="text-xs text-gray-500">Clicks</p>
              </div>
            </div>

            {activity.linkClicks && activity.linkClicks.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-300">
                <p className="text-xs text-gray-500 mb-2 font-medium">Enlaces más clickeados:</p>
                <div className="space-y-1">
                  {activity.linkClicks.slice(0, 3).map((linkClick, idx) => (
                    <div key={idx} className="flex justify-between text-xs items-center">
                      <span className="flex flex-col text-gray-600 font-semibold truncate mr-2">
                        {linkClick.label}
                        <a className="font-light">{linkClick.url.slice(0, 30)}</a>
                      </span>
                      <span className="text-gray-800 font-semibold">{linkClick.count}</span>
                    </div>
                  ))}
                  {activity.linkClicks.length > 3 && (
                    <p className="text-xs text-gray-500 italic mt-1">
                      +{activity.linkClicks.length - 3} enlaces más
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
