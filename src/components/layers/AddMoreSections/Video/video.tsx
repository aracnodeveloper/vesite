//import {Video} from 'lucide-react';
import {useNavigate} from "react-router-dom";
import {VideoCameraOutlined} from "@ant-design/icons";
import {ChevronRight} from "lucide-react";

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
                    <VideoCameraOutlined  style={{color:'white'}}/>
                </div>
                <div>
                    <div className="text-black font-medium">Video</div>
                    <div className="text-gray-400 text-sm">Añade un video de Youtube que quieras mostrar </div>
                </div>
            </div>
            <ChevronRight size={16} className="text-black"/>
        </div>
    );
}

export default Videos;
