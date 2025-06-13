import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {usePreview} from "../../../../context/PreviewContext.tsx";

const VideoPage = () => {
    const navigate = useNavigate();
    const { videoUrl, videoTitle, setVideoUrl, setVideoTitle } = usePreview();

    const [url, setUrl] = useState(videoUrl || '');
    const [title, setTitle] = useState(videoTitle || '');


    const handleBackClick = () => {
        navigate(-1);
    };

    const handleSave = () => {
        setVideoUrl(url);
        setVideoTitle(title);
        navigate(-1);
    };

    return (
        <div className="p-6 max-w-xl mx-auto">
            <button
                onClick={handleBackClick}
                className="flex items-center text-gray-300 hover:text-white mb-6"
            >
                <ChevronLeft size={16} className="mr-2" />
                Video
            </button>

            <h3 className="text-white text-sm mb-3">Feature your YouTube, Vimeo, Twitch videos or streams on your page.</h3>

            <label className="text-xs text-gray-400 mb-1 block">URL</label>
            <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-[#1f1f1f] text-white p-3 rounded-lg w-full mb-4"
                placeholder="https://www.youtube.com/watch?v=..."
            />

            <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-[#1f1f1f] text-white p-3 rounded-lg w-full mb-6"
                placeholder="Add a title"
            />

            <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            >
                Save Video
            </button>
        </div>
    );
};

export default VideoPage;
