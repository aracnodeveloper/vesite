import { useCallback } from 'react';
import type { SocialLink, RegularLink, AppLink, WhatsAppLink } from "../interfaces/PreviewContext";
import { socialMediaPlatforms } from "../media/socialPlataforms.ts";

export const useLinkProcessing = () => {
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

        if (iconPath === 'link') return 'link';
        if (iconPath === 'social-post') return 'social-post';
        if (iconPath === 'music-embed') return 'music-embed';
        if (iconPath === 'video-embed') return 'video-embed';

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

    const isWhatsAppLink = useCallback((link: any): boolean => {
        const urlLower = link.url?.toLowerCase() || '';
        const icon = link.icon?.toLowerCase() || '';

        return (
            icon === 'whatsapp' ||
            urlLower.includes('api.whatsapp.com')
        );
    }, []);

    const getStoreType = (link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (labelLower.includes('google play') || urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
    };

    const parseWhatsAppFromUrl = useCallback((url: string, label?: string): { phone: string; message: string; description?: string; } => {
        try {
            let phone = '';
            let message = '';
            let description = label || 'WhatsApp';

            if (url.includes('api.whatsapp.com/send')) {
                const urlParams = new URLSearchParams(url.split('?')[1] || '');
                phone = urlParams.get('phone') || '';
                message = decodeURIComponent(urlParams.get('text') || '');
                description = label || 'WhatsApp';
            }

            phone = phone.replace(/[^\d+]/g, '');

            if (message) {
                try {
                    let decodedMessage = message;
                    let previousMessage = '';

                    while (decodedMessage !== previousMessage) {
                        previousMessage = decodedMessage;
                        decodedMessage = decodeURIComponent(decodedMessage);
                    }

                    message = decodedMessage;
                } catch (decodeError) {
                    console.warn('Error decoding message:', decodeError);
                }
            }

            return { phone, message, description };
        } catch (error) {
            console.error('Error parsing WhatsApp URL:', error);
            return {
                phone: '',
                message: '',
                description: label || 'WhatsApp'
            };
        }
    }, []);

    const isSocialLink = (link: any): boolean => {
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        const socialPlatforms = [
            'instagram', 'tiktok', 'x', 'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord',
            'tumblr', 'whatsapp', 'telegram', 'onlyfans', 'amazon', 'gmail', 'spotify'
        ];

        if (socialPlatforms.includes(iconIdentifier)) {
            return true;
        }

        const socialDomains = [
            'instagram.com', 'tiktok.com', 'twitter.com', 'x.com', 'facebook.com',
            'twitch.tv', 'linkedin.com', 'snapchat.com', 'threads.net',
            'pinterest.com', 'discord.gg', 'discord.com', 'tumblr.com',
            'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'onlyfans.com', 'amazon.com', 'gmail.com', 'spotify.com'
        ];

        const hasSocialDomain = socialDomains.some(domain => {
            return urlLower.includes(`://${domain}/`) || urlLower.includes(`://www.${domain}/`) ||
                urlLower.includes(`://${domain}`) || urlLower.includes(`://www.${domain}`);
        });

        if (hasSocialDomain) {
            return true;
        }

        const exactSocialLabels = [
            'instagram', 'tiktok', 'twitter', 'twitter/x', 'x', 'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord', 'youtube',
            'tumblr', 'whatsapp', 'telegram', 'onlyfans', 'amazon', 'gmail', 'spotify'
        ];

        return exactSocialLabels.some(label => labelLower === label);
    };

    const isEmbedLink = (link: any): boolean => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();
        const iconIdentifier = getIconIdentifier(link.icon);

        if (iconIdentifier === 'social-post' || iconIdentifier === 'music-embed' || iconIdentifier === 'video-embed') {
            return true;
        }

        const embedLabels = [
            'music embed', 'video embed', 'social post', 'embed', 'player',
            'spotify track', 'youtube video', 'youtube.com/watch', 'instagram post', 'music/podcast', 'open.spotify.com/embed'
        ];

        const hasEmbedLabel = embedLabels.some(embedLabel => labelLower.includes(embedLabel));

        if (hasEmbedLabel) {
            return true;
        }

        const isSpotifyTrack = urlLower.includes('spotify.com/track/');
        const isYouTubeVideo = urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/');
        const isInstagramPost = urlLower.includes('instagram.com/p/') || urlLower.includes('instagram.com/reel/');

        return isSpotifyTrack || isYouTubeVideo || isInstagramPost;
    };

    const getEmbedType = (link: any): 'music' | 'social-post' | 'video' | null => {
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();

        if (iconIdentifier === 'music-embed' || iconIdentifier === 'music') {
            return 'music';
        }
        if (iconIdentifier === 'social-post') {
            return 'social-post';
        }
        if (iconIdentifier === 'video-embed' || iconIdentifier === 'video') {
            return 'video';
        }

        if (labelLower.includes('music') || labelLower.includes('podcast')) {
            return 'music';
        }
        if (labelLower.includes('social post') || labelLower.includes('post')) {
            return 'social-post';
        }
        if (labelLower.includes('video')) {
            return 'video';
        }

        if (urlLower.includes('spotify.com/track/')) {
            return 'music';
        }
        if (urlLower.includes('instagram.com/p/') || urlLower.includes('instagram.com/reel/')) {
            return 'social-post';
        }
        if (urlLower.includes('youtube.com/watch') || urlLower.includes('youtu.be/')) {
            return 'video';
        }

        return null;
    };

    const processLinks = (links: any) => {
        const socialLinks: SocialLink[] = [];
        const regularLinks: RegularLink[] = [];
        const appLinks: AppLink[] = [];
        const whatsApplinks: WhatsAppLink[] = [];
        let musicEmbed: any = null;
        let socialPost: any = null;
        let videoEmbed: any = null;

        links.forEach(link => {
            const iconIdentifier = getIconIdentifier(link.icon);

            if (isWhatsAppLink(link)) {
                const { phone, message } = parseWhatsAppFromUrl(link.url);
                whatsApplinks.push({
                    id: link.id,
                    phone,
                    message,
                    description: link.label,
                    isActive: link.isActive
                });
            } else if (isAppStoreLink(link)) {
                appLinks.push({
                    id: link.id,
                    store: getStoreType(link),
                    url: link.url,
                    isActive: link.isActive
                });
            } else if (isEmbedLink(link)) {
                const embedType = getEmbedType(link);

                if (embedType === 'music') {
                    musicEmbed = link;
                } else if (embedType === 'social-post') {
                    socialPost = link;
                } else if (embedType === 'video') {
                    videoEmbed = link;
                }
            } else if (isSocialLink(link)) {
                socialLinks.push({
                    id: link.id,
                    label: link.label,
                    name: link.label,
                    url: link.url,
                    icon: iconIdentifier,
                    color: link.color || '#f3f4f6',
                    isActive: link.isActive
                });
            } else {
                regularLinks.push({
                    id: link.id,
                    title: link.label,
                    url: link.url,
                    image: link.image,
                    orderIndex: link.orderIndex || 0,
                    isActive: link.isActive
                });
            }
        });

        return {
            socialLinks,
            regularLinks: regularLinks.sort((a, b) => a.orderIndex - b.orderIndex),
            appLinks,
            musicEmbed,
            socialPost,
            videoEmbed,
            whatsApplinks
        };
    };

    const findPlatformForLink = (link: SocialLink) => {
        return socialMediaPlatforms.find(platform => {
            const linkLabelLower = link.label.toLowerCase();
            const platformNameLower = platform.name.toLowerCase();
            const platformIdLower = platform.id.toLowerCase();

            return (
                linkLabelLower === platformNameLower ||
                linkLabelLower.includes(platformIdLower) ||
                link.icon === platform.icon ||
                linkLabelLower.replace(/[^a-z0-9]/g, '') === platformNameLower.replace(/[^a-z0-9]/g, '')
            );
        });
    };

    const filterRealSocialLinks = (links: SocialLink[]) => {
        return links.filter(link => {
            if (!link.isActive) return false;

            const excludedKeywords = [
                'open.spotify.com/embed', 'music', 'apple music', 'soundcloud', 'audio',
                'youtube.com/watch', 'video', 'vimeo', 'tiktok video',
                'post', 'publicacion', 'contenido', 'api.whatsapp.com',
                'music embed', 'video embed', 'social post',
                'embed', 'player'
            ];

            const labelLower = link.label.toLowerCase();
            const urlLower = link.url.toLowerCase();

            const isExcluded = excludedKeywords.some(keyword =>
                labelLower.includes(keyword) || urlLower.includes(keyword)
            );

            if (isExcluded) return false;

            if (urlLower.includes("api.whatsapp.com")) {
                return false;
            }

            if (urlLower.includes("wa.me/") || urlLower.includes("whatsapp.com")) {
                return true;
            }

            const platform = findPlatformForLink(link);
            return platform !== undefined && platform !== null;
        });
    };

    return {
        processLinks,
        findPlatformForLink,
        filterRealSocialLinks
    };
};