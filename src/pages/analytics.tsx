import { useEffect, useState } from "react";
import { getBiositeAnalytics, getClicksGroupedByLabel } from "../service/apiService";
import Cookies from 'js-cookie';

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
    <div className="min-h-screen text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-semibold mb-2 text-center">Analytics</h1>
        <p className="text-center text-gray-500 text-sm mb-10">
          Visualize engagement with your Bio Site
        </p>

        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Daily Activity</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {analyticsData.dailyActivity.map((activity, index) => (
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
          {clicksData.length > 0 ? (
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
          ) : (
            <div className="bg-[#1e1e1e] p-6 rounded-xl border border-[#2a2a2a]">
              <p className="text-gray-400">No click data available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;