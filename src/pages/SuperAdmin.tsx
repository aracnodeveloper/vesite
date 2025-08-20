import React, { useState, useEffect, useCallback } from 'react';
import { useFetchBiosite } from '../hooks/useFetchBiosite';
//import { useUser } from '../hooks/useUser';
import {
    Users,
    Globe,
    CreditCard,
    Link2 as LinkIcon,
    Share2,
    Smartphone,
    MessageCircle,
    Music,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    RefreshCw,
    Database,
    Activity,
    UserCheck,
    UserX,
    Calendar,
    Mail
} from 'lucide-react';
import apiService from '../service/apiService';
import Cookie from "js-cookie";

interface UserData {
    id: string;
    email: string;
    name?: string;
    cedula?: string;
    role?: string;
    isActive?: boolean;
    parentId?: string;
    createdAt?: string;
    updatedAt?: string;
    biosites: any[];
    totalLinks: number;
    socialLinks: number;
    regularLinks: number;
    whatsAppLinks: number;
    appLinks: number;
    embedLinks: number;
    vCards: any[];
}

interface LinkData {
    id: string;
    label: string;
    url: string;
    icon?: string;
    isActive: boolean;
    orderIndex: number;
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
}

interface BiositeFull {
    id: string;
    ownerId: string;
    title: string;
    slug: string;
    themeId: string;
    colors: string | any;
    fonts?: string;
    avatarImage?: string;
    backgroundImage?: string;
    videoUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    links?: any[];
    owner?: User;
}

const AdminPanel: React.FC = () => {
    const role = Cookie.get('roleName');
    const userId = Cookie.get('userId');
    const { fetchAllBiosites } = useFetchBiosite();

    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allBiosites, setAllBiosites] = useState<BiositeFull[]>([]);
    const [usersData, setUsersData] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedUser, setExpandedUser] = useState<string | null>(null);
    const [selectedView, setSelectedView] = useState<'overview' | 'users' | 'biosites'>('overview');

    const fetchCurrentUser = useCallback(async (userIdFromCookie: string) => {
        try {
            const userData = await apiService.getById<User>('/users', userIdFromCookie);
            setCurrentUser(userData);
            return userData;
        } catch (error) {
            console.error('Error fetching current user:', error);
            setError('Error al cargar el usuario actual');
            return null;
        }
    }, []);

    const categorizeLinks = useCallback((links: LinkData[]) => {
        const categories = {
            social: 0,
            regular: 0,
            whatsApp: 0,
            apps: 0,
            embed: 0
        };

        const socialPlatforms = ['instagram', 'tiktok', 'twitter', 'x', 'youtube', 'facebook', 'twitch', 'linkedin', 'snapchat', 'threads', 'gmail', 'pinterest', 'spotify', 'discord', 'tumblr', 'telegram', 'amazon', 'onlyfans'];
        const appStores = ['appstore', 'googleplay', 'apps.apple.com', 'play.google.com'];
        const embedKeywords = ['music', 'video', 'embed', 'player', 'post', 'publicacion'];

        links.forEach(link => {
            const labelLower = link.label?.toLowerCase() || '';
            const urlLower = link.url?.toLowerCase() || '';
            const iconLower = link.icon?.toLowerCase() || '';

            // WhatsApp links
            if (urlLower.includes('api.whatsapp.com') || iconLower === 'whatsapp') {
                categories.whatsApp++;
            }
            // App store links
            else if (appStores.some(store => labelLower.includes(store) || urlLower.includes(store))) {
                categories.apps++;
            }
            // Embed links (music, videos, posts)
            else if (embedKeywords.some(keyword => labelLower.includes(keyword) || urlLower.includes(keyword))) {
                categories.embed++;
            }
            // Social platform links
            else if (socialPlatforms.some(platform => labelLower.includes(platform) || urlLower.includes(platform) || iconLower.includes(platform))) {
                categories.social++;
            }
            // Regular links
            else {
                categories.regular++;
            }
        });

        return categories;
    }, []);

    const fetchBiositeLinks = useCallback(async (biositeId: string): Promise<LinkData[]> => {
        try {
            const links = await apiService.getAll<LinkData[]>(`/links/biosite/${biositeId}`);
            return Array.isArray(links) ? links : [];
        } catch (error) {
            console.warn(`Error fetching links for biosite ${biositeId}:`, error);
            return [];
        }
    }, []);

    // Función separada para obtener VCard de un usuario
    const fetchUserVCard = useCallback(async (userId: string): Promise<any[]> => {
        try {
            const vCard = await apiService.getById('/business-cards/user', userId);
            return vCard ? [vCard] : [];
        } catch (error) {
            console.warn(`Error fetching VCard for user ${userId}:`, error);
            return [];
        }
    }, []);

    // FUNCIÓN OPTIMIZADA: Cargar todos los datos usando biosites y sus owners
    const fetchAllData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Obtener todos los biosites (que incluyen la información del owner)
            const biosites = await fetchAllBiosites();
            setAllBiosites(biosites);

            // Extraer usuarios únicos de los biosites
            const usersMap = new Map<string, User>();

            biosites.forEach(biosite => {
                if (biosite.owner && biosite.owner.id) {
                    usersMap.set(biosite.owner.id, biosite.owner);
                }
            });

            const uniqueUsers = Array.from(usersMap.values());
            setAllUsers(uniqueUsers);

            // Procesar datos para el panel de administración
            const processedUsers: UserData[] = [];

            for (const user of uniqueUsers) {
                try {
                    // Obtener biosites del usuario desde los datos ya cargados
                    const userBiosites = biosites.filter(
                        biosite => biosite.ownerId === user.id
                    );

                    let totalLinks = 0;
                    let allLinks: LinkData[] = [];
                    let vCards: any[] = [];

                    // Procesar cada biosite del usuario
                    for (const biosite of userBiosites) {
                        try {
                            const biositeLinks = await fetchBiositeLinks(biosite.id);
                            allLinks = [...allLinks, ...biositeLinks];
                            totalLinks += biositeLinks.length;
                        } catch (linkError) {
                            console.warn(`Error processing links for biosite ${biosite.id}:`, linkError);
                        }
                    }

                    // Obtener VCards del usuario
                    try {
                        const userVCards = await fetchUserVCard(user.id);
                        vCards = userVCards;
                    } catch (vCardError) {
                        console.warn(`Error fetching VCard for user ${user.id}:`, vCardError);
                    }

                    const linkCategories = categorizeLinks(allLinks);

                    processedUsers.push({
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        cedula: user.cedula,
                        role: user.role,
                        isActive: user.isActive,
                        parentId: user.parentId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        biosites: userBiosites,
                        totalLinks,
                        socialLinks: linkCategories.social,
                        regularLinks: linkCategories.regular,
                        whatsAppLinks: linkCategories.whatsApp,
                        appLinks: linkCategories.apps,
                        embedLinks: linkCategories.embed,
                        vCards
                    });
                } catch (userError) {
                    console.error(`Error processing user ${user.id}:`, userError);
                }
            }

            setUsersData(processedUsers);
        } catch (err) {
            console.error('Error fetching all data:', err);
            setError('Error al cargar todos los datos');
        } finally {
            setLoading(false);
        }
    }, [fetchAllBiosites, categorizeLinks, fetchBiositeLinks, fetchUserVCard]);

    // useEffect principal que maneja la carga inicial
    useEffect(() => {
        const initializeData = async () => {
            if (role === 'SUPER_ADMIN' && userId) {
                try {
                    // Primero obtener el usuario actual
                    const user = await fetchCurrentUser(userId);
                    if (user) {
                        // Luego obtener todos los datos
                        await fetchAllData();
                    }
                } catch (error) {
                    console.error('Error initializing data:', error);
                    setError('Error al inicializar los datos');
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        initializeData();
    }, [role, userId, fetchCurrentUser, fetchAllData]);

    // Función para refrescar datos
    const handleRefreshData = useCallback(async () => {
        if (currentUser) {
            await fetchAllData();
        } else if (userId) {
            const user = await fetchCurrentUser(userId);
            if (user) {
                await fetchAllData();
            }
        }
    }, [currentUser, userId, fetchCurrentUser, fetchAllData]);

    const toggleUserExpansion = (userId: string) => {
        setExpandedUser(expandedUser === userId ? null : userId);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };


    const renderAllUsersTable = () => (
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
                        Creado
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
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
                                {user.role}
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(user.createdAt)}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );

    const renderAllBiositesTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biosite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Propietario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Creado
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {allBiosites.map((biosite) => (
                    <tr key={biosite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <Globe className="w-5 h-5 text-blue-500 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">
                                        {biosite.title}
                                    </div>
                                    <div className="text-xs text-gray-500">ID: {biosite.id}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                    <div className="text-sm text-gray-900">
                                        {biosite.owner?.name || biosite.owner?.email || 'Usuario no encontrado'}
                                    </div>
                                    {biosite.owner?.email && biosite.owner?.name && (
                                        <div className="text-xs text-gray-500">{biosite.owner.email}</div>
                                    )}
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-mono text-gray-600">/{biosite.slug}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                biosite.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {biosite.isActive ? (
                                    <>
                                        <Eye className="w-3 h-3 mr-1" />
                                        Activo
                                    </>
                                ) : (
                                    <>
                                        <EyeOff className="w-3 h-3 mr-1" />
                                        Inactivo
                                    </>
                                )}
                            </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(biosite.createdAt)}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );


    const renderOverviewTable = () => (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Biosites
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Links Totales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        VCards
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {usersData.map((userData) => (
                    <React.Fragment key={userData.id}>
                        <tr className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Users className="w-5 h-5 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {userData.name || userData.email}
                                        </div>
                                        <div className="text-sm text-gray-500">{userData.email}</div>
                                        {userData.cedula && (
                                            <div className="text-xs text-gray-400">CI: {userData.cedula}</div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Globe className="w-4 h-4 text-blue-500 mr-2" />
                                    <span className="text-sm text-gray-900">{userData.biosites.length}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <LinkIcon className="w-4 h-4 text-green-500 mr-2" />
                                    <span className="text-sm text-gray-900">{userData.totalLinks}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <CreditCard className="w-4 h-4 text-purple-500 mr-2" />
                                    <span className="text-sm text-gray-900">{userData.vCards.length}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    userData.isActive
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {userData.isActive ? (
                                        <>
                                            <Eye className="w-3 h-3 mr-1" />
                                            Activo
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Inactivo
                                        </>
                                    )}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button
                                    onClick={() => toggleUserExpansion(userData.id)}
                                    className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                >
                                    {expandedUser === userData.id ? (
                                        <>
                                            <ChevronUp className="w-4 h-4 mr-1" />
                                            Ocultar
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown className="w-4 h-4 mr-1" />
                                            Ver detalles
                                        </>
                                    )}
                                </button>
                            </td>
                        </tr>
                        {expandedUser === userData.id && (
                            <tr>
                                <td colSpan={6} className="px-6 py-4 bg-gray-50">
                                    <div className="space-y-4">
                                        {/* Links Categories */}
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-700 mb-2">Distribución de Links</h4>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                                <div className="bg-white p-3 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <Share2 className="w-4 h-4 text-blue-500 mr-2" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Social</p>
                                                            <p className="text-sm font-semibold">{userData.socialLinks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <LinkIcon className="w-4 h-4 text-green-500 mr-2" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Regular</p>
                                                            <p className="text-sm font-semibold">{userData.regularLinks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <MessageCircle className="w-4 h-4 text-green-600 mr-2" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">WhatsApp</p>
                                                            <p className="text-sm font-semibold">{userData.whatsAppLinks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <Smartphone className="w-4 h-4 text-gray-600 mr-2" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Apps</p>
                                                            <p className="text-sm font-semibold">{userData.appLinks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-3 rounded-lg border">
                                                    <div className="flex items-center">
                                                        <Music className="w-4 h-4 text-purple-500 mr-2" />
                                                        <div>
                                                            <p className="text-xs text-gray-500">Embed</p>
                                                            <p className="text-sm font-semibold">{userData.embedLinks}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Biosites */}
                                        {userData.biosites.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Biosites</h4>
                                                <div className="grid gap-2">
                                                    {userData.biosites.map((biosite) => (
                                                        <div key={biosite.id} className="bg-white p-3 rounded border flex justify-between items-center">
                                                            <div>
                                                                <p className="text-sm font-medium">{biosite.title}</p>
                                                                <p className="text-xs text-gray-500">/{biosite.slug}</p>
                                                            </div>
                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                biosite.isActive
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : 'bg-red-100 text-red-700'
                                                            }`}>
                                                                {biosite.isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* VCards */}
                                        {userData.vCards.length > 0 && (
                                            <div>
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2">VCards</h4>
                                                <div className="grid gap-2">
                                                    {userData.vCards.map((vcard) => (
                                                        <div key={vcard.id} className="bg-white p-3 rounded border">
                                                            <p className="text-sm">VCard ID: {vcard.id}</p>
                                                            <p className="text-xs text-gray-500">
                                                                QR: {vcard.qrCodeUrl ? 'Disponible' : 'No disponible'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );

    const renderStats = () => {
        const totalUsers = allUsers.length;
        const totalBiosites = allBiosites.length;
        const totalLinks = usersData.reduce((sum, user) => sum + user.totalLinks, 0);
        const totalVCards = usersData.reduce((sum, user) => sum + user.vCards.length, 0);
        const activeUsers = allUsers.filter(user => user.isActive).length;
        const activeBiosites = allBiosites.filter(biosite => biosite.isActive).length;

        return (
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Users className="w-8 h-8 text-blue-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Usuarios</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                            <p className="text-xs text-gray-400">{activeUsers} activos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Globe className="w-8 h-8 text-green-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Biosites</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalBiosites}</p>
                            <p className="text-xs text-gray-400">{activeBiosites} activos</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <LinkIcon className="w-8 h-8 text-purple-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Links</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalLinks}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <CreditCard className="w-8 h-8 text-orange-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total VCards</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalVCards}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Activity className="w-8 h-8 text-red-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Promedio Links/Usuario</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {totalUsers > 0 ? Math.round(totalLinks / totalUsers) : 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow border">
                    <div className="flex items-center">
                        <Database className="w-8 h-8 text-indigo-500" />
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Promedio Biosites/Usuario</p>
                            <p className="text-2xl font-semibold text-gray-900">
                                {totalUsers > 0 ? Math.round(totalBiosites / totalUsers) : 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (role !== 'SUPER_ADMIN') {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-600">Acceso Denegado</h2>
                    <p className="text-gray-500">Solo los usuarios SUPER_ADMIN pueden acceder a este panel.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                        <p className="text-gray-600">Gestión completa de usuarios y contenido</p>
                        {currentUser && (
                            <p className="text-sm text-gray-500">Usuario: {currentUser.name || currentUser.email}</p>
                        )}
                    </div>
                    <button
                        onClick={handleRefreshData}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>Actualizar Datos</span>
                    </button>
                </div>
            </div>

            {/* Stats */}
            {renderStats()}

            {/* Main Content */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium text-gray-900">
                            {selectedView === 'overview' && 'Vista General'}
                            {selectedView === 'users' && 'Todos los Usuarios'}
                            {selectedView === 'biosites' && 'Todos los Biosites'}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={() => setSelectedView('overview')}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    selectedView === 'overview'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Users className="w-4 h-4 inline mr-1" />
                                Vista General
                            </button>
                            <button
                                onClick={() => setSelectedView('users')}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    selectedView === 'users'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Database className="w-4 h-4 inline mr-1" />
                                Todos los Usuarios ({allUsers.length})
                            </button>
                            <button
                                onClick={() => setSelectedView('biosites')}
                                className={`px-3 py-1 rounded-md text-sm ${
                                    selectedView === 'biosites'
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Globe className="w-4 h-4 inline mr-1" />
                                Todos los Biosites ({allBiosites.length})
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {selectedView === 'overview' && renderOverviewTable()}
                    {selectedView === 'users' && renderAllUsersTable()}
                    {selectedView === 'biosites' && renderAllBiositesTable()}
                </div>
            </div>

            {/* Footer con información adicional */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Resumen del Sistema</h3>
                        <p className="text-sm text-gray-600">
                            El sistema cuenta con {allUsers.length} usuarios registrados,
                            {allBiosites.length} biosites creados y un total de {usersData.reduce((sum, user) => sum + user.totalLinks, 0)} links activos.
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Actividad</h3>
                        <p className="text-sm text-gray-600">
                            {allUsers.filter(user => user.isActive).length} usuarios activos de {allUsers.length} totales
                            ({allUsers.length > 0 ? Math.round((allUsers.filter(user => user.isActive).length / allUsers.length) * 100) : 0}% de actividad)
                        </p>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Última Actualización</h3>
                        <p className="text-sm text-gray-600">
                            Datos actualizados en tiempo real
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;