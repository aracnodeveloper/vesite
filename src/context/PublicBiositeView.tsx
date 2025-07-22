import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { BiositeFull } from "../interfaces/Biosite";
import type { SocialLink, RegularLink, AppLink } from "../interfaces/PreviewContext";
import apiService from "../service/apiService";
import LivePreviewContent from "../components/Preview/LivePreviewContent";

interface PublicBiositeData {
    biosite: BiositeFull;
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    appLinks: AppLink[];
}

const PublicBiositeView = () => {
    const { slug } = useParams<{ slug: string }>();
    const [biositeData, setBiositeData] = useState<PublicBiositeData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getIconIdentifier = (iconPath: string): string => {
        const iconMap: { [key: string]: string } = {
            '/assets/icons/instagram.svg': 'instagram',
            '/assets/icons/tiktok.svg': 'tiktok',
            '/assets/icons/X.svg': 'twitter',
            '/assets/icons/facebook.svg': 'facebook',
            '/assets/icons/twitch.svg': 'twitch',
            '/assets/icons/linkdl.svg': 'linkedin',
            '/assets/icons/snapchat.svg': 'snapchat',
            '/assets/icons/threads.svg': 'threads',
            '/assets/icons/gmail.svg': 'email',
            '/assets/icons/pinterest.svg': 'pinterest',
            '/assets/icons/spottufy.svg': 'spotify',
            '/assets/icons/music.svg': 'apple-music',
            '/assets/icons/discord.svg': 'discord',
            '/assets/icons/tumblr.svg': 'tumblr',
            '/assets/icons/whatsapp.svg': 'whatsapp',
            '/assets/icons/telegram.svg': 'telegram',
            '/assets/icons/amazon.svg': 'amazon',
            '/assets/icons/onlyfans.svg': 'onlyfans',
            '/assets/icons/appstore.svg': 'appstore',
            '/assets/icons/googleplay.svg': 'googleplay'
        };

        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    };

    const isAppStoreLink = (link: any): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        return (
            labelLower.includes('app store') ||
            labelLower.includes('appstore') ||
            urlLower.includes('apps.apple.com') ||
            labelLower.includes('google play') ||
            labelLower.includes('googleplay') ||
            urlLower.includes('play.google.com')
        );
    };

    const getStoreType = (link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    };

    const processLinks = (links: any[]) => {
        const socialLinks: SocialLink[] = [];
        const regularLinks: RegularLink[] = [];
        const appLinks: AppLink[] = [];

        links.forEach(link => {
            if (isAppStoreLink(link)) {
                appLinks.push({
                    id: link.id,
                    store: getStoreType(link),
                    url: link.url,
                    isActive: link.isActive
                });
            } else if (link.type === 'social') {
                socialLinks.push({
                    id: link.id,
                    label: link.label,
                    url: link.url,
                    icon: link.icon,
                    color: link.color || '#3B82F6',
                    isActive: link.isActive
                });
            } else {
                regularLinks.push({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: undefined,
                    orderIndex: link.orderIndex || 0,
                    isActive: link.isActive
                });
            }
        });

        return {
            socialLinks,
            regularLinks: regularLinks.sort((a, b) => a.orderIndex - b.orderIndex),
            appLinks
        };
    };

    useEffect(() => {
        const fetchBiositeBySlug = async () => {
            if (!slug) {
                setError("No se proporcionó un slug válido");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                // Llamar al endpoint que creaste en el backend
                const biosite = await apiService.getById<BiositeFull>('/biosites/slug', slug);

                if (!biosite) {
                    setError("Biosite no encontrado");
                    setLoading(false);
                    return;
                }

                // Procesar los links
                const { socialLinks, regularLinks, appLinks } = processLinks(biosite.links || []);

                setBiositeData({
                    biosite,
                    socialLinks,
                    regularLinks,
                    appLinks
                });

            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || "Error al cargar el biosite";
                setError(errorMessage);
                console.error('Error fetching biosite by slug:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBiositeBySlug();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando biosite...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Biosite no encontrado</h1>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        Ir al inicio
                    </button>
                </div>
            </div>
        );
    }

    if (!biositeData) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">No se pudo cargar el biosite</p>
                </div>
            </div>
        );
    }

    // Crear un contexto mock para el LivePreviewContent
    const mockPreviewContext = {
        biosite: biositeData.biosite,
        socialLinks: biositeData.socialLinks,
        regularLinks: biositeData.regularLinks,
        themeColor: biositeData.biosite.colors,
        fontFamily: biositeData.biosite.fonts || 'Inter',
        loading: false,
        error: null
    };


    return (
        <div className="min-h-screen">
            <LivePreviewContent
            />
        </div>
    );
};

export default PublicBiositeView;
