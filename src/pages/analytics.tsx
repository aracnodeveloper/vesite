import React, { useEffect, useState, useCallback } from "react";
import { getBiositeAnalytics } from "../service/apiService";
import Cookies from 'js-cookie';
import LivePreviewContent from "../components/Preview/LivePreviewContent.tsx";
import PhonePreview from "../components/Preview/phonePreview.tsx";
import { AnalyticsWrapper, useOptionalAnalytics } from "../components/global/Analytics/AnalyticsWrapper";
import analyticsEventManager from "../service/AnalyticsEventManager";

interface DailyActivity {
  day: string;
  views: number;
  clicks: number;
}

interface ClickDetail {
  label: string;
  count: number;
}

interface AnalyticsData {
  dailyActivity: DailyActivity[];
  clickDetails: ClickDetail[];
  views: number;
  clicks: number;
}

const AnalyticsContent = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biositeId, setBiositeId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const analyticsContext = useOptionalAnalytics();

  const triggerRefresh = useCallback(() => {
    const now = new Date();
    setLastRefresh(now);

    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    const unsubscribeVisit = analyticsEventManager.onVisitTracked((biositeId) => {
      console.log('📊 Visit tracked for biosite:', biositeId);
      triggerRefresh();
    });

    const unsubscribeClick = analyticsEventManager.onLinkClickTracked((linkId) => {
      console.log('🔗 Link click tracked for link:', linkId);
      triggerRefresh();
    });

    return () => {
      unsubscribeVisit();
      unsubscribeClick();
    };
  }, [triggerRefresh]);

  useEffect(() => {
    const getBiositeId = () => {
      const cookieBiositeId = Cookies.get("biositeId");
      if (cookieBiositeId) {
        setBiositeId(cookieBiositeId);
        console.log('📍 BiositeId from cookie:', cookieBiositeId);
        return;
      }

      const token = Cookies.get('accessToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔑 UserId from token:', payload.id);
        } catch (error) {
          console.error('❌ Error decoding token:', error);
        }
      }
    };

    getBiositeId();
  }, []);

  const fetchAnalyticsData = useCallback(async () => {
    if (!biositeId) {
      console.log('⏳ Waiting for biositeId...');
      return;
    }

    try {
      setError(null);
      console.log('🔄 Fetching analytics data...', {
        biositeId,
        refreshTrigger,
        lastRefresh: lastRefresh.toISOString()
      });

      const token = Cookies.get('accessToken');
      if (!token) {
        throw new Error('No access token found');
      }

      let userId = Cookies.get("userId");
      if (!userId) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.id;
          console.log('🆔 UserId from token:', userId);
        } catch (decodeError) {
          console.error('❌ Error decoding token:', decodeError);
          throw new Error('Could not get userId');
        }
      }

      if (!userId) {
        throw new Error('Could not get userId');
      }

      // Llamada al API de analytics
      const analyticsResult = await getBiositeAnalytics(userId);
      console.log('📈 Analytics API result:', analyticsResult);

      // Validar y procesar la respuesta
      if (typeof analyticsResult === 'string' && analyticsResult.includes('<!doctype html>')) {
        console.warn('⚠️ API returned HTML instead of JSON');
        setAnalyticsData({
          dailyActivity: [{
            day: new Date().toISOString().split('T')[0],
            views: 0,
            clicks: 0
          }],
          clickDetails: [],
          views: 0,
          clicks: 0
        });
      } else if (analyticsResult && typeof analyticsResult === 'object') {

        const processedData = {
          dailyActivity: analyticsResult.dailyActivity && analyticsResult.dailyActivity.length > 0
              ? analyticsResult.dailyActivity
              : [{
                day: new Date().toISOString().split('T')[0],
                views: analyticsResult.views || 0,
                clicks: analyticsResult.clicks || 0
              }],
          clickDetails: analyticsResult.clickDetails || [],
          views: analyticsResult.views || 0,
          clicks: analyticsResult.clicks || 0
        };

        console.log('✅ Processed analytics data:', processedData);
        setAnalyticsData(processedData);
      } else {
        console.warn('⚠️ Invalid analytics result:', analyticsResult);
        // Datos por defecto
        setAnalyticsData({
          dailyActivity: [{
            day: new Date().toISOString().split('T')[0],
            views: 0,
            clicks: 0
          }],
          clickDetails: [],
          views: 0,
          clicks: 0
        });
      }

    } catch (error) {
      console.error("❌ Error fetching analytics data:", error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [biositeId, refreshTrigger, lastRefresh]);

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  const handleManualRefresh = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    setLoading(true);
    triggerRefresh();
  }, [triggerRefresh]);

  const totalViews = analyticsData?.views || 0;
  const totalClicks = analyticsData?.clicks || 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  if (loading) {
    return (
        <div className="text-white p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-3"></div>
            <span>Loading analytics...</span>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-white p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Error Loading Analytics</h3>
            <p className="text-red-300 mb-4">{error}</p>

            {/* Botón de retry */}
            <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
            >
              Retry
            </button>

            {analyticsContext && (
                <div className="mt-4 text-sm border-t border-red-500 pt-4">
                  <p className="text-gray-400">Debug Info:</p>
                  <p className="text-gray-300">BiositeId: {biositeId || 'Not set'}</p>
                  <p className="text-gray-300">Has tracked visit: {analyticsContext.hasTrackedVisit ? 'Yes' : 'No'}</p>
                  <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
                  <p className="text-gray-300">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
                  <button
                      onClick={() => {
                        analyticsContext.resetTracking();
                        handleManualRefresh();
                      }}
                      className="mt-2 px-3 py-1 bg-yellow-600 rounded text-white text-xs"
                  >
                    Reset & Refresh
                  </button>
                </div>
            )}
          </div>
        </div>
    );
  }

  if (!analyticsData) {
    return (
        <div className="text-white p-6">
          <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4">
            <h3 className="text-yellow-400 font-semibold mb-2">No Analytics Data</h3>
            <p className="text-yellow-300 mb-4">Unable to load analytics data.</p>

            <button
                onClick={handleManualRefresh}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm transition-colors"
            >
              Refresh Data
            </button>

            {analyticsContext && (
                <div className="mt-4 text-sm border-t border-yellow-500 pt-4">
                  <p className="text-gray-400">Debug Info:</p>
                  <p className="text-gray-300">BiositeId: {biositeId || 'Not set'}</p>
                  <p className="text-gray-300">Has tracked visit: {analyticsContext.hasTrackedVisit ? 'Yes' : 'No'}</p>
                  <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
                  <p className="text-gray-300">Last refresh: {lastRefresh.toLocaleTimeString()}</p>
                </div>
            )}
          </div>
        </div>
    );
  }

  return (
      <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header con refresh button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg text-gray-600 font-semibold">Estadistícas</h1>
            <button
                onClick={handleManualRefresh}
                className="px-3 py-1 bg-[#98C022] hover:bg-[#86A81E] rounded text-white text-sm transition-colors flex items-center cursor-pointer"
                disabled={loading}
            >
              {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
              )}
              Actualizar
            </button>
          </div>


          {/* VISTA MÓVIL */}
          <div className="lg:hidden">
            <div className="space-y-6">
              {/* Card de Actividad Total para móvil */}
              <div className="bg-[#1C1C1C] rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Actividad Total</h2>
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="flex justify-around items-center text-center">
                    <div>
                      <p className="text-2xl font-bold text-white">{totalViews}</p>
                      <p className="text-xs text-gray-500">Vistas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{totalClicks}</p>
                      <p className="text-xs text-gray-500">Clicks</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{ctr}%</p>
                      <p className="text-xs text-gray-500">CTR</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Clics por enlace para móvil */}
              <div className="bg-[#1C1C1C] rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Clicks por Link</h2>
                {analyticsData.clickDetails && analyticsData.clickDetails.length > 0 ? (
                    <div className="bg-black/50 rounded-lg overflow-hidden">
                      <table className="w-full text-left">
                        <tbody>
                        {analyticsData.clickDetails.map((click, index) => (
                            <tr key={`${click.label}-${index}`} className="border-b border-gray-800 last:border-b-0">
                              <td className="px-4 py-3 text-white text-sm">{click.label}</td>
                              <td className="px-4 py-3 text-white font-semibold text-right">{click.count}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <div className="bg-black/50 p-6 rounded-lg text-center">
                      <p className="text-gray-400">No click data available yet.</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* VISTA DESKTOP */}
          <div className="hidden lg:block">
            <div className="relative flex items-center justify-center mb-16">
              <div
                  className="absolute transform rounded-full flex flex-col items-center justify-center"
                  style={{height: "600px", width: "600px"}}
              >
                <svg width="858" height="858" viewBox="0 0 858 858" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g filter="url(#filter0_d_2019_354)">
                    <circle cx="429" cy="425" r="416" fill="white"/>
                  </g>
                  <defs>
                    <filter id="filter0_d_2019_354" x="0" y="0" width="858" height="858" filterUnits="userSpaceOnUse"
                            colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                     result="hardAlpha"/>
                      <feMorphology radius="3" operator="dilate" in="SourceAlpha" result="effect1_dropShadow_2019_354"/>
                      <feOffset dy="4"/>
                      <feGaussianBlur stdDeviation="5"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.03 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_2019_354"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_2019_354" result="shape"/>
                    </filter>
                  </defs>
                </svg>
              </div>

              <div
                  className="absolute left-44 top-1/3 transform -translate-y-1/2 w-44 h-44 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">VISTAS</div>
                <div className="text-4xl font-bold text-black">{totalViews}</div>
              </div>

              <div className="z-10 overflow-y-hidden">
                <PhonePreview><LivePreviewContent/></PhonePreview>
              </div>

              <div
                  className="absolute right-40 top-82 w-38 h-38 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">CLICKS</div>
                <div className="text-2xl font-bold text-black">{totalClicks}</div>
              </div>

              <div
                  className="absolute right-56 bottom-40 w-32 h-32 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">CTR</div>
                <div className="text-2xl font-bold text-black">{ctr}%</div>
              </div>
              <div
                  className="absolute left-60 top-22 w-13 h-13 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">

              </div>

              <div
                  className="absolute left-64 bottom-48 w-10 h-10 bg-[#E8FAD5] border border-gray-400 rounded-full flex flex-col items-center justify-center">

              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="bg-white rounded-3xl p-10">
                <h2 className="text-xl text-gray-600 font-semibold mb-6">Actividad Diaria</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.dailyActivity.map((activity, index) => (
                      <div key={index} className="p-6 rounded-xl border border-gray-200 bg-[#E8FAD5]">
                        <p className="text-sm text-gray-600 mb-2 ">Dia: {activity.day}</p>
                        <div className="flex justify-between items-center  w-full h-full gap-5">
                          <div>
                            <p className="text-lg font-semibold text-gray-600">{activity.views}</p>
                            <p className="text-xs text-gray-500">Vistas</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-600">{activity.clicks}</p>
                            <p className="text-xs text-gray-500">Clicks</p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-10">
                <h2 className="text-xl text-gray-600 font-semibold mb-6">Clicks por Link</h2>
                {analyticsData.clickDetails && analyticsData.clickDetails.length > 0 ? (
                    <div className=" rounded-xl border border-[#2a2a2a] overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="">
                        <tr>
                          <th className="px-6 py-4 text-gray-400 font-medium">Link</th>
                          <th className="px-6 py-4 text-gray-400 font-medium">Clicks</th>
                        </tr>
                        </thead>
                        <tbody>
                        {analyticsData.clickDetails.map((click, index) => (
                            <tr key={`${click.label}-${index}`} className={index % 2 === 0 ? 'bg-[#E8FAD5]' : 'bg-[#E8FAD5]'}>
                              <td className="px-6 py-4 text-gray-600">{click.label}</td>
                              <td className="px-6 py-4 text-gray-600 font-semibold">{click.count}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <div className="p-8 rounded-xl text-center border-2 border-dashed border-gray-300">
                      <div className="text-4xl mb-4">📊</div>
                      <p className="text-gray-500 mb-2">No click data available yet</p>
                      <p className="text-gray-400 text-sm">Click data will appear here once users interact with your links</p>
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-10"></div>
      </div>
  );
};

// Componente principal con wrapper opcional
const Analytics = () => {
  const [biositeId, setBiositeId] = useState<string | undefined>();

  useEffect(() => {
    const cookieBiositeId = Cookies.get("biositeId");
    if (cookieBiositeId) {
      setBiositeId(cookieBiositeId);
      console.log('🔧 Analytics initialized with biositeId:', cookieBiositeId);
    }
  }, []);

  if (biositeId) {
    return (
        <AnalyticsWrapper biositeId={biositeId} isPublicView={false}>
          <AnalyticsContent />
        </AnalyticsWrapper>
    );
  }

  return <AnalyticsContent />;
};

export default Analytics;
