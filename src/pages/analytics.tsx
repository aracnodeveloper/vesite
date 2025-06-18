import { useEffect, useState } from "react";
import { getBiositeAnalytics, getClicksGroupedByLabel } from "../service/apiService";

interface DailyActivity {
  day: string;
  views: number;
  clicks: number;
}

interface AnalyticsData {
  dailyActivity: DailyActivity[];
}

interface ClickData {
  label: string;
  clicks: number;
}

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [clicksData, setClicksData] = useState<ClickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userId = "exampleUserId"; // Replace with dynamic userId
        const biositeId = "exampleBiositeId"; // Replace with dynamic biositeId

        const analytics = await getBiositeAnalytics(userId);
        const clicks = await getClicksGroupedByLabel(biositeId);

        setAnalyticsData(analytics);
        setClicksData(clicks);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-6">Loading metrics...</div>;

  return (
    <div className="min-h-screen text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 text-center">Analytics</h1>
        <p className="text-center text-gray-500 text-sm mb-10">
          Visualize engagement with your Bio Site
        </p>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {analyticsData?.dailyActivity.map((activity, index) => (
              <div key={index} className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a]">
                <p className="text-sm text-gray-400">Day: {activity.day}</p>
                <p className="text-sm text-gray-400">Views: {activity.views}</p>
                <p className="text-sm text-gray-400">Clicks: {activity.clicks}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Clicks by Link</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b p-2">Label</th>
                <th className="border-b p-2">Clicks</th>
              </tr>
            </thead>
            <tbody>
              {clicksData.map((click) => (
                <tr key={click.label}>
                  <td className="border-b p-2">{click.label}</td>
                  <td className="border-b p-2">{click.clicks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
