import {ChevronRight} from "lucide-react";
import { useNavigate } from "react-router-dom";

const V_Card = () => {


    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/VCard');
    };

    return (
        <div
            className="bg-[#FAFFF6] rounded-lg p-4 mb-4  flex items-center justify-between cursor-pointer transition-colors"
            onClick={handleProfileClick}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white border border-black rounded-lg flex items-center justify-center">
                    <img className="w-20 h-10" src="/src/assets/img/v.png"/>



                </div>
                <span className="text-black font-medium">VCard</span>
            </div>
            <ChevronRight size={16} className="text-gray-400"/>
        </div>
    );
};

export default V_Card;
