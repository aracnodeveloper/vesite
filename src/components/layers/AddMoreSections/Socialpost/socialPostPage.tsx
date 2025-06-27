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
        <div className="max-w-xl bg-[#1a1a1a] text-white px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-8 mt-3">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                    disabled={isSubmitting}
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Social Post
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 mb-2 block">
                        URL *
                    </label>
                    <input
                        type="url"
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Add a note about this post..."
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
                            'Save'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPage;