import { useAnalytics } from "../hooks/useFetchMetrics.ts";

const Analytics = () => {
    const { data, loading, ctr } = useAnalytics();

    if (loading) return <div className="text-white p-6">Loading metrics...</div>;

    return (
        <div className="min-h-screen  text-white px-6 py-16">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-semibold mb-2 text-center">Analytics</h1>
                <p className="text-center text-gray-500 text-sm mb-10">
                    Visualize engagement with your Bio Site
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a] text-center">
                        <p className="text-sm text-gray-400">Views</p>
                        <p className="text-3xl font-bold">{data?.views ?? 0}</p>
                    </div>
                    <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a] text-center">
                        <p className="text-sm text-gray-400">Clicks</p>
                        <p className="text-3xl font-bold">{data?.clicks ?? 0}</p>
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
            </div>
        </div>
    );
};

export default Analytics;
