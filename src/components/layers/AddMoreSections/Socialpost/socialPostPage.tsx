import {ChevronLeft} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {usePreview} from "../../../../context/PreviewContext.tsx";

const PostPage = () => {
    const navigate = useNavigate();
    const { socialPost, setSocialPost } = usePreview();
    const [url, setUrl] = useState(socialPost.url);
    const [note, setNote] = useState(socialPost.note || "");

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleSave = () => {
        setSocialPost({ url, note });
        navigate(-1);
    };

    return (
        <div className="max-w-xl bg-[#1a1a1a] text-white">
            {/* Header */}
            <div className="flex items-center mb-8 mt-3">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Social Post
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 mb-1 block">URL</label>
                    <input
                        type="text"
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500"
                        placeholder="https://..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                </div>

                <div>
                    <label className="text-xs text-gray-400 mb-1 block">Note (optional)</label>
                    <textarea
                        className="bg-[#2a2a2a] w-full rounded-md px-4 py-3 text-sm text-white placeholder:text-gray-500"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <button
                        onClick={handleSave}
                        className="bg-white text-black rounded-full px-4 py-2 text-sm hover:bg-gray-200 transition"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PostPage;
