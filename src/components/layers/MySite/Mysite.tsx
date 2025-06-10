import {Download} from "lucide-react";
import Profile from "./Profile/profile.tsx";
import Social from "./Social/social.tsx";
import {useState} from "react";
import ProfilePage from "./Profile/profilePage.tsx";


const MySite =() =>{
    const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');

    const handleProfileClick = () => {
        setCurrentView('profile');
    };

    const handleBackToDashboard = () => {
        setCurrentView('dashboard');
    };

    if (currentView === 'profile') {
        return <ProfilePage onBack={handleBackToDashboard} />;
    }
    return (
        <>

            <div className="mb-6">
                <h3 className="text-gray-300 text-sm font-medium mb-4">My Site</h3>

                {/* SELL Section */}
                <div className="mb-6">

                    {/* Digital Download */}
                    <div className="bg-[#2a2a2a] rounded-lg p-4 mb-3 flex items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                <Download size={16} className="text-white" />
                            </div>
                            <div>
                                <div className="text-white font-medium">Digital Download</div>
                                <div className="text-gray-400 text-sm">Sell ebooks, audio files, PDFs and more</div>
                            </div>
                        </div>
                        <div className="w-6 h-6 border border-gray-600 rounded flex items-center justify-center cursor-pointer hover:bg-green-600 hover:border-green-600 transition-colors">
                            <span className="text-white text-sm">+</span>
                        </div>
                    </div>
                    <h4 className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">CONTENT</h4>
                    <Profile onProfileClick={handleProfileClick} />
                    <Social/>

                </div>
            </div>
        </>
    );
}

export default MySite;