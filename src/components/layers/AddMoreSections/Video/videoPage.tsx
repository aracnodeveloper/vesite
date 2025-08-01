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
        navigate('/sections');
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
        <div className="w-full h-full mb-10 mt-20 max-w-md mx-auto rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 mb-10">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>Videos</h1>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <div className="mb-6">
                    <h3 className="text-black text-sm mb-3">
                        Incluye tus vídeos o transmisiones de YouTube, Vimeo y Twitch en tu página.
                    </h3>
                </div>

                <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                        URL
                    </label>
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="bg-[#FAFFF6] w-full rounded-md px-4 py-3 text-sm text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        Nota (optional)
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-[#FAFFF6] w-full rounded-md px-4 py-3 text-sm text-black placeholder:text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Añade un titulo para el video"
                        disabled={isSubmitting}
                        maxLength={50}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {title.length}/50 caracteres
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`
                            rounded-lg w-32 px-6 py-2 text-sm font-medium transition-all duration-200
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
                            'GUARDAR'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;
