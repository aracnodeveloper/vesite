import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { usePreview } from "../../../../context/PreviewContext.tsx";

const MusicPage = () => {
    const navigate = useNavigate();
    const { getMusicEmbed, setMusicEmbed, loading } = usePreview();

    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const existingMusic = getMusicEmbed();
        if (existingMusic) {
            setUrl(existingMusic.url || '');
            setNote(existingMusic.label || '');
        }
    }, [getMusicEmbed]);

    const handleBackClick = () => {
        navigate('/sections');
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await setMusicEmbed(url, note);
            console.log('Music embed saved successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error saving music embed:', error);
            alert('Error al guardar el embed de música');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return false;

        // Check for common music/podcast platforms
        const musicPlatforms = [
            'spotify.com',
            'soundcloud.com',
            'apple.com/music',
            'music.apple.com',
            'youtube.com',
            'anchor.fm',
            'podcasts.apple.com',
            'podcasts.google.com'
        ];

        return musicPlatforms.some(platform => url.toLowerCase().includes(platform));
    };

    if (loading) {
        return (
            <div className="max-w-xl bg-[#1a1a1a] text-white px-4 py-6 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
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
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>Music/Podcast</h1>
                    </button>
                </div>
            </div>

            <div className="w-full space-y-4 max-w-md mx-auto">
                <div>
                    <label className=" text-gray-600 block mb-2" style={{fontSize:"14px"}}>
                        URL
                    </label>
                    <input
                        type="text"
                        placeholder="https://open.spotify.com/track/... or https://soundcloud.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2  rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500  "
                        disabled={isSubmitting}
                    />
                    {url && !isValidUrl(url) && (
                        <p className="text-red-400 text-xs mt-1">
                            Please enter a valid URL from supported platforms (Spotify, SoundCloud, Apple Music, YouTube, etc.)
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        Nota (optional)
                    </label>
                    <input
                        type="text"
                        placeholder="Añade una nota o descripcciónb sobre este music/podcast"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full h-10 bg-[#FAFFF6] text-xs text-black px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 "
                        disabled={isSubmitting}
                    />
                </div>

                <div className="pt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
                    <button
                        onClick={handleSave}
                        disabled={!url.trim() || !isValidUrl(url) || isSubmitting}
                        className="w-32 text-black bg-[#FAFFF6] px-4 py-2 rounded-lg hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Guardar...
                            </>
                        ) : (
                            'Guardar'
                        )}
                    </button>

                </div>
            </div>
        </div>
    );
};

export default MusicPage;
