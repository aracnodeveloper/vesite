import { Edit2, X, Shield } from "lucide-react";
import { useState } from "react";
import Cookie from "js-cookie";
import AdminLinkToggle from "./AdminLinkToggle";

interface AdminLinkCardProps {
    id: string;
    title: string;
    url: string;
    image: string;
    onEdit: () => void;
    onRemove: () => void;
    isSubmitting: boolean;
    getSafeImageUrl: (imageUrl: string) => string;
    isSelected?: boolean;
    showAdminControls: boolean;
    userRole?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    onAdminToggle?: (linkId: string, isSelected: boolean) => Promise<void>;
    onAdminUpdate?: (linkId: string, linkData: any) => Promise<void>;
}

const AdminLinkCard = ({
                           id,
                           title,
                           url,
                           image,
                           onEdit,
                           onRemove,
                           isSubmitting,
                           getSafeImageUrl,
                           isSelected = false,
                           showAdminControls,
                           userRole,
                           onAdminToggle,
                           onAdminUpdate,
                       }: AdminLinkCardProps) => {
    const [isToggling, setIsToggling] = useState(false);

    // Get role from cookie if not provided as prop
    const getCurrentRole = (): 'USER' | 'ADMIN' | 'SUPER_ADMIN' => {
        if (userRole) return userRole;
        const role = Cookie.get('roleName');
        return role as 'USER' | 'ADMIN' | 'SUPER_ADMIN' || 'USER';
    };

    const currentRole = getCurrentRole();
    const isAdmin = currentRole === 'ADMIN' || currentRole === 'SUPER_ADMIN';

    const handleAdminToggle = async (value: boolean) => {
        if (!onAdminToggle || !isAdmin) return;

        try {
            setIsToggling(true);
            await onAdminToggle(id, value);
        } catch (error) {
            console.error('Error toggling admin link:', error);
        } finally {
            setIsToggling(false);
        }
    };

    const handleAdminUpdate = async () => {
        if (!onAdminUpdate || !isAdmin || !isSelected) return;

        try {
            const linkData = {
                icon: 'link', // You might want to make this dynamic
                url,
                label: title,
                link_type: 'regular',
                orderIndex: 0,
            };

            await onAdminUpdate(id, linkData);
        } catch (error) {
            console.error('Error updating admin link:', error);
        }
    };

    return (
        <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                isSelected
                    ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                    : 'bg-[#FAFFF6] border-gray-200 hover:bg-[#F0F9E8]'
            }`}>
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                        <img
                            src={getSafeImageUrl(image)}
                            alt={title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-black block truncate">{title}</span>
                            {isSelected && (
                                <Shield size={14} className="text-blue-600 flex-shrink-0" />
                            )}
                        </div>
                        <p className="text-xs text-gray-400 truncate max-w-48">{url}</p>
                        {isSelected && !isAdmin && (
                            <p className="text-xs text-blue-600 mt-1">
                                Enlace asignado por administrador - No editable
                            </p>
                        )}
                        {isSelected && isAdmin && (
                            <p className="text-xs text-green-600 mt-1">
                                Enlace aplicado a sitios hijos
                            </p>
                        )}
                    </div>
                </div>

                {showAdminControls && !isSelected && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                            onClick={onEdit}
                            className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
                            disabled={isSubmitting}
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={onRemove}
                            disabled={isSubmitting}
                            className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {showAdminControls && isSelected && isAdmin && (
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                            onClick={handleAdminUpdate}
                            className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
                            disabled={isSubmitting}
                            title="Actualizar en sitios hijos"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Admin Toggle - Only show for admins and existing links */}
            {isAdmin && showAdminControls && (
                <AdminLinkToggle
                    isSelected={isSelected}
                    onToggle={handleAdminToggle}
                    disabled={isToggling || isSubmitting}
                    label="Aplicar a sitios hijos"
                    description="Si está activado, este enlace aparecerá en todos los biosites de tus usuarios y no podrán editarlo ni eliminarlo."
                />
            )}
        </div>
    );
};

export default AdminLinkCard;