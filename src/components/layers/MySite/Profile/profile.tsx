import {ChevronRight, User} from "lucide-react";

interface ProfileProps {
    onProfileClick: () => void;
}

const Profile = ({ onProfileClick }: ProfileProps) => {
    return (
        <>
            <div
            className="bg-[#2a2a2a]  rounded-lg p-4 mb-4 flex  items-center justify-between cursor-pointer hover:bg-[#323232] transition-colors"
            onClick={onProfileClick}
            >
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <User size={16} className="text-white" />
                    </div>
                    <span className="text-white font-medium">Profile</span>
                </div>
                <ChevronRight size={16} className="text-gray-400" />
            </div>
        </>
    );
};

export default Profile;