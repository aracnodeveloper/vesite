import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { usePreview } from "../../../../context/PreviewContext.tsx";

const PostPage = () => {
    const navigate = useNavigate();
    const { getSocialPost, setSocialPost, loading } = usePreview();

    const [url, setUrl] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Load existing social post data
        const existingPost = getSocialPost();
        if (existingPost) {
            setUrl(existingPost.url || '');
            setNote(existingPost.label || '');
        }
    }, [getSocialPost]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            await setSocialPost(url, note || undefined);
            console.log('Social post saved successfully');
            navigate(-1);
        } catch (error) {
            console.error('Error saving social post:', error);
            alert('Error al guardar el post social');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValidUrl = (url: string) => {
        if (!url.trim()) return false;

        // Check for common social media platforms
        const socialPlatforms = [
            'instagram.com',
            'facebook.com',
            'twitter.com',
            'x.com',
            'tiktok.com',
            'linkedin.com',
            'youtube.com',
            'threads.net',
            'snapchat.com'
        ];

        try {
            new URL(url.startsWith('http') ? url : `https://${url}`);
            return socialPlatforms.some(platform => url.toLowerCase().includes(platform));
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
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>Social Post</h1>
                    </button>
                </div>
            </div>

            <div className="space-y-4 w-full max-w-md mx-auto">
                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        URL
                    </label>
                    <input
                        type="url"
                        className="bg-[#FAFFF6] w-full rounded-md px-4 py-3 text-xs h-10 text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://instagram.com/p/... or https://twitter.com/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={isSubmitting}
                    />
                    {url.trim() && !isValidUrl(url) && (
                        <p className="text-xs text-red-400 mt-1">
                            Please enter a valid social media URL
                        </p>
                    )}
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        Note (optional)
                    </label>
                    <textarea
                        className="bg-[#FAFFF6] w-full  rounded-md px-4 py-3 text-xs text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Añade un titulo para este post"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        disabled={isSubmitting}
                        maxLength={100}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        {note.length}/100 characters
                    </p>
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        disabled={!canSave}
                        className={`
                            rounded-lg w-32  px-6 py-2 text-sm  transition-all duration-200
                            ${canSave
                            ? 'bg-white text-black hover:bg-gray-200 cursor-pointer'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }
                        `}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-lg h-4 w-4 border-b-2 border-current mr-2"></div>
                                Guardando...
                            </div>
                        ) : (
                            'Guardar'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
