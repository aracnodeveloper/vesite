import React, { useEffect, useState } from "react";
import { getBiositeAnalytics, getClicksGroupedByLabel } from "../service/apiService";
import Cookies from 'js-cookie';
import LivePreviewContent from "../components/Preview/LivePreviewContent.tsx";
import PhonePreview from "../components/Preview/phonePreview.tsx";

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
  const [error, setError] = useState<string | null>(null);

  // Calcular métricas totales
  const totalViews = analyticsData?.dailyActivity.reduce((sum, activity) => sum + activity.views, 0) || 0;
  const totalClicks = analyticsData?.dailyActivity.reduce((sum, activity) => sum + activity.clicks, 0) || 0;
  const ctr = totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        // Obtener la cookie del token
        const token = Cookies.get('accessToken');

        if (!token) {
          throw new Error('No se encontró el token de acceso');
        }

        // Intentar obtener userId y biositeId de las cookies
        let userId = Cookies.get("userId");
        const biositeId = Cookies.get("biositeId");

        // Si no están en cookies, intentar decodificar el token
        if (!userId) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.id; // Usar el id del token como userId
            console.log('UserId obtenido del token:', userId);
          } catch (decodeError) {
            console.error('Error decodificando token:', decodeError);
          }
        }

        if (!userId) {
          throw new Error('No se pudo obtener el userId');
        }

        if (!biositeId) {
          console.warn('biositeId no encontrado en cookies');
          // Aquí podrías hacer una llamada adicional para obtener el biositeId basado en el userId
          // o manejarlo de otra manera según tu lógica de aplicación
        }

        console.log('Datos para API:', { userId, biositeId });

        // Hacer las llamadas a la API
        console.log('Iniciando llamadas a la API...');

        const [analytics, clicks] = await Promise.allSettled([
          getBiositeAnalytics(userId),
          biositeId ? getClicksGroupedByLabel(biositeId) : Promise.resolve([])
        ]);

        console.log('Resultado de analytics:', analytics);
        console.log('Resultado de clicks:', clicks);

        // Manejar resultado de analytics
        if (analytics.status === 'fulfilled') {
          console.log('Analytics data recibida:', analytics.value);

          // Verificar si la respuesta es HTML (error) o datos válidos
          if (typeof analytics.value === 'string' && analytics.value.includes('<!doctype html>')) {
            console.error('La API de analytics devolvió HTML en lugar de JSON - posible error 404 o de autenticación');
            // Crear datos por defecto
            setAnalyticsData({
              dailyActivity: [
                {
                  day: new Date().toISOString().split('T')[0],
                  views: 0,
                  clicks: 0
                }
              ]
            });
          } else if (analytics.value && typeof analytics.value === 'object') {
            // Si hay datos válidos pero sin dailyActivity, crear estructura por defecto
            if (!analytics.value.dailyActivity || analytics.value.dailyActivity.length === 0) {
              setAnalyticsData({
                dailyActivity: [
                  {
                    day: new Date().toISOString().split('T')[0],
                    views: 0,
                    clicks: 0
                  }
                ]
              });
            } else {
              setAnalyticsData(analytics.value);
            }
          } else {
            // Crear datos por defecto si no hay datos válidos
            setAnalyticsData({
              dailyActivity: [
                {
                  day: new Date().toISOString().split('T')[0],
                  views: 0,
                  clicks: 0
                }
              ]
            });
          }
        } else {
          console.error('Error fetching analytics:', analytics.reason);
          // Crear datos por defecto en caso de error
          setAnalyticsData({
            dailyActivity: [
              {
                day: new Date().toISOString().split('T')[0],
                views: 0,
                clicks: 0
              }
            ]
          });
        }

        // Manejar resultado de clicks
        if (clicks.status === 'fulfilled') {
          console.log('Clicks data recibida:', clicks.value);

          // Verificar si la respuesta es HTML (error) o datos válidos
          if (typeof clicks.value === 'string' && clicks.value.includes('<!doctype html>')) {
            console.error('La API de clicks devolvió HTML en lugar de JSON - posible error 404 o de autenticación');
            setClicksData([]);
          } else if (Array.isArray(clicks.value)) {
            setClicksData(clicks.value);
          } else {
            setClicksData([]);
          }
        } else {
          console.error('Error fetching clicks:', clicks.reason);
          setClicksData([]);
        }

      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-6">Loading metrics...</div>;

  if (error) {
    return (
        <div className="text-white p-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <h3 className="text-red-400 font-semibold mb-2">Error</h3>
            <p className="text-red-300">{error}</p>
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
          </div>
        </div>
    );
  }

  return (
      <div className="h-full  text-white px-6 py-16 ">
        <div className="max-w-7xl mx-auto">
          <h1 className="absolute left-50 top-10 text-3xl text-gray-600 font-semibold mb-2 text-start">Analytics</h1>

          <div
              className="absolute left-6/17 top-1/3 transform   bg-gray-800 rounded-full flex flex-col items-center justify-center border border-gray-700"
              style={{height:"600px", width:"600px"}}
          >

          </div>

          <div className="relative flex items-center justify-center mb-16">
            <div
                className="absolute left-20 top-1/3 transform -translate-y-1/2 w-44 h-44 bg-gray-800 rounded-full flex flex-col items-center justify-center border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">VIEWS</div>
              <div className="text-4xl font-bold text-white">{totalViews}</div>
            </div>

            {/* Phone Preview - Centro */}
            <div className=" z-10 overflow-y-hidden">
              <PhonePreview>
                <LivePreviewContent/>
              </PhonePreview>
            </div>

            {/* Círculo de Clicks - Derecha superior */}
            <div
                className="absolute right-20 top-1/2 w-44 h-44 bg-gray-800 rounded-full flex flex-col items-center justify-center border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">CLICKS</div>
              <div className="text-2xl font-bold text-white">{totalClicks}</div>
            </div>

            {/* Círculo de CTR - Derecha inferior */}
            <div
                className="absolute right-40 bottom-30 w-32 h-32 bg-gray-800 rounded-full flex flex-col items-center justify-center border border-gray-700">
              <div className="text-xs text-gray-400 mb-1">CTR</div>
              <div className="text-2xl font-bold text-white">{ctr}%</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-5">
            {/* Daily Activity */}
            <div className="mb-10 bg-black rounded-3xl p-10">
              <h2 className="text-xl text-gray-400 font-semibold mb-6">Daily Activity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {analyticsData.dailyActivity.map((activity, index) => (
                    <div key={index} className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a]">
                      <p className="text-sm text-gray-400 mb-2">Day: {activity.day}</p>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-lg font-semibold text-white">{activity.views}</p>
                          <p className="text-xs text-gray-500">Views</p>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-white">{activity.clicks}</p>
                          <p className="text-xs text-gray-500">Clicks</p>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>

            {/* Clicks by Link */}
            <div className="mb-10 bg-black rounded-3xl p-10">
              <h2 className="text-xl text-gray-400 font-semibold mb-6">Clicks by Link</h2>
              {clicksData.length > 0 ? (
                  <div className="bg-[#1e1e1e] rounded-xl border border-[#2a2a2a] overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#2a2a2a]">
                      <tr>
                        <th className="px-6 py-4 text-gray-400 font-medium">Label</th>
                        <th className="px-6 py-4 text-gray-400 font-medium">Clicks</th>
                      </tr>
                      </thead>
                      <tbody>
                      {clicksData.map((click, index) => (
                          <tr key={click.label} className={index % 2 === 0 ? 'bg-[#1e1e1e]' : 'bg-[#252525]'}>
                            <td className="px-6 py-4 text-white">{click.label}</td>
                            <td className="px-6 py-4 text-white font-semibold">{click.clicks}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              ) : (
                  <div className="bg-[#1e1e1e] p-8 rounded-xl border border-[#2a2a2a] text-center">
                    <p className="text-gray-400">No click data available.</p>
                  </div>
              )}
            </div>
          </div>
        </div>
        <div className="h-10"></div>
      </div>
  );
};

export default Analytics;
