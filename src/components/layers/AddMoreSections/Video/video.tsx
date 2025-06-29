import {Video} from 'lucide-react';
import {useNavigate} from "react-router-dom";

const Videos =() =>{
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/videos');
    };

    return (
        <div
            onClick={handleProfileClick}
            className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Video size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-black font-medium">Video</div>
                    <div className="text-gray-400 text-sm">Embed a video from YouTube, Twitch, etc</div>
                </div>
            </div>
            <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:border-blue-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
            </div>
        </div>
    );
}

export default Videos;
