import { usePreview } from "../context/PreviewContext";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const Analytics = () => {
    const { views, clicks } = usePreview();
    const ctr = clicks > 0 && views > 0 ? Math.round((clicks / views) * 100) : 0;

    const data = [
        { day: "Mon", views: 8 },
        { day: "Tue", views: 12 },
        { day: "Wed", views: 6 },
        { day: "Thu", views: 14 },
        { day: "Fri", views: 10 },
        { day: "Sat", views: 4 },
        { day: "Sun", views: 7 },
    ];

    return (
        <div className="min-h-screen w-full  text-white px-6 py-12">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-semibold mb-2 text-center">Analytics</h1>
                <p className="text-center text-gray-500 text-sm mb-10">
                    Visualize engagement with your Bio Site
                </p>

                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a] text-center">
                        <p className="text-sm text-gray-400">Views</p>
                        <p className="text-3xl font-bold">{views}</p>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a] text-center">
                        <p className="text-sm text-gray-400">Clicks</p>
                        <p className="text-3xl font-bold">{clicks}</p>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a] text-center">
                        <p className="text-sm text-gray-400">CTR</p>
                        <p className="text-3xl font-bold">{ctr}%</p>
                        <div className="mt-2 w-full h-2 bg-[#2a2a2a] rounded-full">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all"
                                style={{ width: `${ctr}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-[#2a2a2a] mb-12">
                    <h2 className="text-lg font-medium mb-4">Views over the week</h2>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={data}>
                            <XAxis dataKey="day" stroke="#888" />
                            <YAxis stroke="#666" />
                            <Tooltip contentStyle={{ background: "#1f1f1f", border: "none" }} />
                            <Bar dataKey="views" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Social Links activity placeholder */}
                <div className="text-sm text-gray-500 text-center">
                    <h2 className="mb-1 font-medium tracking-wide">SOCIAL LINKS</h2>
                    <p>No activity yet this week</p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
