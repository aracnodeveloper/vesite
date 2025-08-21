import React from 'react';
import Pagination from './Pagination.tsx';
import {
    Users,
    Globe,
    Link2 as LinkIcon,
    Share2,
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Calendar,
    UserCheck,
    UserX
} from 'lucide-react';

// Types
interface LinkData {
    id: string;
    label: string;
    url: string;
    icon?: string;
    isActive: boolean;
    orderIndex: number;
    description?: string;
    image?: string;
    color?: string;
    biositeId?: string;
    createdAt?: string;
    updatedAt?: string;
}

interface User {
    id: string;
    email: string;
    cedula?: string;
    name?: string;
    description?: string;
    avatarUrl?: string;
    site?: string;
    phone?: string;
    isActive?: boolean;
    role?: string;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
    biosites?: BiositeFull[];
}

interface BiositeFull {
    id: string;
    ownerId: string;
    title: string | null;
    slug: string | null;
    themeId: string | null;
    colors: string | any;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    links?: LinkData[];
    owner?: User;
}

interface UsersTableProps {
    pagination: any;
    expandedUser: string | null;
    toggleUserExpansion: (userId: string) => void;
    categorizeLinks: (links: LinkData[]) => {
        total: number;
        social: number;
        regular: number;
        whatsApp: number;
        apps: number;
        embed: number;
    };
    formatDate: (dateString?: string) => string;
}

export const UsersTable: React.FC<UsersTableProps> = ({
                                                          pagination,
                                                          expandedUser,
                                                          toggleUserExpansion,
                                                          categorizeLinks,
                                                          formatDate
                                                      }) => {
    if (!pagination.data || pagination.data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hay usuarios para mostrar</p>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Usuario
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rol
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Padre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Biosites
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
                    {pagination.data.map((user: User) => {
                        const isExpanded = expandedUser === user.id;
                        const biositeCount = user.biosites?.length || 0;

                        return (
                            <React.Fragment key={user.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Users className="w-5 h-5 text-gray-400 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {user.name || user.email}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                                {user.cedula && (
                                                    <div className="text-xs text-gray-400">CI: {user.cedula}</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                                                user.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                        }`}>
                                            {user.role || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            user.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.isActive ? (
                                                <>
                                                    <UserCheck className="w-3 h-3 mr-1" />
                                                    Activo
                                                </>
                                            ) : (
                                                <>
                                                    <UserX className="w-3 h-3 mr-1" />
                                                    Inactivo
                                                </>
                                            )}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {user.parentId ? (
                                            <span className="text-blue-600">Tiene padre</span>
                                        ) : (
                                            <span className="text-gray-400">Root</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Globe className="w-4 h-4 text-blue-500 mr-1" />
                                            <span className="text-sm font-semibold text-gray-900">
                                                {biositeCount}
                                            </span>
                                            <span className="text-xs text-gray-500 ml-1">biosites</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(user.createdAt)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {biositeCount > 0 && (
                                            <button
                                                onClick={() => toggleUserExpansion(user.id)}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                            >
                                                {isExpanded ? (
                                                    <>
                                                        <ChevronUp className="w-4 h-4 mr-1" />
                                                        Ocultar
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="w-4 h-4 mr-1" />
                                                        Ver biosites
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </td>
                                </tr>

                                {isExpanded && biositeCount > 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Biosites del Usuario ({biositeCount})
                                                    </h4>
                                                    <div className="max-h-80 overflow-y-auto space-y-2">
                                                        {user.biosites?.map((biosite) => {
                                                            const linkStats = categorizeLinks(biosite.links || []);

                                                            return (
                                                                <div key={biosite.id} className="bg-white p-4 rounded border">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex items-start space-x-3 flex-1">
                                                                            <Globe className="w-5 h-5 text-blue-500 mt-1" />
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-sm font-medium text-gray-900">
                                                                                    {biosite.title || 'Sin título'}
                                                                                </p>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {biosite.slug ? `/${biosite.slug}` : 'Sin slug'}
                                                                                </p>
                                                                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                                    <div className="flex items-center">
                                                                                        <LinkIcon className="w-3 h-3 mr-1" />
                                                                                        {linkStats.total} enlaces
                                                                                    </div>
                                                                                    {linkStats.social > 0 && (
                                                                                        <div className="flex items-center">
                                                                                            <Share2 className="w-3 h-3 mr-1" />
                                                                                            {linkStats.social} social
                                                                                        </div>
                                                                                    )}
                                                                                    {linkStats.whatsApp > 0 && (
                                                                                        <div className="flex items-center text-green-600">
                                                                                            <MessageCircle className="w-3 h-3 mr-1" />
                                                                                            {linkStats.whatsApp} WhatsApp
                                                                                        </div>
                                                                                    )}
                                                                                    <div className="flex items-center">
                                                                                        <Calendar className="w-3 h-3 mr-1" />
                                                                                        {formatDate(biosite.createdAt)}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex flex-col items-end space-y-1 ml-4">
                                                                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                                                                biosite.isActive
                                                                                    ? 'bg-green-100 text-green-700'
                                                                                    : 'bg-red-100 text-red-700'
                                                                            }`}>
                                                                                {biosite.isActive ? 'Activo' : 'Inactivo'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    </tbody>
                </table>
            </div>

            <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                loading={pagination.loading}
                canGoNext={pagination.canGoNext}
                canGoPrev={pagination.canGoPrev}
                visiblePages={pagination.visiblePages}
                pageInfo={pagination.pageInfo}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
                onFirst={pagination.goToFirstPage}
                onLast={pagination.goToLastPage}
                onNext={pagination.nextPage}
                onPrev={pagination.prevPage}
            />
        </div>
    );
};