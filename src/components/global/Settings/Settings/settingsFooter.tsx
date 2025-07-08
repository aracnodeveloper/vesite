import React from "react";
import { HelpCircle, FileText, Shield, LogOut } from "lucide-react";

interface SettingsFooterProps {
    onLogout: () => void;
}

const SettingsFooter: React.FC<SettingsFooterProps> = ({ onLogout }) => {
    return (
        <div className="border-t border-[#E0EED5]">
            <div className="p-4 space-y-4">
                {/* Support */}
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                    <HelpCircle size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Support</span>
                </div>

                {/* Terms of Use */}
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                    <FileText size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Terms of Use</span>
                </div>

                {/* Privacy Policy */}
                <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                    <Shield size={20} className="text-gray-400"/>
                    <span className="text-gray-600 text-sm">Privacy Policy</span>
                </div>

                {/* Log Out */}
                <div
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                >
                    <LogOut size={20} className="text-gray-400 hover:text-red-500"/>
                    <span className="text-red-600 text-sm font-medium">Log Out</span>
                </div>
            </div>
        </div>
    );
};

export default SettingsFooter;
