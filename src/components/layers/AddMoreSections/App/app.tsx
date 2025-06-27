import {Download} from "lucide-react";
import { useNavigate } from 'react-router-dom';

const AppD = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/app');
    };

    return (
        <>
            <div
                onClick={handleClick}
                className="bg-[#2a2a2a] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <Download size={16} className="text-white" />
                    </div>
                    <div>
                        <div className="text-white font-medium">Descarga Nuestra App</div>
                        <div className="text-gray-400 text-sm">Link Inalterable</div>
                    </div>
                </div>
                <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                    <span className="text-white text-sm">+</span>
                </div>
            </div>
        </>
    );
}

export default AppD;