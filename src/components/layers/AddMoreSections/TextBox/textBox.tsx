import {FileText} from "lucide-react";
import {useNavigate} from "react-router-dom";

const TextBox =() =>{
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/textBox');
    };

    return (
        <div className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors"
             onClick={handleProfileClick}>
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-white" />
                </div>
                <div>
                    <div className="text-black font-medium">Text Box</div>
                    <div className="text-gray-400 text-sm">Share a note with a few words</div>
                </div>
            </div>
            <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-blue-600 hover:border-blue-600 transition-colors">
                <span className="text-black text-sm hover:text-white">+</span>
            </div>
        </div>
    );
}

export default TextBox;
