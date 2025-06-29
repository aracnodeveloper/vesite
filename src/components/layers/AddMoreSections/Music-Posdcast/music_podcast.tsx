import {
    Music,
} from 'lucide-react';
import {useNavigate} from "react-router-dom";

const Musics =() =>{
    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate('/music');
    };
    return (
        <div
            onClick={handleSocialClick}
            className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Music size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-black font-medium">Music / Podcast</div>
                    <div className="text-gray-400 text-sm">Add audio from Spotify, Apple Music, etc</div>
                </div>
            </div>
            <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-purple-600 hover:border-purple-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
            </div>
        </div>
    );
}

export default Musics;
