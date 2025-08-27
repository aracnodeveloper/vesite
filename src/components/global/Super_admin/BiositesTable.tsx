import React from 'react';
import Pagination from './Pagination.tsx';
import {
    Users,
    Globe,
    Link2 as LinkIcon,
    ChevronDown,
    ChevronUp,
    Eye,
    EyeOff,
    Calendar,
    Database,
    BarChart3,
    TrendingUp,
    MousePointer,
    ExternalLink
} from 'lucide-react';
import type {BiositeFull,LinkData,LinkImageDisplayProps, BiositesTableProps, TimeRange} from '../../../interfaces/AdminData.ts'
import {socialMediaPlatforms} from "../../../media/socialPlataforms.ts";

const placeholderLinkImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f8fafc' rx='8' stroke='%23e2e8f0' stroke-width='1'/%3E%3Cpath d='M13 13h14v14H13z' fill='%23e2e8f0'/%3E%3Ccircle cx='18' cy='18' r='2.5' fill='%239ca3af'/%3E%3Cpath d='M15 29l6-4 6 4H15z' fill='%239ca3af'/%3E%3C/svg%3E";


const LinkImageDisplay: React.FC<LinkImageDisplayProps> = ({ link, size = 'md' }) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoading, setImageLoading] = React.useState(false);
    const [iconError, setIconError] = React.useState(false);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-14 h-14',
        lg: 'w-18 h-18'
    };

    const handleImageError = () => {
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
        setImageError(false);
    };

    const handleImageLoadStart = () => {
        setImageLoading(true);
        setImageError(false);
    };

    const handleIconError = () => {
        setIconError(true);
    };

    const getIconPath = (iconIdentifier: string): string | null => {
        if (!iconIdentifier) return null;

        if (iconIdentifier.startsWith('http') || iconIdentifier.startsWith('/assets/icons/')) {
            return iconIdentifier;
        }

        const cleanIdentifier = iconIdentifier.toLowerCase().trim();

        const iconPathMap: { [key: string]: string } = {
            'instagram': '/assets/icons/instagram.svg',
            'tiktok': '/assets/icons/tiktok.svg',
            'twitter': '/assets/icons/X.svg',
            'x': '/assets/icons/X.svg',
            'youtube': '/assets/icons/youtube.svg',
            'facebook': '/assets/icons/facebook.svg',
            'twitch': '/assets/icons/twitch.svg',
            'linkedin': '/assets/icons/linkdl.svg',
            'snapchat': '/assets/icons/snapchat.svg',
            'threads': '/assets/icons/threads.svg',
            'gmail': '/assets/icons/gmail.svg',
            'email': '/assets/icons/gmail.svg',
            'pinterest': '/assets/icons/pinterest.svg',
            'spotify': '/assets/icons/spottufy.svg',
            'discord': '/assets/icons/discord.svg',
            'tumblr': '/assets/icons/tumblr.svg',
            'whatsapp': '/assets/icons/whatsapp.svg',
            'telegram': '/assets/icons/telegram.svg',
            'amazon': '/assets/icons/amazon.svg',
            'onlyfans': '/assets/icons/onlyfans.svg',
            'appstore': '/assets/icons/appstore.svg',
            'googleplay': '/assets/icons/googleplay.svg'
        };

        if (iconPathMap[cleanIdentifier]) {
            return iconPathMap[cleanIdentifier];
        }

        const urlLower = link.url?.toLowerCase() || '';
        const labelLower = link.label?.toLowerCase() || '';

        if (urlLower.includes('instagram.com') || labelLower.includes('instagram')) {
            return '/assets/icons/instagram.svg';
        }
        if (urlLower.includes('tiktok.com') || labelLower.includes('tiktok')) {
            return '/assets/icons/tiktok.svg';
        }
        if (urlLower.includes('twitter.com') || urlLower.includes('x.com') || labelLower.includes('twitter') || labelLower.includes(' x ')) {
            return '/assets/icons/X.svg';
        }
        if (urlLower.includes('youtube.com') || labelLower.includes('youtube')) {
            return '/assets/icons/youtube.svg';
        }
        if (urlLower.includes('facebook.com') || labelLower.includes('facebook')) {
            return '/assets/icons/facebook.svg';
        }
        if (urlLower.includes('twitch.tv') || labelLower.includes('twitch')) {
            return '/assets/icons/twitch.svg';
        }
        if (urlLower.includes('linkedin.com') || labelLower.includes('linkedin')) {
            return '/assets/icons/linkdl.svg';
        }
        if (urlLower.includes('snapchat.com') || labelLower.includes('snapchat')) {
            return '/assets/icons/snapchat.svg';
        }
        if (urlLower.includes('spotify.com') || labelLower.includes('spotify')) {
            return '/assets/icons/spottufy.svg';
        }
        if (urlLower.includes('discord') || labelLower.includes('discord')) {
            return '/assets/icons/discord.svg';
        }
        if (urlLower.includes('whatsapp.com') || urlLower.includes('api.whatsapp.com') || labelLower.includes('whatsapp')) {
            return '/assets/icons/whatsapp.svg';
        }
        if (urlLower.includes('telegram') || labelLower.includes('telegram')) {
            return '/assets/icons/telegram.svg';
        }
        if (urlLower.includes('pinterest.com') || labelLower.includes('pinterest')) {
            return '/assets/icons/pinterest.svg';
        }
        if (urlLower.includes('apps.apple.com') || labelLower.includes('app store')) {
            return '/assets/icons/appstore.svg';
        }
        if (urlLower.includes('play.google.com') || labelLower.includes('google play')) {
            return '/assets/icons/googleplay.svg';
        }
        if (urlLower.includes('amazon.com') || labelLower.includes('amazon')) {
            return '/assets/icons/amazon.svg';
        }
        if (urlLower.includes('gmail.com') || labelLower.includes('gmail') || labelLower.includes('email')) {
            return '/assets/icons/gmail.svg';
        }

        return null;
    };

    const getPlatformName = (iconPath: string): string => {
        const platformMap: {[key: string]: string} = {
            '/assets/icons/instagram.svg': 'Instagram',
            '/assets/icons/tiktok.svg': 'TikTok',
            '/assets/icons/X.svg': 'X (Twitter)',
            '/assets/icons/youtube.svg': 'YouTube',
            '/assets/icons/facebook.svg': 'Facebook',
            '/assets/icons/twitch.svg': 'Twitch',
            '/assets/icons/linkdl.svg': 'LinkedIn',
            '/assets/icons/snapchat.svg': 'Snapchat',
            '/assets/icons/threads.svg': 'Threads',
            '/assets/icons/gmail.svg': 'Gmail',
            '/assets/icons/pinterest.svg': 'Pinterest',
            '/assets/icons/spottufy.svg': 'Spotify',
            '/assets/icons/discord.svg': 'Discord',
            '/assets/icons/tumblr.svg': 'Tumblr',
            '/assets/icons/whatsapp.svg': 'WhatsApp',
            '/assets/icons/telegram.svg': 'Telegram',
            '/assets/icons/amazon.svg': 'Amazon',
            '/assets/icons/onlyfans.svg': 'OnlyFans',
            '/assets/icons/appstore.svg': 'App Store',
            '/assets/icons/googleplay.svg': 'Google Play'
        };
        return platformMap[iconPath] || 'Platform';
    };

    if (link.image && !imageError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-white overflow-hidden flex-shrink-0 border shadow-sm`}>
                {imageLoading && (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                )}
                <img
                    src={link.image}
                    alt={`${link.label || 'Link'} custom image`}
                    className="w-full h-full object-cover"
                    onLoadStart={handleImageLoadStart}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    style={{
                        display: imageError ? 'none' : 'block'
                    }}
                />
                {imageError && (
                    <div className="w-full h-full">
                        {(() => {
                            const iconPath = getIconPath(link.icon || '');
                            if (iconPath && !iconError) {
                                return (
                                    <img
                                        src={iconPath}
                                        alt={`${getPlatformName(iconPath)} icon`}
                                        className="w-full h-full object-contain p-2"
                                        onError={handleIconError}
                                    />
                                );
                            }
                            return (
                                <img
                                    src={placeholderLinkImage}
                                    alt="Link placeholder"
                                    className="w-full h-full object-cover"
                                />
                            );
                        })()}
                    </div>
                )}
            </div>
        );
    }

    const iconPath = getIconPath(link.icon || '');
    const platform = socialMediaPlatforms.find(p =>
        p.name.toLowerCase() === link.label.toLowerCase() ||
        link.label.toLowerCase().includes(p.id.toLowerCase()) ||
        p.id.toLowerCase() === link.label.toLowerCase()
    );
    if (iconPath && !iconError) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-white overflow-hidden flex-shrink-0 border shadow-sm`}>
                <img
                    src={platform?.icon}
                    alt={`${getPlatformName(iconPath)} icon`}
                    className="w-full h-full object-contain p-2"
                    onError={handleIconError}
                />
            </div>
        );
    }

    if (link.icon && !link.icon.includes('/') && !link.icon.includes('.')) {
        return (
            <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center text-lg font-semibold text-blue-700`}>
                {link.icon}
            </div>
        );
    }

    const getInitial = (label: string): string => {
        if (!label) return 'L';
        return label.charAt(0).toUpperCase();
    };

    const initial = getInitial(link.label || 'Link');
    const bgColors = [
        'bg-gradient-to-br from-red-100 to-red-200 text-red-700 border-red-200',
        'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200',
        'bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-green-200',
        'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 border-purple-200',
        'bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-200',
        'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700 border-pink-200'
    ];

    const colorIndex = link.label ? link.label.charCodeAt(0) % bgColors.length : 0;

    return (
        <div className={`${sizeClasses[size]} rounded-lg border flex items-center justify-center text-lg font-semibold ${bgColors[colorIndex]}`}>
            {initial}
        </div>
    );
};

const getLinkType = (link: LinkData): { type: string; color: string; icon: any } => {
    const urlLower = link.url?.toLowerCase() || '';
    const labelLower = link.label?.toLowerCase() || '';

    const socialPlatforms = [
        'instagram', 'tiktok', 'twitter', 'x.com', 'youtube', 'facebook',
        'twitch', 'linkedin', 'snapchat', 'threads', 'pinterest', 'discord', 'tumblr'
    ];

    if (socialPlatforms.some(platform => urlLower.includes(platform) || labelLower.includes(platform))) {
        return { type: 'Social', color: 'bg-blue-100 text-blue-800', icon: <Users className="w-3 h-3" /> };
    }

    if (urlLower.includes('whatsapp') || urlLower.includes('telegram') || urlLower.includes('gmail') || labelLower.includes('email')) {
        return { type: 'Comunicación', color: 'bg-green-100 text-green-800', icon: <LinkIcon className="w-3 h-3" /> };
    }

    if (urlLower.includes('apps.apple.com') || urlLower.includes('play.google.com') || labelLower.includes('app store') || labelLower.includes('google play')) {
        return { type: 'App Store', color: 'bg-purple-100 text-purple-800', icon: <Globe className="w-3 h-3" /> };
    }

    if (urlLower.includes('spotify') || urlLower.includes('music') || labelLower.includes('music') || labelLower.includes('audio')) {
        return { type: 'Música', color: 'bg-pink-100 text-pink-800', icon: <BarChart3 className="w-3 h-3" /> };
    }

    if (urlLower.includes('amazon') || urlLower.includes('shop') || labelLower.includes('tienda')) {
        return { type: 'Comercio', color: 'bg-orange-100 text-orange-800', icon: <TrendingUp className="w-3 h-3" /> };
    }

    return { type: 'Enlace', color: 'bg-gray-100 text-gray-800', icon: <ExternalLink className="w-3 h-3" /> };
};

export const BiositesTable: React.FC<BiositesTableProps> = ({
                                                                pagination,
                                                                biositeLinks,
                                                                loadingBiositeLinks,
                                                                analyticsData,
                                                                loadingAnalytics,
                                                                showAnalytics,
                                                                analyticsTimeRange,
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
                                                                parseVCardData
                                                            }) => {
    if (!pagination.data || pagination.data.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No hay biosites para mostrar</p>
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
                            Biosite
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
                    {pagination.data.map((biosite: BiositeFull) => {
                        const isExpanded = expandedBiosite === biosite.id;
                        const userBusinessCard = businessCards[biosite.ownerId];
                        const isLoadingCard = loadingCards[biosite.ownerId];
                        const biositeAnalytics = analyticsData[biosite.id];
                        const isLoadingAnalytics = loadingAnalytics[biosite.id];
                        const isShowingAnalytics = showAnalytics[biosite.id];

                        return (
                            <React.Fragment key={biosite.id}>
                                <tr className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Globe className="w-5 h-5 text-blue-500 mr-3" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {biosite.title || 'Sin título'}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ID: {biosite.id.substring(0, 8)}...
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 text-gray-400 mr-2" />
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {biosite.owner?.name || biosite.owner?.email || 'Usuario desconocido'}
                                                </div>
                                                {biosite.owner?.email && biosite.owner?.name && (
                                                    <div className="text-xs text-gray-500">
                                                        {biosite.owner.email}
                                                    </div>
                                                )}
                                                {biosite.owner?.cedula && (
                                                    <div className="text-xs text-gray-400">
                                                        CI: {biosite.owner.cedula}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-mono text-gray-600">
                                            {biosite.slug ? `/${biosite.slug}` : 'Sin slug'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {isLoadingAnalytics ? (
                                            <div className="flex items-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                                                <span className="text-xs text-gray-500">Cargando...</span>
                                            </div>
                                        ) : biositeAnalytics ? (
                                            <div className="flex flex-col space-y-1">
                                                <div className="flex items-center">
                                                    <Eye className="w-3 h-3 text-blue-500 mr-1" />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {biositeAnalytics.views}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-1">vistas</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <MousePointer className="w-3 h-3 text-green-500 mr-1" />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {biositeAnalytics.clicks}
                                                    </span>
                                                    <span className="text-xs text-gray-500 ml-1">clicks</span>
                                                </div>
                                                {biositeAnalytics.views > 0 && (
                                                    <div className="flex items-center">
                                                        <TrendingUp className="w-3 h-3 text-purple-500 mr-1" />
                                                        <span className="text-xs text-gray-600">
                                                            {Math.round((biositeAnalytics.clicks / biositeAnalytics.views) * 100)}% CTR
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => toggleAnalytics(biosite.id, biosite.ownerId)}
                                                className="flex items-center text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                                            >
                                                <BarChart3 className="w-4 h-4 mr-1" />
                                                Ver analytics
                                            </button>
                                        )}
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
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                onClick={() => toggleBiositeExpansion(biosite.id)}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center cursor-pointer"
                                            >
                                                {isExpanded ? (
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

                                            {biositeAnalytics && (
                                                <button
                                                    onClick={() => setShowAnalytics(prev => ({
                                                        ...prev,
                                                        [biosite.id]: !prev[biosite.id]
                                                    }))}
                                                    className="text-blue-600 hover:text-blue-900 flex items-center text-xs cursor-pointer"
                                                >
                                                    <BarChart3 className="w-3 h-3 mr-1" />
                                                    {isShowingAnalytics ? 'Ocultar analytics' : 'Ver analytics'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>

                                {/* Analytics expanded view */}
                                {isShowingAnalytics && biositeAnalytics && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 bg-blue-50 border-l-4 border-blue-500">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="text-sm font-semibold text-blue-800 flex items-center">
                                                        <BarChart3 className="w-4 h-4 mr-2" />
                                                        Analytics del Biosite ({analyticsTimeRange === 'last7' ? 'Últimos 7 días' : analyticsTimeRange === 'last30' ? 'Últimos 30 días' : 'Último año'})
                                                    </h4>
                                                    <div className="mb-4 flex items-center space-x-4">
                                                        <label className="text-sm font-medium text-gray-700">
                                                            Rango de tiempo para analytics:
                                                        </label>
                                                        <select
                                                            value={analyticsTimeRange}
                                                            onChange={(e) => {
                                                                setAnalyticsTimeRange(e.target.value as TimeRange);
                                                                setAnalyticsData({});
                                                            }}
                                                            className="px-3 py-1 border border-gray-300 rounded text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        >
                                                            <option value="last7">Últimos 7 días</option>
                                                            <option value="last30">Últimos 30 días</option>
                                                            <option value="lastYear">Último año</option>
                                                        </select>
                                                    </div>
                                                    <button
                                                        onClick={() => fetchBiositeAnalytics(biosite.id, biosite.ownerId)}
                                                        className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                                    >
                                                        Actualizar
                                                    </button>
                                                </div>

                                                {/* Summary metrics */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-white p-3 rounded border">
                                                        <div className="flex items-center">
                                                            <Eye className="w-5 h-5 text-blue-500 mr-2" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Total Vistas</p>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {biositeAnalytics.views}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-3 rounded border">
                                                        <div className="flex items-center">
                                                            <MousePointer className="w-5 h-5 text-green-500 mr-2" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">Total Clicks</p>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {biositeAnalytics.clicks}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="bg-white p-3 rounded border">
                                                        <div className="flex items-center">
                                                            <TrendingUp className="w-5 h-5 text-purple-500 mr-2" />
                                                            <div>
                                                                <p className="text-xs text-gray-500">CTR</p>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {biositeAnalytics.views > 0
                                                                        ? Math.round((biositeAnalytics.clicks / biositeAnalytics.views) * 100)
                                                                        : 0}%
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Daily activity */}
                                                {biositeAnalytics.dailyActivity && biositeAnalytics.dailyActivity.length > 0 && (
                                                    <div className="bg-white p-4 rounded border">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                                                            Actividad {analyticsTimeRange === 'lastYear' ? 'Mensual' : 'Diaria'}
                                                        </h5>
                                                        <div className="max-h-40 overflow-y-auto">
                                                            <div className="space-y-2">
                                                                {biositeAnalytics.dailyActivity.slice(0, 7).map((activity, index) => (
                                                                    <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                                                        <span className="text-sm text-gray-600">{activity.day}</span>
                                                                        <div className="flex space-x-4 text-sm">
                                                                            <span className="flex items-center text-blue-600">
                                                                                <Eye className="w-3 h-3 mr-1" />
                                                                                {activity.views}
                                                                            </span>
                                                                            <span className="flex items-center text-green-600">
                                                                                <MousePointer className="w-3 h-3 mr-1" />
                                                                                {activity.clicks}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Click details */}
                                                {biositeAnalytics.clickDetails && biositeAnalytics.clickDetails.length > 0 && (
                                                    <div className="bg-white p-4 rounded border">
                                                        <h5 className="text-sm font-medium text-gray-700 mb-3">
                                                            Clicks por Link
                                                        </h5>
                                                        <div className="max-h-40 overflow-y-auto">
                                                            <div className="space-y-2">
                                                                {biositeAnalytics.clickDetails.slice(0, 10).map((click, index) => (
                                                                    <div key={index} className="flex justify-between items-center py-1 px-2 bg-gray-50 rounded">
                                                                        <span className="text-sm text-gray-600 truncate">
                                                                            {click.label}
                                                                        </span>
                                                                        <span className="text-sm font-semibold text-gray-900">
                                                                            {click.count}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {/* Original expanded biosite details */}
                                {isExpanded && (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                            <div className="space-y-6">
                                                {/* Información del Usuario */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                                                        Información del Usuario
                                                    </h4>
                                                    <div className="bg-white p-3 rounded border">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="text-xs text-gray-500">Nombre</p>
                                                                <p className="text-sm text-gray-700">{biosite.owner?.name || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Email</p>
                                                                <p className="text-sm text-gray-700">{biosite.owner?.email || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Cédula</p>
                                                                <p className="text-sm text-gray-700">{biosite.owner?.cedula || 'N/A'}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs text-gray-500">Rol</p>
                                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                                                    biosite.owner?.role === 'ADMIN' ? 'bg-blue-100 text-blue-800' :
                                                                        biosite.owner?.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                                                                            'bg-green-100 text-green-800'
                                                                }`}>
                                                                    {biosite.owner?.role || 'USER'}
                                                                </span>
                                                            </div>
                                                            {biosite.avatarImage && (
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-2">Avatar</p>
                                                                    <img
                                                                        src={biosite.avatarImage}
                                                                        className="h-24 w-24 rounded-lg object-cover"
                                                                        alt="Avatar"
                                                                    />
                                                                </div>
                                                            )}
                                                            {biosite.backgroundImage && (
                                                                <div>
                                                                    <p className="text-xs text-gray-500 mb-2">Background</p>
                                                                    <img
                                                                        src={biosite.backgroundImage}
                                                                        className="h-24 w-96 rounded-lg object-cover"
                                                                        alt="Background"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* V-Card Information */}
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                                        <Database className="w-4 h-4 mr-2" />
                                                        Tarjeta Digital
                                                    </h4>

                                                    {isLoadingCard ? (
                                                        <div className="bg-white p-4 rounded border flex items-center justify-center">
                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                                                            <span className="text-sm text-gray-600">Cargando V-Card...</span>
                                                        </div>
                                                    ) : userBusinessCard ? (
                                                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                                            {/* QR Code Section */}
                                                            {userBusinessCard.qrCodeUrl && (
                                                                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 text-center border-b">
                                                                    <div className="flex items-center justify-center space-x-4">
                                                                        <img
                                                                            src={userBusinessCard.qrCodeUrl}
                                                                            alt="QR Code"
                                                                            className="w-20 h-20 bg-white p-2 rounded-lg shadow-sm"
                                                                        />
                                                                        <div className="text-left">
                                                                            <p className="text-sm font-medium text-gray-700">
                                                                                QR Code Disponible
                                                                            </p>
                                                                            <p className="text-xs text-gray-500">
                                                                                Escanea para ver la V-Card
                                                                            </p>
                                                                            {userBusinessCard.slug && (
                                                                                <p className="text-xs text-blue-600 mt-1">
                                                                                    /{userBusinessCard.slug}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* V-Card Data */}
                                                            <div className="p-4">
                                                                {(() => {
                                                                    const vCardData = parseVCardData(userBusinessCard);

                                                                    if (!vCardData) {
                                                                        return (
                                                                            <div className="text-center py-4">
                                                                                <p className="text-sm text-gray-500">
                                                                                    V-Card sin datos configurados
                                                                                </p>
                                                                            </div>
                                                                        );
                                                                    }

                                                                    return (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                            {vCardData.name && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Nombre:</span>
                                                                                    <span className="text-sm text-gray-800 font-medium">
                                                                                        {vCardData.name}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {vCardData.title && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Título:</span>
                                                                                    <span className="text-sm text-gray-800">
                                                                                        {vCardData.title}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {vCardData.company && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Empresa:</span>
                                                                                    <span className="text-sm text-gray-800">
                                                                                        {vCardData.company}
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            {vCardData.email && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Email:</span>
                                                                                    <a
                                                                                        href={`mailto:${vCardData.email}`}
                                                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                                    >
                                                                                        {vCardData.email}
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                            {vCardData.phone && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Teléfono:</span>
                                                                                    <a
                                                                                        href={`tel:${vCardData.phone}`}
                                                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                                    >
                                                                                        {vCardData.phone}
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                            {vCardData.website && (
                                                                                <div className="flex items-center space-x-2">
                                                                                    <span className="text-xs text-gray-500 w-16">Web:</span>
                                                                                    <a
                                                                                        href={vCardData.website}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                                                                    >
                                                                                        {vCardData.website}
                                                                                    </a>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}

                                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                                                            userBusinessCard.isActive
                                                                                ? 'bg-green-100 text-green-700'
                                                                                : 'bg-red-100 text-red-700'
                                                                        }`}>
                                                                            {userBusinessCard.isActive ? 'V-Card Activa' : 'V-Card Inactiva'}
                                                                        </span>
                                                                        <span>
                                                                            ID: {userBusinessCard.id?.substring(0, 8)}...
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="bg-white p-4 rounded border text-center">
                                                            <div className="text-gray-400 mb-2">
                                                                <Database className="w-8 h-8 mx-auto mb-2" />
                                                            </div>
                                                            <p className="text-sm text-gray-600">
                                                                Este usuario no tiene V-Card configurada
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Enlaces detallados with fetched links */}
                                                {(() => {
                                                    const currentBiositeLinks = biositeLinks[biosite.id] || [];
                                                    const isLoadingLinks = loadingBiositeLinks[biosite.id];

                                                    return (
                                                        <div>
                                                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                                                <LinkIcon className="w-4 h-4 text-purple-500 mr-2" />
                                                                Enlaces ({currentBiositeLinks.length})
                                                                {isLoadingLinks && (
                                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500 ml-2"></div>
                                                                )}
                                                            </h4>

                                                            {isLoadingLinks ? (
                                                                <div className="bg-white p-4 rounded border text-center">
                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                                                                    <p className="text-sm text-gray-600">Cargando enlaces...</p>
                                                                </div>
                                                            ) : currentBiositeLinks.length > 0 ? (
                                                                <div className="max-h-80 overflow-y-auto space-y-3">
                                                                    {currentBiositeLinks.filter(link => link.isActive)
                                                                        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                                                                        .map((link, index) => {
                                                                            const linkType = getLinkType(link);
                                                                            return (
                                                                                <div key={link.id || index}
                                                                                     className="bg-white p-4 rounded border hover:shadow-sm transition-shadow">
                                                                                    <div
                                                                                        className="flex items-start justify-between">
                                                                                        <div
                                                                                            className="flex items-start space-x-3 flex-1">
                                                                                            {/* Updated image/icon display */}
                                                                                            <LinkImageDisplay
                                                                                                link={link}/>

                                                                                            <div
                                                                                                className="flex-1 min-w-0">
                                                                                                <div
                                                                                                    className="flex items-center space-x-2 mb-1">
                                                                                                    <p className="text-sm font-medium text-gray-900 break-words">
                                                                                                        {link.label || 'Sin título'}
                                                                                                    </p>
                                                                                                    <span
                                                                                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${linkType.color}`}>
                                                                                                        {linkType.icon}
                                                                                                        <span
                                                                                                            className="ml-1">{linkType.type}</span>
                                                                                                    </span>
                                                                                                </div>
                                                                                                <p className="text-xs text-blue-600 hover:text-blue-800 break-all mt-1">
                                                                                                    <a
                                                                                                        href={link.url}
                                                                                                        target="_blank"
                                                                                                        rel="noopener noreferrer"
                                                                                                        className="hover:underline"
                                                                                                    >
                                                                                                        {link.url.length > 50 ? `${link.url.substring(0, 50)}...` : link.url}
                                                                                                    </a>
                                                                                                </p>
                                                                                                {link.description && (
                                                                                                    <p className="text-xs text-gray-400 mt-1 break-words">
                                                                                                        {link.description}
                                                                                                    </p>
                                                                                                )}
                                                                                                {link.color && (
                                                                                                    <div
                                                                                                        className="flex items-center mt-2">
                                                                                                        <div
                                                                                                            className="w-4 h-4 rounded border mr-2"
                                                                                                            style={{backgroundColor: link.color}}
                                                                                                        ></div>
                                                                                                        <span
                                                                                                            className="text-xs text-gray-500">
                                                                                                        {link.color}
                                                                                                    </span>
                                                                                                    </div>
                                                                                                )}
                                                                                                <div
                                                                                                    className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                                                                                    <span>Orden: #{link.orderIndex || index + 1}</span>
                                                                                                    <span>ID: {link.id.substring(0, 8)}...</span>
                                                                                                    {link.createdAt && (
                                                                                                        <span>Creado: {formatDate(link.createdAt)}</span>
                                                                                                    )}
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                        <div
                                                                                            className="flex flex-col items-end space-y-1 ml-4">
                                                                                        <span
                                                                                            className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                                                                                link.isActive
                                                                                                    ? 'bg-green-100 text-green-700'
                                                                                                    : 'bg-red-100 text-red-700'
                                                                                            }`}>
                                                                                            {link.isActive ? 'Activo' : 'Inactivo'}
                                                                                        </span>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </div>
                                                            ) : (
                                                                <div className="text-center py-8">
                                                                    <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                                                    <p className="text-sm text-gray-500">
                                                                        Este biosite no tiene enlaces configurados
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })()}
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
                totalUnfilteredItems={pagination.totalUnfilteredItems}
            />
        </div>
    );
};