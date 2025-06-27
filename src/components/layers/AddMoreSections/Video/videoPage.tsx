import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePreview } from "../../../../context/PreviewContext.tsx";

const VideoPage = () => {
    const navigate = useNavigate();
    const { getVideoEmbed, setVideoEmbed, loading } = usePreview();

    const [url, setUrl] = useState('');
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Load existing video data
        const existingVideo = getVideoEmbed();
        if (existingVideo) {
            setUrl(existingVideo.url || '');
            setTitle(existingVideo.label || '');
        }
    }, [getVideoEmbed]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await setVideoEmbed(url, title || undefined);
            console.log('Video embed saved successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error saving video embed:', error);
            alert('Error al guardar el video');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidVideoUrl = (url: string) => {
        if (!url.trim()) return false;

        // Check for supported video platforms
        const videoPlatforms = [
            'youtube.com',
            'youtu.be',
            'vimeo.com',
            'twitch.tv',
            'dailymotion.com',
            'wistia.com'
        ];

        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return videoPlatforms.some(platform => url.toLowerCase().includes(platform));
        } catch {
            return false;
        }
    };

    const canSave = url.trim() !== '' && !isSubmitting;

    if (loading) {
        return (
            <div className="max-w-xl bg-[#1a1a1a] text-white px-4 py-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div className="max-w-xl bg-[#1a1a1a] text-white px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-8 mt-3">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                    disabled={isSubmitting}
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Video
                </button>
            </div>

            <div className="space-y-4">
                <div className="mb-6">
                    <h3 className="text-white text-sm mb-3">
                        Feature your YouTube, Vimeo, Twitch videos or streams on your page.
                    </h3>
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        URL *
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.youtube.com/watch?v=..."
                        disabled={isSubmitting}
                    />
                    {url.trim() && !isValidVideoUrl(url) && (
                        <p className="text-xs text-red-400 mt-1">
                            Please enter a valid video URL (YouTube, Vimeo, Twitch, etc.)
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        Title (optional)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Add a title for your video"
                        disabled={isSubmitting}
                        maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {title.length}/50 characters
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`
                            rounded-full px-6 py-2 text-sm font-medium transition-all duration-200
                            ${canSave
                            ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                        `}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                                Saving...
                            </div>
                        ) : (
                            'Save Video'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;