import { useCallback } from 'react';
import type { SocialLink, RegularLink, AppLink, WhatsAppLink } from "../interfaces/PreviewContext";
import { socialMediaPlatforms } from "../media/socialPlataforms.ts";

// Define LINK_TYPES constant
export const LINK_TYPES = {
    SOCIAL: 'social',
    REGULAR: 'regular',
    APP: 'app',
    WHATSAPP: 'whatsapp',
    MUSIC: 'music',
    VIDEO: 'video',
    SOCIAL_POST: 'social-post'
} as const;

export const useLinkProcessing = () => {
    // Enhanced link type detection with fallback logic
    const detectLinkType = useCallback((link: any): string => {
        // If link_type is explicitly set and not null, use it
        if (link.link_type && link.link_type !== null) {
            return link.link_type;
        }

        // Fallback detection based on icon, URL, and label patterns
        const iconIdentifier = getIconIdentifier(link.icon);
        const labelLower = link.label?.toLowerCase() || '';
        const urlLower = link.url?.toLowerCase() || '';

        // WhatsApp detection
        if (iconIdentifier === 'whatsapp' ||
            urlLower.includes('api.whatsapp.com')) {
            return LINK_TYPES.WHATSAPP;
        }

        // App store detection
        if (iconIdentifier === 'appstore' ||
            iconIdentifier === 'googleplay' ||
            labelLower.includes('app store') ||
            labelLower.includes('google play') ||
            urlLower.includes('apps.apple.com') ||
            urlLower.includes('play.google.com')) {
            return LINK_TYPES.APP;
        }

        // Embed content detection
        if (iconIdentifier === 'music-embed' ||
            labelLower.includes('music') ||
            labelLower.includes('podcast') ||
            urlLower.includes('spotify.com/track/') ||
            urlLower.includes('open.spotify.com')) {
            return LINK_TYPES.MUSIC;
        }

        if (iconIdentifier === 'video-embed' ||
            labelLower.includes('video') ||
            urlLower.includes('youtube.com/watch') ||
            urlLower.includes('youtu.be/')) {
            return LINK_TYPES.VIDEO;
        }

        if (iconIdentifier === 'social-post' ||
            labelLower.includes('social post') ||
            labelLower.includes('post') ||
            (urlLower.includes('instagram.com') &&
                (urlLower.includes('/p/') || urlLower.includes('/reel/')))) {
            return LINK_TYPES.SOCIAL_POST;
        }

        // Social platform detection
        const socialPlatforms = [
            'instagram', 'tiktok', 'x', 'twitter', 'facebook', 'twitch',
            'linkedin', 'snapchat', 'threads', 'pinterest', 'discord',
            'tumblr', 'telegram', 'onlyfans', 'amazon', 'gmail', 'spotify', 'youtube'
        ];

        const isSocialIcon = socialPlatforms.includes(iconIdentifier);
        const isSocialDomain = socialPlatforms.some(platform =>
            urlLower.includes(`${platform}.com`) ||
            urlLower.includes(`${platform}.net`) ||
            urlLower.includes(`${platform}.tv`)
        );
        const isSocialLabel = socialPlatforms.some(platform =>
            labelLower === platform || labelLower.includes(platform)
        );

        if (isSocialIcon || isSocialDomain || isSocialLabel) {
            // Special case: YouTube channels should be social, but YouTube videos should be video
            if (urlLower.includes('youtube.com/@') ||
                (urlLower.includes('youtube.com') && !urlLower.includes('/watch'))) {
                return LINK_TYPES.SOCIAL;
            }
            return LINK_TYPES.SOCIAL;
        }

        // Default to regular link
        return LINK_TYPES.REGULAR;
    }, []);

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

        // Handle direct icon identifiers
        if (iconPath === 'link') return 'link';
        if (iconPath === 'social-post') return 'social-post';
        if (iconPath === 'music-embed') return 'music-embed';
        if (iconPath === 'video-embed') return 'video-embed';
        if (iconPath === 'whatsapp') return 'whatsapp';
        if (iconPath === 'appstore') return 'appstore';
        if (iconPath === 'googleplay') return 'googleplay';

        // Handle malformed icons (like "svg%3e")
        if (iconPath === 'svg%3e' || iconPath.includes('%')) {
            return 'link'; // Default fallback for malformed icons
        }

        // Find full path match
        const fullPath = Object.keys(iconMap).find(path => path.includes(iconPath));
        if (fullPath) return iconMap[fullPath];

        // Extract filename
        const fileName = iconPath.split('/').pop()?.replace('.svg', '') || 'link';
        return fileName.toLowerCase();
    };

    const parseWhatsAppFromUrl = useCallback((url: string, label?: string): { phone: string; message: string; description?: string; } => {
        try {
            let phone = '';
            let message = '';
            let description = label || 'WhatsApp';

            if (url.includes('api.whatsapp.com/send') || url.includes('wa.me/')) {
                const urlParams = new URLSearchParams(url.split('?')[1] || '');
                phone = urlParams.get('phone') || '';
                message = decodeURIComponent(urlParams.get('text') || '');
                description = label || 'WhatsApp';

                // Extract phone from wa.me URLs
                if (url.includes('wa.me/') && !phone) {
                    const match = url.match(/wa\.me\/([0-9+]+)/);
                    if (match) {
                        phone = match[1];
                    }
                }
            }

            // Clean phone number
            phone = phone.replace(/[^\d+]/g, '');

            // Decode message properly
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

    const getStoreType = (link: any): 'appstore' | 'googleplay' => {
        const labelLower = link.label.toLowerCase();
        const urlLower = link.url.toLowerCase();
        const iconIdentifier = getIconIdentifier(link.icon);

        if (iconIdentifier === 'googleplay' ||
            labelLower.includes('google play') ||
            urlLower.includes('play.google.com')) {
            return 'googleplay';
        }
        return 'appstore';
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
            const detectedType = detectLinkType(link);
            const iconIdentifier = getIconIdentifier(link.icon);

            switch (detectedType) {
                case LINK_TYPES.WHATSAPP:
                    const { phone, message } = parseWhatsAppFromUrl(link.url);
                    whatsApplinks.push({
                        id: link.id,
                        phone,
                        message,
                        description: link.label,
                        isActive: link.isActive
                    });
                    break;

                case LINK_TYPES.APP:
                    appLinks.push({
                        id: link.id,
                        store: getStoreType(link),
                        url: link.url,
                        isActive: link.isActive
                    });
                    break;

                case LINK_TYPES.MUSIC:
                    if (!musicEmbed || link.isActive) {
                        musicEmbed = link;
                    }
                    break;

                case LINK_TYPES.SOCIAL_POST:
                    if (!socialPost || link.isActive) {
                        socialPost = link;
                    }
                    break;

                case LINK_TYPES.VIDEO:
                    if (!videoEmbed || link.isActive) {
                        videoEmbed = link;
                    }
                    break;

                case LINK_TYPES.SOCIAL:
                    socialLinks.push({
                        id: link.id,
                        label: link.label,
                        name: link.label,
                        url: link.url,
                        icon: iconIdentifier,
                        color: link.color || '#f3f4f6',
                        isActive: link.isActive,
                        link_type: detectedType // Add the detected type for reference
                    });
                    break;

                case LINK_TYPES.REGULAR:
                default:
                    regularLinks.push({
                        id: link.id,
                        title: link.label,
                        url: link.url,
                        image: link.image,
                        orderIndex: link.orderIndex || 0,
                        isActive: link.isActive
                    });
                    break;
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

            const detectedType = detectLinkType(link);

            // Only include links that are actually social type
            if (detectedType !== LINK_TYPES.SOCIAL) {
                return false;
            }

            // Additional validation: ensure the link has a valid platform match
            const platform = findPlatformForLink(link);
            return platform !== undefined && platform !== null;
        });
    };

    return {
        processLinks,
        findPlatformForLink,
        filterRealSocialLinks,
        detectLinkType,
        LINK_TYPES
    };
};