import React, { useState, useEffect, useCallback } from 'react';
import { useFetchBiosite } from '../hooks/useFetchBiosite';
import { usePagination } from '../hooks/usePagination';
//import Pagination from '../components/global/Super_admin/Pagination.tsx';
import {
    Users,
    Globe,
    RefreshCw,
    BarChart3,
    LinkIcon
} from 'lucide-react';
import Cookie from "js-cookie";
import type {BusinessCard} from "../types/V-Card.ts";
import {businessCardService} from "../service/VCardService.ts";
import { getBiositeAnalytics } from '../service/apiService';
import apiService from '../service/apiService';
import { BiositesTable } from '../components/global/Super_admin/BiositesTable.tsx';

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
    businessCard?: BusinessCard;
}

interface AnalyticsData {
    views: number;
    clicks: number;
    dailyActivity: Array<{
        day: string;
        views: number;
        clicks: number;
    }>;
    clickDetails: Array<{
        label: string;
        count: number;
    }>;
}

type TimeRange = 'last7' | 'last30' | 'lastYear';

const AdminPanel: React.FC = () => {
    const role = Cookie.get('roleName');
    const userId = Cookie.get('userId');
    const hasAdminAccess = role === 'SUPER_ADMIN' || userId === '92784deb-3a8e-42a0-91ee-cd64fb3726f5';
    const { fetchAllBiosites } = useFetchBiosite();
    const [businessCards, setBusinessCards] = useState<{[key: string]: BusinessCard}>({});
    const [loadingCards, setLoadingCards] = useState<{[key: string]: boolean}>({});

    const [biositeLinks, setBiositeLinks] = useState<{[key: string]: LinkData[]}>({});
    const [loadingBiositeLinks, setLoadingBiositeLinks] = useState<{[key: string]: boolean}>({});

    const [analyticsData, setAnalyticsData] = useState<{[key: string]: AnalyticsData}>({});
    const [loadingAnalytics, setLoadingAnalytics] = useState<{[key: string]: boolean}>({});
    const [analyticsTimeRange, setAnalyticsTimeRange] = useState<TimeRange>('last7');
    const [showAnalytics, setShowAnalytics] = useState<{[key: string]: boolean}>({});

    const [error, setError] = useState<string | null>(null);
    const [expandedBiosite, setExpandedBiosite] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<'biosites' | 'users'>('biosites');
    const [initialized, setInitialized] = useState(false);

    const biositesPagination = usePagination<BiositeFull>({
        initialPage: 1,
        initialSize: 10
    });

    const usersPagination = usePagination<User>({
        initialPage: 1,
        initialSize: 10
    });

    const fetchBiositeLinks = async (biositeId: string) => {
        if (biositeLinks[biositeId] || loadingBiositeLinks[biositeId]) return;

        setLoadingBiositeLinks(prev => ({ ...prev, [biositeId]: true }));
        try {
            const links = await apiService.getAll<LinkData[]>(`/links/biosite/${biositeId}`);
            setBiositeLinks(prev => ({ ...prev, [biositeId]: links || [] }));
            console.log(`Links loaded for biosite ${biositeId}:`, links);
        } catch (error) {
            console.error(`Error fetching links for biosite ${biositeId}:`, error);
            setBiositeLinks(prev => ({ ...prev, [biositeId]: [] }));
        } finally {
            setLoadingBiositeLinks(prev => ({ ...prev, [biositeId]: false }));
        }
    };

    const fetchBiositeAnalytics = async (biositeId: string, ownerId: string) => {
        if (analyticsData[biositeId] || loadingAnalytics[biositeId]) return;

        setLoadingAnalytics(prev => ({ ...prev, [biositeId]: true }));

        try {
            const response = await getBiositeAnalytics(ownerId, analyticsTimeRange);

            let processedData: AnalyticsData;

            if (typeof response === 'string' && response.includes('<!doctype html>')) {
                processedData = {
                    views: 0,
                    clicks: 0,
                    dailyActivity: [{
                        day: new Date().toISOString().split('T')[0],
                        views: 0,
                        clicks: 0
                    }],
                    clickDetails: []
                };
            } else if (response && typeof response === 'object') {
                processedData = {
                    views: response.views || 0,
                    clicks: response.clicks || 0,
                    dailyActivity: response.dailyActivity && response.dailyActivity.length > 0
                        ? response.dailyActivity
                        : [{
                            day: new Date().toISOString().split('T')[0],
                            views: response.views || 0,
                            clicks: response.clicks || 0
                        }],
                    clickDetails: response.clickDetails || []
                };
            } else {
                processedData = {
                    views: 0,
                    clicks: 0,
                    dailyActivity: [{
                        day: new Date().toISOString().split('T')[0],
                        views: 0,
                        clicks: 0
                    }],
                    clickDetails: []
                };
            }

            setAnalyticsData(prev => ({ ...prev, [biositeId]: processedData }));
        } catch (error) {
            console.error(`Error fetching analytics for biosite ${biositeId}:`, error);
            setAnalyticsData(prev => ({ ...prev, [biositeId]: {
                    views: 0,
                    clicks: 0,
                    dailyActivity: [],
                    clickDetails: []
                }}));
        } finally {
            setLoadingAnalytics(prev => ({ ...prev, [biositeId]: false }));
        }
    };

    const toggleAnalytics = (biositeId: string, ownerId: string) => {
        const isCurrentlyShowing = showAnalytics[biositeId];
        setShowAnalytics(prev => ({ ...prev, [biositeId]: !isCurrentlyShowing }));

        if (!isCurrentlyShowing && !analyticsData[biositeId]) {
            fetchBiositeAnalytics(biositeId, ownerId);
        }
    };

    const categorizeLinks = useCallback((links: LinkData[]) => {
        const categories = {
            total: links?.length || 0,
            social: 0,
            regular: 0,
            whatsApp: 0,
            apps: 0,
            embed: 0
        };

        if (!links || links.length === 0) {
            return categories;
        }

        const socialPlatforms = ['instagram', 'tiktok', 'twitter', 'x', 'youtube', 'facebook', 'twitch', 'linkedin', 'snapchat', 'threads', 'gmail', 'pinterest', 'spotify', 'discord', 'tumblr', 'telegram', 'amazon', 'onlyfans'];
        const appStores = ['appstore', 'googleplay', 'apps.apple.com', 'play.google.com'];
        const embedKeywords = ['music', 'video', 'embed', 'player', 'post', 'publicacion'];

        links.forEach(link => {
            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';
            const iconLower = link.icon?.toLowerCase() || '';

            if (urlLower.includes('api.whatsapp.com') || iconLower === 'whatsapp') {
                categories.whatsApp++;
            } else if (appStores.some(store => labelLower.includes(store) || urlLower.includes(store))) {
                categories.apps++;
            } else if (embedKeywords.some(keyword => labelLower.includes(keyword) || urlLower.includes(keyword))) {
                categories.embed++;
            } else if (socialPlatforms.some(platform => labelLower.includes(platform) || urlLower.includes(platform) || iconLower.includes(platform))) {
                categories.social++;
            } else {
                categories.regular++;
            }
        });

        return categories;
    }, []);

    const loadBiosites = useCallback(async () => {
        try {
            biositesPagination.setLoading(true);
            biositesPagination.setError(null);

            const params = biositesPagination.getPaginationParams();
            const response = await fetchAllBiosites(params);

            console.log('Biosites loaded:', response);
            biositesPagination.setPaginatedData(response);
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar biosites";
            biositesPagination.setError(errorMessage);
            setError(errorMessage);
        } finally {
            biositesPagination.setLoading(false);
        }
    }, [fetchAllBiosites, biositesPagination]);



    const handleRefreshData = useCallback(async () => {
        if (selectedView === 'biosites') {
            await loadBiosites();
        }
    }, [selectedView, loadBiosites]);

    useEffect(() => {
        const initializeData = async () => {
            if (!hasAdminAccess  || !userId || initialized) return;

            try {
                if (selectedView === 'biosites') {
                    await loadBiosites();
                }
                setInitialized(true);
            } catch (error) {
                console.error('Error initializing data:', error);
                setError('Error al inicializar datos');
            }
        };

        initializeData();
    }, [role, userId, initialized, selectedView]);

    useEffect(() => {
        if (initialized && selectedView === 'biosites') {
            loadBiosites();
        }
    }, [biositesPagination.currentPage, biositesPagination.pageSize, initialized, selectedView]);


    const toggleBiositeExpansion = (biositeId: string) => {
        const wasExpanded = expandedBiosite === biositeId;
        setExpandedBiosite(wasExpanded ? null : biositeId);

        if (!wasExpanded) {
            const biosite = biositesPagination.data.find(b => b.id === biositeId);
            if (biosite?.ownerId) {
                fetchBusinessCard(biosite.ownerId);
            }
            fetchBiositeLinks(biositeId);
        }
    };


    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const fetchBusinessCard = async (ownerId: string) => {
        if (businessCards[ownerId] || loadingCards[ownerId]) return;

        setLoadingCards(prev => ({ ...prev, [ownerId]: true }));
        try {
            const card = await businessCardService.regenerateQRCode(ownerId);
            setBusinessCards(prev => ({ ...prev, [ownerId]: card }));
        } catch (error) {
            console.error(`Error fetching business card for user ${ownerId}:`, error);
            setBusinessCards(prev => ({ ...prev, [ownerId]: null }));
        } finally {
            setLoadingCards(prev => ({ ...prev, [ownerId]: false }));
        }
    };

    const parseVCardData = (businessCard: BusinessCard | null) => {
        if (!businessCard?.data) return null;

        try {
            return typeof businessCard.data === 'string'
                ? JSON.parse(businessCard.data)
                : businessCard.data;
        } catch (error) {
            console.error('Error parsing VCard data:', error);
            return null;
        }
    };

    const getCurrentPagination = () => {
        return selectedView === 'biosites' ? biositesPagination : usersPagination;
    };

    if (!hasAdminAccess) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Acceso Denegado</h2>
                    <p className="text-gray-500">Solo los usuarios SUPER_ADMIN pueden acceder a este panel.</p>
                </div>
            </div>
        );
    }

    const currentPagination = getCurrentPagination();

    if (currentPagination.loading && !initialized) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-600">
                        Cargando {selectedView === 'biosites' ? 'biosites' : 'usuarios'}...
                    </p>
                </div>
            </div>
        );
    }

    if (error && !initialized) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                        <div className="mt-3">
                            <button
                                onClick={handleRefreshData}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                                Reintentar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    const totalLinks = Object.values(biositeLinks).reduce((sum, links) => sum + (links?.length || 0), 0);

    return (
        <div className="h-full text-white px-4 py-2 lg:px-6 lg:py-16">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-gray-600">Gestión completa de biosites, usuarios y analytics</p>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setSelectedView('biosites')}
                            className={`px-4 py-2 rounded-md transition-colors flex items-center space-x-2 ${
                                selectedView === 'biosites'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            <Globe className="w-4 h-4" />
                            <span>Biosites</span>
                        </button>

                        <button
                            onClick={handleRefreshData}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2 cursor-pointer"
                            disabled={currentPagination.loading}
                        >
                            <RefreshCw className={`w-4 h-4 ${currentPagination.loading ? 'animate-spin' : ''}`} />
                            <span>Actualizar</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Globe className="w-8 h-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Biosites</p>
                            <p className="text-2xl font-semibold text-gray-900">{biositesPagination.totalItems || 0}</p>
                            <p className="text-xs text-gray-400">
                                {biositesPagination.data.filter(biosite => biosite.isActive).length} activos
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <LinkIcon className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Enlaces</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {totalLinks}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Usuarios Únicos</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {usersPagination.totalItems || new Set(biositesPagination.data.map(biosite => biosite.ownerId)).size}
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">
                            {selectedView === 'biosites'
                                ? `Todos los Biosites (${biositesPagination.totalItems || 0})`
                                : `Todos los Usuarios (${usersPagination.totalItems || 0})`
                            }
                        </h2>
                    </div>
                </div>

                <div className="p-6">
                    {currentPagination.loading && initialized && (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {error && initialized && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                            <p className="text-yellow-800">{error}</p>
                        </div>
                    )}

                        <BiositesTable
                            pagination={biositesPagination}
                            biositeLinks={biositeLinks}
                            loadingBiositeLinks={loadingBiositeLinks}
                            analyticsData={analyticsData}
                            loadingAnalytics={loadingAnalytics}
                            showAnalytics={showAnalytics}
                            analyticsTimeRange={analyticsTimeRange}
                            expandedBiosite={expandedBiosite}
                            businessCards={businessCards}
                            loadingCards={loadingCards}
                            categorizeLinks={categorizeLinks}
                            toggleBiositeExpansion={toggleBiositeExpansion}
                            toggleAnalytics={toggleAnalytics}
                            fetchBiositeAnalytics={fetchBiositeAnalytics}
                            setAnalyticsTimeRange={setAnalyticsTimeRange}
                            setShowAnalytics={setShowAnalytics}
                            setAnalyticsData={setAnalyticsData}
                            formatDate={formatDate}
                            parseVCardData={parseVCardData}
                        />

                </div>
            </div>
            <div className='h-20'></div>
        </div>
    );
};

export default AdminPanel;