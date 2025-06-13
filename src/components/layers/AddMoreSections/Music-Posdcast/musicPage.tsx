import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {usePreview} from "../../../../context/PreviewContext.tsx";

const MusicPage = () => {
    const navigate = useNavigate();
    const { musicEmbedUrl, musicNote, setMusicEmbedUrl, setMusicNote } = usePreview();
    const [url, setUrl] = useState(musicEmbedUrl || '');
    const [note, setNote] = useState(musicNote || '');

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleSave = () => {
        setMusicEmbedUrl(url);
        setMusicNote(note);
    };

    return (
        <div className="max-w-xl bg-[#1a1a1a] text-white  px-4 py-6">
            {/* Header */}
            <div className="flex items-center mb-8 mt-3">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Music / Podcast
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">URL</label>
                    <input
                        type="text"
                        placeholder="https://open.spotify.com/track/..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-md focus:outline-none"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-400 block mb-1">Note (optional)</label>
                    <input
                        type="text"
                        placeholder="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2 rounded-md focus:outline-none"
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="mt-4 bg-purple-600 px-4 py-2 rounded-md w-full hover:bg-purple-700 transition"
                >
                    Save
                </button>
            </div>
        </div>
    );
};

export default MusicPage;
