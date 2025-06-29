import {Instagram} from "lucide-react";
import {useNavigate} from "react-router-dom";


const Post =() =>{
    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate('/post');
    };
    return (
        <div
            onClick={handleSocialClick}
            className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors">
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                    <Instagram size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-black font-medium">Social Post</div>
                    <div className="text-gray-400 text-sm">Showcase a post from a social media account</div>
                </div>
            </div>
            <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-pink-600 hover:border-pink-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
            </div>
        </div>
    );
}

export default Post;
