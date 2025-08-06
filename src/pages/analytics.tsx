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
  const [isDownloading, setIsDownloading] = useState(false);

  const analyticsContext = useOptionalAnalytics();

  const triggerRefresh = useCallback(() => {
    const now = new Date();
    setLastRefresh(now);

    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 1000);
  }, []);

  // Función para compartir métricas
  const handleShare = useCallback(async () => {
    if (!analyticsData) return;

    const shareData = {
      title: 'Métricas de mi Biosite',
      text: `📊 Mis estadísticas:\n🔍 ${analyticsData.views} vistas\n👆 ${analyticsData.clicks} clics\n📈 ${analyticsData.views > 0 ? Math.round((analyticsData.clicks / analyticsData.views) * 100) : 0}% CTR`,

    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(
            `📊 Métricas de mi Biosite:\n🔍 ${analyticsData.views} vistas\n👆 ${analyticsData.clicks} clics\n📈 ${analyticsData.views > 0 ? Math.round((analyticsData.clicks / analyticsData.views) * 100) : 0}% CTR\n\n${window.location.href}`
        );

        // Mostrar notificación temporal
        const notification = document.createElement('div');
        notification.textContent = '✅ Métricas copiadas al portapapeles';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #98C022;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 1000;
          font-size: 14px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, [analyticsData]);

  // Función para generar y descargar PDF
  const handleDownloadPDF = useCallback(async () => {
    if (!analyticsData || isDownloading) return;

    setIsDownloading(true);

    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Reporte de Métricas - Biosite</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #98C022; padding-bottom: 20px; }
            .header h1 { color: #98C022; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .metrics-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
            .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; border: 1px solid #e9ecef; }
            .metric-value { font-size: 32px; font-weight: bold; color: #98C022; margin: 10px 0; }
            .metric-label { color: #666; font-size: 14px; text-transform: uppercase; }
            .section { margin: 40px 0; }
            .section h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f8f9fa; font-weight: bold; }
            .daily-activity { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; }
            .activity-card { background: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef; }
            .activity-date { font-weight: bold; margin-bottom: 10px; color: #98C022; }
            .activity-stats { display: flex; justify-content: space-between; }
            .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Reporte de Métricas</h1>
            <p>Biosite Analytics Dashboard</p>
            <p>Generado el ${new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })}</p>
          </div>

          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-value">${analyticsData.views}</div>
              <div class="metric-label">Total Vistas</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analyticsData.clicks}</div>
              <div class="metric-label">Total Clicks</div>
            </div>
            <div class="metric-card">
              <div class="metric-value">${analyticsData.views > 0 ? Math.round((analyticsData.clicks / analyticsData.views) * 100) : 0}%</div>
              <div class="metric-label">CTR (Click Through Rate)</div>
            </div>
          </div>

          <div class="section">
            <h2>📅 Actividad Diaria</h2>
            <div class="daily-activity">
              ${analyticsData.dailyActivity.map(activity => `
                <div class="activity-card">
                  <div class="activity-date">${new Date(activity.day).toLocaleDateString('es-ES')}</div>
                  <div class="activity-stats">
                    <span>👁️ ${activity.views} vistas</span>
                    <span>👆 ${activity.clicks} clicks</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          ${analyticsData.clickDetails.length > 0 ? `
          <div class="section">
            <h2>🔗 Clicks por Link</h2>
            <table>
              <thead>
                <tr>
                  <th>Link</th>
                  <th style="text-align: right;">Número de Clicks</th>
                </tr>
              </thead>
              <tbody>
                ${analyticsData.clickDetails.map(click => `
                  <tr>
                    <td>${click.label}</td>
                    <td style="text-align: right; font-weight: bold;">${click.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : '<div class="section"><h2>🔗 Clicks por Link</h2><p>No hay datos de clicks disponibles aún.</p></div>'}

          <div class="footer">
            <p>Este reporte fue generado automáticamente por Biosite Analytics</p>
            <p>Para más información, visita tu dashboard de analytics</p>
          </div>
        </body>
        </html>
      `;

      // Crear y descargar el archivo HTML (que se puede imprimir como PDF)
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `biosite-metricas-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mostrar instrucciones para PDF
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="max-width: 300px;">
          <strong>📄 Archivo descargado</strong><br>
          <small>Abre el archivo HTML y usa Ctrl+P (Cmd+P en Mac) para guardar como PDF</small>
        </div>
      `;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #98C022;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 320px;
      `;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 5000);

    } catch (error) {
      console.error('Error generating PDF:', error);

      const errorNotification = document.createElement('div');
      errorNotification.textContent = '❌ Error al generar el reporte';
      errorNotification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 1000;
        font-size: 14px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      `;
      document.body.appendChild(errorNotification);
      setTimeout(() => errorNotification.remove(), 3000);
    } finally {
      setIsDownloading(false);
    }
  }, [analyticsData, isDownloading]);

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
          {/* Header con botones de acción */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-lg text-gray-600 font-semibold">Estadísticas</h1>
            <div className="flex gap-2">
              {/* Botón de compartir */}
              <button
                  onClick={handleShare}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer"
                  title="Compartir métricas"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
                Compartir
              </button>

              {/* Botón de descarga PDF */}
              <button
                  onClick={handleDownloadPDF}
                  disabled={isDownloading}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors flex items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Descargar reporte PDF"
              >
                {isDownloading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                )}
                {isDownloading ? 'Generando...' : 'PDF'}
              </button>

              {/* Botón de actualizar */}
              <button
                  onClick={handleManualRefresh}
                  className="px-3 py-1 bg-[#98C022] hover:bg-[#86A81E] rounded text-white text-sm transition-colors flex items-center cursor-pointer"
                  disabled={loading}
                  title="Actualizar datos"
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