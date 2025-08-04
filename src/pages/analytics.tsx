import React, { useEffect, useState } from "react";
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

// Componente interno que usa el contexto de analytics
const AnalyticsContent = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biositeId, setBiositeId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Usar el contexto opcional de analytics
  const analyticsContext = useOptionalAnalytics();

  // Escuchar eventos de tracking
  useEffect(() => {
    const unsubscribeVisit = analyticsEventManager.onVisitTracked((biositeId) => {
      console.log('Visit tracked for biosite:', biositeId);
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 1500);
    });

    const unsubscribeClick = analyticsEventManager.onLinkClickTracked((linkId) => {
      console.log('Link click tracked for link:', linkId);
      setTimeout(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 1500);
    });

    return () => {
      unsubscribeVisit();
      unsubscribeClick();
    };
  }, []);

  // Obtener biositeId al cargar el componente
  useEffect(() => {
    const getBiositeId = () => {
      const cookieBiositeId = Cookies.get("biositeId");
      if (cookieBiositeId) {
        setBiositeId(cookieBiositeId);
        return;
      }

      const token = Cookies.get('accessToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('UserId del token:', payload.id);
        } catch (error) {
          console.error('Error decodificando token:', error);
        }
      }
    };

    getBiositeId();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const token = Cookies.get('accessToken');
        if (!token) {
          throw new Error('No se encontró el token de acceso');
        }

        let userId = Cookies.get("userId");
        if (!userId) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id;
            console.log('UserId obtenido del token:', userId);
          } catch (decodeError) {
            console.error('Error decodificando token:', decodeError);
          }
        }

        if (!userId) {
          throw new Error('No se pudo obtener el userId');
        }

        console.log('Fetching data for:', { userId, biositeId, refreshTrigger });

        // Solo hacer una llamada al endpoint de analytics que ya incluye clickDetails
        const analyticsResult = await getBiositeAnalytics(userId);

        console.log('Analytics result:', analyticsResult);

        if (typeof analyticsResult === 'string' && analyticsResult.includes('<!doctype html>')) {
          console.error('La API de analytics devolvió HTML en lugar de JSON');
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
          // El endpoint ya devuelve la estructura correcta con clickDetails
          if (!analyticsResult.dailyActivity || analyticsResult.dailyActivity.length === 0) {
            setAnalyticsData({
              dailyActivity: [{
                day: new Date().toISOString().split('T')[0],
                views: 0,
                clicks: 0
              }],
              clickDetails: analyticsResult.clickDetails || [],
              views: analyticsResult.views || 0,
              clicks: analyticsResult.clicks || 0
            });
          } else {
            setAnalyticsData({
              dailyActivity: analyticsResult.dailyActivity,
              clickDetails: analyticsResult.clickDetails || [],
              views: analyticsResult.views || 0,
              clicks: analyticsResult.clicks || 0
            });
          }
        } else {
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
        console.error("Error fetching analytics data:", error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    if (biositeId !== null) {
      fetchData();
    }
  }, [biositeId, refreshTrigger]);

  // Calcular métricas totales desde la respuesta del API
  const totalViews = analyticsData?.views || 0;
  const totalClicks = analyticsData?.clicks || 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  if (loading) return <div className="text-white p-6">Loading metrics...</div>;

  if (error) {
    return (
        <div className="text-white p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
            {analyticsContext && (
                <div className="mt-4 text-sm">
                  <p className="text-gray-400">Analytics Context Status:</p>
                  <p className="text-gray-300">Has tracked visit: {analyticsContext.hasTrackedVisit ? 'Yes' : 'No'}</p>
                  <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
                  <button
                      onClick={analyticsContext.resetTracking}
                      className="mt-2 px-3 py-1 bg-red-600 rounded text-white text-xs"
                  >
                    Reset Tracking
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
            <h3 className="text-yellow-400 font-semibold mb-2">Sin datos</h3>
            <p className="text-yellow-300">No se pudieron cargar los datos de analytics.</p>
            {analyticsContext && (
                <div className="mt-4 text-sm">
                  <p className="text-gray-400">Analytics Context Status:</p>
                  <p className="text-gray-300">Has tracked visit: {analyticsContext.hasTrackedVisit ? 'Yes' : 'No'}</p>
                  <p className="text-gray-300">Refresh trigger: {refreshTrigger}</p>
                </div>
            )}
          </div>
        </div>
    );
  }

  return (
      <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
        <div className="max-w-7xl mx-auto">
          {/* Debug info */}
          {analyticsContext && (
              <div className="mb-4 p-2 bg-blue-900/20 border border-blue-500 rounded text-xs">
                <p className="text-blue-300">
                  Analytics Status: Visit tracked: {analyticsContext.hasTrackedVisit ? 'Yes' : 'No'} |
                  BiositeId: {biositeId || 'Not set'} |
                  Refresh trigger: {refreshTrigger} |
                  Total views: {totalViews} |
                  Total clicks: {totalClicks}
                </p>
              </div>
          )}

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
                      <p className="text-xs text-gray-500">Clics</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card de Clics por enlace para móvil */}
              <div className="bg-[#1C1C1C] rounded-2xl p-6">
                <h2 className="text-lg font-medium text-white mb-4">Clics por enlace</h2>
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
                      <p className="text-gray-400">No hay datos de clics disponibles.</p>
                    </div>
                )}
              </div>
            </div>
          </div>

          {/* VISTA DESKTOP */}
          <div className="hidden lg:block">
            <h1 className="absolute left-50 top-10 text-lg text-gray-600 font-semibold mb-2 text-start">Estadísticas</h1>

            <div className="relative flex items-center justify-center mb-16">
              <div
                  className="absolute transform rounded-full flex flex-col items-center justify-center"
                  style={{height:"600px", width:"600px"}}
              >
                <svg width="858" height="858" viewBox="0 0 858 858" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g filter="url(#filter0_d_2019_354)">
                    <circle cx="429" cy="425" r="416" fill="white"/>
                  </g>
                  <defs>
                    <filter id="filter0_d_2019_354" x="0" y="0" width="858" height="858" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
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

              <div className="absolute left-20 top-1/3 transform -translate-y-1/2 w-44 h-44 bg-[#E8FAD5] rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">VISTAS</div>
                <div className="text-4xl font-bold text-black">{totalViews}</div>
              </div>

              <div className="z-10 overflow-y-hidden">
                <PhonePreview><LivePreviewContent/></PhonePreview>
              </div>

              <div className="absolute right-20 top-82 w-44 h-44 bg-[#E8FAD5] rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">CLICS</div>
                <div className="text-2xl font-bold text-black">{totalClicks}</div>
              </div>

              <div className="absolute right-40 bottom-30 w-32 h-32 bg-[#E8FAD5] rounded-full flex flex-col items-center justify-center">
                <div className="text-xs text-black mb-1">CTR</div>
                <div className="text-2xl font-bold text-black">{ctr}%</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <div className="bg-white rounded-3xl p-10">
                <h2 className="text-xl text-gray-600 font-semibold mb-6">Actividad diaria</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {analyticsData.dailyActivity.map((activity, index) => (
                      <div key={index} className="p-6 rounded-xl">
                        <p className="text-sm text-gray-400 mb-2">Día: {activity.day}</p>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-lg font-semibold text-gray-400">{activity.views}</p>
                            <p className="text-xs text-gray-500">Vistas</p>
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-400">{activity.clicks}</p>
                            <p className="text-xs text-gray-500">Clics</p>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-3xl p-10">
                <h2 className="text-xl text-gray-600 font-semibold mb-6">Clics por enlace</h2>
                {analyticsData.clickDetails && analyticsData.clickDetails.length > 0 ? (
                    <div className="bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-[#2a2a2a]">
                        <tr>
                          <th className="px-6 py-4 text-gray-400 font-medium">Etiqueta</th>
                          <th className="px-6 py-4 text-gray-400 font-medium">Clics</th>
                        </tr>
                        </thead>
                        <tbody>
                        {analyticsData.clickDetails.map((click, index) => (
                            <tr key={`${click.label}-${index}`} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'}>
                              <td className="px-6 py-4 text-white">{click.label}</td>
                              <td className="px-6 py-4 text-white font-semibold">{click.count}</td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                ) : (
                    <div className="p-8 rounded-xl text-center">
                      <p className="text-gray-400">No hay datos de clics disponibles.</p>
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