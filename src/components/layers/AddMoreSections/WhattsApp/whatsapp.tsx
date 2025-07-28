import { useNavigate } from 'react-router-dom';
import {WhatsAppOutlined} from "@ant-design/icons";

const WhatsApp = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/whattsApp');
    };

    return (
        <>
            <div
                onClick={handleClick}
                className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <WhatsAppOutlined size={16} className="text-white" style={{color:'white'}} />
                    </div>
                    <div>
                        <div className="text-black font-medium">Contactame</div>
                        <div className="text-gray-400 text-sm">WhatsAppeame</div>
                    </div>
                </div>
                <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                    <span className="text-black text-sm hover:text-white">+</span>
                </div>
            </div>
        </>
    );
}

export default WhatsApp;
