import {ChevronRight} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Social = () => {

    const navigate = useNavigate();

    const handleSocialClick = () => {
        navigate("/social");
    };

    return (
        <div
            className="bg-[#FAFFF6] rounded-lg p-4 mb-4 flex items-center justify-between cursor-pointer transition-colors"
            onClick={handleSocialClick}
        >
            <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[#0EBBAA] rounded-lg flex items-center justify-center">
                    <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6 12.5C6 9.73858 8.23858 7.5 11 7.5H38C40.7614 7.5 43 9.73858 43 12.5V39.5C43 42.2614 40.7614 44.5 38 44.5H11C8.23858 44.5 6 42.2614 6 39.5V12.5Z"
                            fill="#0EBBAA"/>
                        <path
                            d="M18.5714 28.9285C19.9916 28.9285 21.1429 27.7772 21.1429 26.3571C21.1429 24.9369 19.9916 23.7856 18.5714 23.7856C17.1513 23.7856 16 24.9369 16 26.3571C16 27.7772 17.1513 28.9285 18.5714 28.9285Z"
                            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path
                            d="M30.1428 23.1429C31.563 23.1429 32.7143 21.9916 32.7143 20.5714C32.7143 19.1513 31.563 18 30.1428 18C28.7227 18 27.5714 19.1513 27.5714 20.5714C27.5714 21.9916 28.7227 23.1429 30.1428 23.1429Z"
                            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path
                            d="M30.1428 34.7144C31.563 34.7144 32.7143 33.5631 32.7143 32.143C32.7143 30.7228 31.563 29.5715 30.1428 29.5715C28.7227 29.5715 27.5714 30.7228 27.5714 32.143C27.5714 33.5631 28.7227 34.7144 30.1428 34.7144Z"
                            stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M20.1272 24.3128L27.6486 21.1885M20.1272 28.4013L27.6486 31.5256" stroke="white"
                              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>

                </div>
                <span className="text-black font-medium">Social</span>
            </div>
            <div className="flex items-center space-x-2">
                <ChevronRight size={16} className="text-gray-400"/>
            </div>
        </div>
    );
}

export default Social;
