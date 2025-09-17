import React from "react";
import { Users } from "lucide-react";
import type {
  BiositeFull,
  AdminChildBiositesTableProps,
} from "../../../interfaces/AdminData.ts";
import BiositeTableRow from "./Biosite/BiositeTablerow.tsx";

export const AdminChildBiositesTable: React.FC<
    AdminChildBiositesTableProps
> = ({
       biosites,
       totalBiosites,
       loading,
       biositeLinks,
       loadingBiositeLinks,
       analyticsData,
       loadingAnalytics,
       showAnalytics,
       expandedBiosite,
       businessCards,
       loadingCards,
       toggleBiositeExpansion,
       toggleAnalytics,
       fetchBiositeAnalytics,
       setAnalyticsTimeRange,
       setShowAnalytics,
       setAnalyticsData,
       formatDate,
       parseVCardData,
       // Agregar la función fetchBusinessCard que faltaba
       fetchBusinessCard,
     }) => {
  if (loading) {
    return (
        <div className="text-center py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-gray-600">Cargando veSites hijos...</span>
          </div>
        </div>
    );
  }

  if (!biosites || biosites.length === 0) {
    return (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Users className="w-12 h-12 mx-auto mb-2" />
          </div>
          <p className="text-gray-500">No hay veSites hijos para mostrar</p>
          <p className="text-sm text-gray-400 mt-1">
            Los veSites hijos aparecerán aquí cuando se creen
          </p>
        </div>
    );
  }

  // Crear función toggleBiositeExpansion local que incluya fetchBusinessCard
  const handleToggleBiositeExpansion = (biositeId: string) => {
    const wasExpanded = expandedBiosite === biositeId;
    toggleBiositeExpansion(biositeId);

    if (!wasExpanded) {
      const biosite = biosites.find((b) => b.id === biositeId);
      if (biosite?.ownerId) {
        fetchBusinessCard(biosite.ownerId);
      }
    }
  };

  return (
      <div>
        <div className="mb-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  Vista de Administrador
                </h3>
                <p className="text-sm text-yellow-700">
                  Mostrando únicamente los veSites hijos bajo tu administración (
                  {totalBiosites} veSites)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                veSite Hijo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Slug
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Analytics
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Creado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {biosites.map((biosite: BiositeFull) => {
              return (
                  <BiositeTableRow
                      key={biosite.id}
                      biosite={biosite}
                      isExpanded={expandedBiosite === biosite.id}
                      businessCards={businessCards}
                      loadingCards={loadingCards}
                      analyticsData={analyticsData}
                      loadingAnalytics={loadingAnalytics}
                      showAnalytics={showAnalytics}
                      toggleAnalytics={toggleAnalytics}
                      formatDate={formatDate}
                      toggleBiositeExpansion={handleToggleBiositeExpansion}
                      setShowAnalytics={setShowAnalytics}
                      analyticsTimeRange={"last7"}
                      setAnalyticsTimeRange={setAnalyticsTimeRange}
                      setAnalyticsData={setAnalyticsData}
                      fetchBiositeAnalytics={fetchBiositeAnalytics}
                      parseVCardData={parseVCardData}
                      biositeLinks={biositeLinks}
                      loadingBiositeLinks={loadingBiositeLinks}
                  />
              );
            })}
            </tbody>
          </table>
        </div>
      </div>
  );
};