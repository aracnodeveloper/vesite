//import {Download} from "lucide-react";
import { useNavigate } from 'react-router-dom';
import React from "react";

const AppD = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate('/app');
    };

    return (
        <>
            <div
                onClick={handleClick}
                className="bg-[#FAFFF6] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer  transition-colors"
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14"><g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 13.5h-1a1 1 0 0 1-1-1v-8h13v8a1 1 0 0 1-1 1h-1"/><path d="M4.5 11L7 13.5L9.5 11M7 13.5v-6M11.29 1a1 1 0 0 0-.84-.5h-6.9a1 1 0 0 0-.84.5L.5 4.5h13zM7 .5v4"/></g></svg>
                    </div>
                    <div>
                        <div className="text-black font-medium">Link de mi App</div>
                        <div className="text-gray-400 text-sm">Links de App</div>
                    </div>
                </div>
                <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                    <span className="text-black text-sm hover:text-white">+</span>
                </div>
            </div>
        </>
    );
}

export default AppD;
