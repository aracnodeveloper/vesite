import { Globe, RefreshCw, Users2 } from "lucide-react";
import type { AdminPermissions } from "../hooks/useAdminPermissions";
import type { ViewMode } from "../hooks/useAdminBiositeList";

interface AdminHeaderProps {
  permissions: AdminPermissions;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  onRefresh: () => void;
  loading: boolean;
}

const getViewTitle = (permissions: AdminPermissions, viewMode: ViewMode) => {
  if (!permissions.canToggleView) {
    return permissions.hasFullAccess ? "Super Administración" : "Administración";
  }
  return viewMode === "all" ? "Super Administración - Vista Completa" : "Super Administración - Vista Hijos";
};

const getViewDescription = (permissions: AdminPermissions, viewMode: ViewMode) => {
  if (!permissions.canToggleView) {
    return permissions.hasFullAccess
      ? "Gestión completa de veSites, usuarios y analytics"
      : "Gestión de veSites hijos y analytics";
  }
  return viewMode === "all"
    ? "Vista completa de todos los biosites del sistema"
    : "Vista limitada a veSites bajo tu administración";
};

const toggleClass = (active: boolean) =>
  `flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
    active ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
  }`;

const AdminHeader = ({ permissions, viewMode, onViewModeChange, onRefresh, loading }: AdminHeaderProps) => (
  <div className="shadow rounded-lg p-6 mb-6">
    <div className="flex flex-wrap items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de {getViewTitle(permissions, viewMode)}</h1>
        <p className="text-gray-600">{getViewDescription(permissions, viewMode)}</p>
        {permissions.isAdmin && !permissions.canToggleView && (
          <p className="text-sm text-yellow-600 mt-1">Vista limitada: Solo veSites bajo tu administración</p>
        )}
      </div>
      <div className="flex space-x-2">
        {permissions.canToggleView && (
          <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
            <button onClick={() => onViewModeChange("all")} className={toggleClass(viewMode === "all")}>
              <Globe className="w-4 h-4" />
              <span>Todos</span>
            </button>
            <button onClick={() => onViewModeChange("children")} className={toggleClass(viewMode === "children")}>
              <Users2 className="w-4 h-4" />
              <span>Hijos</span>
            </button>
          </div>
        )}
        <button
          onClick={onRefresh}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>Actualizar</span>
        </button>
      </div>
    </div>
  </div>
);

export default AdminHeader;
