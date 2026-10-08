import { Globe, LinkIcon, Users } from "lucide-react";

interface AdminStatsProps {
  showAllBiosites: boolean;
  biositeCount: number;
  totalLinks: number;
  hideLinks: boolean;
}

/** Tarjetas de resumen del panel: veSites, enlaces y usuarios. */
const AdminStats = ({ showAllBiosites, biositeCount, totalLinks, hideLinks }: AdminStatsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center">
        <Globe className="w-8 h-8 text-green-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{showAllBiosites ? "Total veSites" : "veSites Hijos"}</p>
          <p className="text-2xl font-semibold text-gray-900">{biositeCount}</p>
          <p className="text-xs text-gray-400">
            {biositeCount}
            {" "}activos
          </p>
        </div>
      </div>
    </div>

    <div className={`bg-white p-6 rounded-lg shadow border ${hideLinks ? "hidden" : ""}`}>
      <div className="flex items-center">
        <LinkIcon className="w-8 h-8 text-purple-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Enlaces</p>
          <p className="text-2xl font-semibold text-gray-900">{totalLinks}</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow border">
      <div className="flex items-center">
        <Users className="w-8 h-8 text-blue-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{showAllBiosites ? "Usuarios Únicos" : "Usuarios Hijos"}</p>
          <p className="text-2xl font-semibold text-gray-900">{biositeCount}</p>
        </div>
      </div>
    </div>
  </div>
);

export default AdminStats;
