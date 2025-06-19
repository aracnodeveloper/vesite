import { useState } from 'react';
import { ChevronLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePreview } from "../../../../context/PreviewContext.tsx";

// Import your SVG icons
import instagramIcon from '../../../../assets/icons/instagram.svg';
import discordIcon from '../../../../assets/icons/discord.svg';
import amazonIcon from '../../../../assets/icons/amazon.svg';
import gmailIcon from '../../../../assets/icons/gmail.svg';
import facebookIcon from '../../../../assets/icons/facebook.svg';
import linkdlIcon from '../../../../assets/icons/linkdl.svg';
import musicIcon from '../../../../assets/icons/music.svg';
import onlyfansIcon from '../../../../assets/icons/onlyfans.svg';
import pinterestIcon from '../../../../assets/icons/pinterest.svg';
import spotifyIcon from '../../../../assets/icons/spottufy.svg';
import snapchatIcon from '../../../../assets/icons/snapchat.svg';
import telegramIcon from '../../../../assets/icons/telegram.svg';
import threadsIcon from '../../../../assets/icons/threads.svg';
import tiktokIcon from '../../../../assets/icons/tiktok.svg';
import tumblrIcon from '../../../../assets/icons/tumblr.svg';
import twitchIcon from '../../../../assets/icons/twitch.svg';
import whatsappIcon from '../../../../assets/icons/whatsapp.svg';
import xIcon from '../../../../assets/icons/X.svg';
import youtubeIcon from '../../../../assets/icons/youtube.svg';

// Social media platforms configuration
const socialMediaPlatforms = [
    { id: 'instagram', name: 'Instagram', icon: instagramIcon, color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
    { id: 'tiktok', name: 'TikTok', icon: tiktokIcon, color: 'bg-black' },
    { id: 'twitter', name: 'Twitter/X', icon: xIcon, color: 'bg-black' },
    { id: 'youtube', name: 'YouTube', icon: youtubeIcon, color: 'bg-red-600' },
    { id: 'facebook', name: 'Facebook', icon: facebookIcon, color: 'bg-blue-600' },
    { id: 'twitch', name: 'Twitch', icon: twitchIcon, color: 'bg-purple-600' },
    { id: 'linkedin', name: 'LinkedIn', icon: linkdlIcon, color: 'bg-blue-700' },
    { id: 'snapchat', name: 'Snapchat', icon: snapchatIcon, color: 'bg-yellow-400' },
    { id: 'threads', name: 'Threads', icon: threadsIcon, color: 'bg-black' },
    { id: 'email', name: 'Email', icon: gmailIcon, color: 'bg-gray-600' },
    { id: 'pinterest', name: 'Pinterest', icon: pinterestIcon, color: 'bg-red-500' },
    { id: 'spotify', name: 'Spotify', icon: spotifyIcon, color: 'bg-green-500' },
    { id: 'apple-music', name: 'Apple Music', icon: musicIcon, color: 'bg-gray-800' },
    { id: 'discord', name: 'Discord', icon: discordIcon, color: 'bg-indigo-600' },
    { id: 'tumblr', name: 'Tumblr', icon: tumblrIcon, color: 'bg-blue-800' },
    { id: 'whatsapp', name: 'WhatsApp', icon: whatsappIcon, color: 'bg-green-600' },
    { id: 'telegram', name: 'Telegram', icon: telegramIcon, color: 'bg-blue-500' },
    { id: 'amazon', name: 'Amazon', icon: amazonIcon, color: 'bg-orange-400' },
    { id: 'onlyfans', name: 'OnlyFans', icon: onlyfansIcon, color: 'bg-blue-500' }
];

interface SocialPlatform {
    id: string;
    name: string;
    icon: string;
    color: string;
}

const SocialPage = () => {
    const {
        socialLinks,
        addSocialLink,
        removeSocialLink,
        updateSocialLink,
        loading,
        error
    } = usePreview();

    const [editingPlatform, setEditingPlatform] = useState<SocialPlatform | null>(null);
    const [urlInput, setUrlInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    const handlePlatformSelect = async (platform: SocialPlatform) => {
        const existingLink = socialLinks.find(link => link.name === platform.name);

        if (existingLink) {
            // If link exists, remove it
            try {
                setIsSubmitting(true);
                await removeSocialLink(existingLink.id);
                console.log(`Removed ${platform.name} link`);
            } catch (error) {
                console.error(`Error removing ${platform.name} link:`, error);
            } finally {
                setIsSubmitting(false);
            }
        } else {
            // If link doesn't exist, show form to add it
            setEditingPlatform(platform);
            setUrlInput('');
        }
    };

    const handleSaveLink = async () => {
        if (!editingPlatform || !urlInput.trim()) return;

        try {
            setIsSubmitting(true);

            // Check if this is an update or a new link
            const existingLink = socialLinks.find(link => link.name === editingPlatform.name);

            if (existingLink) {
                // Update existing link
                await updateSocialLink(existingLink.id, {
                    name: editingPlatform.name,
                    url: urlInput.trim(),
                    icon: editingPlatform.icon,
                    color: editingPlatform.color
                });
                console.log(`Updated ${editingPlatform.name} link`);
            } else {
                // Create new link
                const newSocialLink = {
                    id: `temp-${Date.now()}`, // Temporary ID, will be replaced by backend
                    name: editingPlatform.name,
                    url: urlInput.trim(),
                    icon: editingPlatform.icon,
                    color: editingPlatform.color
                };

                await addSocialLink(newSocialLink);
                console.log(`Added ${editingPlatform.name} link`);
            }

            // Reset form
            setEditingPlatform(null);
            setUrlInput('');
        } catch (error) {
            console.error(`Error saving ${editingPlatform.name} link:`, error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingPlatform(null);
        setUrlInput('');
    };

    const getPlaceholderText = (platformName: string): string => {
        const placeholders: { [key: string]: string } = {
            'Instagram': 'https://instagram.com/username',
            'TikTok': 'https://tiktok.com/@username',
            'Twitter/X': 'https://x.com/username',
            'YouTube': 'https://youtube.com/@username',
            'Facebook': 'https://facebook.com/username',
            'Twitch': 'https://twitch.tv/username',
            'LinkedIn': 'https://linkedin.com/in/username',
            'Snapchat': 'https://snapchat.com/add/username',
            'Threads': 'https://threads.net/@username',
            'Email': 'mailto:your@email.com',
            'Pinterest': 'https://pinterest.com/username',
            'Spotify': 'https://open.spotify.com/user/username',
            'Apple Music': 'https://music.apple.com/profile/username',
            'Discord': 'https://discord.gg/servername',
            'Tumblr': 'https://username.tumblr.com',
            'WhatsApp': 'https://wa.me/1234567890',
            'Telegram': 'https://t.me/username',
            'Amazon': 'https://amazon.com/dp/productid',
            'OnlyFans': 'https://onlyfans.com/username'
        };
        return placeholders[platformName] || 'https://example.com';
    };

    const isPlatformActive = (platformName: string) => {
        return socialLinks.some(link => link.name === platformName);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen ">
            {/* Header */}
            <div className=" shadow-sm border-b">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                            disabled={isSubmitting}
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Volver
                        </button>
                        <h1 className="text-lg font-semibold text-white">Redes Sociales</h1>
                       {/* Spacer for centering */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-md mx-auto px-4 py-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                {/* Social Media Platforms Grid */}
                <div className="grid grid-cols-4 gap-4">
                    {socialMediaPlatforms.map((platform) => {
                        const isActive = isPlatformActive(platform.name);

                        return (
                            <button
                                key={platform.id}
                                onClick={() => handlePlatformSelect(platform)}
                                disabled={isSubmitting}
                                className={`
                                    relative p-2 rounded-xl  transition-all duration-200 cursor-pointer
                                    ${isActive
                                    ? ''
                                    : ''
                                }
                                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                                `}
                            >
                                {/* Platform Icon */}
                                <div className="flex flex-col items-center space-y-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${platform.color}`}>
                                        <img
                                            src={platform.icon}
                                            alt={platform.name}
                                            className="w-6 h-6 filter invert brightness-0 contrast-100"
                                        />
                                    </div>

                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* URL Input Modal */}
                {editingPlatform && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 w-full max-w-sm">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Agregar {editingPlatform.name}
                                </h3>
                                <button
                                    onClick={handleCancelEdit}
                                    className="text-gray-400 hover:text-gray-600"
                                    disabled={isSubmitting}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL del perfil
                                </label>
                                <input
                                    type="url"
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder={getPlaceholderText(editingPlatform.name)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveLink}
                                    disabled={!urlInput.trim() || isSubmitting}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isSubmitting ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Active Links Summary */}
                {socialLinks.length > 0 && (
                    <div className="mt-8 p-4 bg-white rounded-xl border border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Enlaces activos ({socialLinks.length})
                        </h3>
                        <div className="space-y-2">
                            {socialLinks.map((link) => (
                                <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={link.icon}
                                            alt={link.name}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-sm font-medium text-gray-700">
                                            {link.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500 truncate ml-2 max-w-32">
                                        {link.url}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SocialPage;