import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Layers,
    Droplet,
    BarChart3,
    Menu,
    X,
    Smartphone,
    LogOut,
} from "lucide-react";
import { Dialog } from "@headlessui/react";

import imgP from "../../assets/img/img.png";
import { useAuthContext } from "../../hooks/useAuthContext.ts";

import LivePreviewContent from "../Preview/LivePreviewContent";
import PhonePreview from "../Preview/phonePreview.tsx";


interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const [activeItem, setActiveItem] = useState<string>("layers");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);



    const sidebarItems = [
        { icon: Layers, label: "Layers", id: "layers", to: "/sections", color: "green" },
        { icon: Droplet, label: "Droplet", id: "droplet", to: "/droplet", color: "orange" },
        { icon: BarChart3, label: "Analytics", id: "analytics", to: "/analytics", color: "blue" },
    ];

    const showLogoutModal = () => setIsLogoutDialogOpen(true);
    const handleCancelLogout = () => setIsLogoutDialogOpen(false);
    const handleConfirmLogout = () => {
        setIsLogoutDialogOpen(false);
        logout();
        navigate("/login");
    };

    useEffect(() => {
        const currentItem = sidebarItems.find((item) => item.to === location.pathname);
        if (currentItem) {
            setActiveItem(currentItem.id);
        }
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
                setShowPreview(true);
            } else if (window.innerWidth < 768) {
                setShowPreview(false);
            }
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleItemClick = (item: any) => {
        setActiveItem(item.id);
        navigate(item.to);
        setIsMobileMenuOpen(false);
    };

    const getItemStyles = (item: any) => {
        if (activeItem === item.id) {
            const colorClasses = {
                green: "text-green-600 border-l-4 border-green-300 lg:border-l-4 md:border-b-2 md:border-l-0",
                orange: "text-orange-600 border-l-4 border-orange-300 lg:border-l-4 md:border-b-2 md:border-l-0",
                blue: "text-blue-600 border-l-4 border-blue-300 lg:border-l-4 md:border-b-2 md:border-l-0",
            };
            return colorClasses[item.color as keyof typeof colorClasses] + " shadow-sm bg-gray-700/50";
        }
        return "text-gray-600 hover:text-white hover:bg-gray-700/30";
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row h-screen bg-[#1b1b1b] p-2 sm:p-4">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                        <img src={imgP} className="w-8 h-8 rounded-lg" alt="perfil" />
                        <span className="text-white font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={togglePreview}
                            className="p-2 text-gray-400 hover:text-white transition-colors md:hidden cursor-pointer"
                            title="Toggle Preview"
                        >
                            <Smartphone size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-[#2a2a2a] rounded-lg mb-2 p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {sidebarItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item)}
                                    className={`p-3 rounded-lg transition-all duration-200 cursor-pointer flex flex-col items-center space-y-1 ${getItemStyles(item)}`}
                                >
                                    <item.icon size={20} />
                                    <span className="text-xs">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Desktop Sidebar */}
                <div className="hidden lg:flex w-14 xl:w-14 bg-[#2a2a2a] shadow-lg mt-5 mb-4 flex-col items-center space-y-6 rounded-full mr-4">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                        <img src={imgP} className="rounded-xl w-8 h-8 xl:w-10 xl:h-10" alt="perfil" />
                    </button>

                    <div className="flex flex-col space-y-4 mt-7">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`p-2 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(item)}`}
                                title={item.label}
                            >
                                <item.icon size={20} />
                            </button>
                        ))}
                    </div>

                    {/* Logout Button */}
                    <div className="mt-auto mb-4 z-10">
                        <button
                            onClick={showLogoutModal}
                            className="p-2 text-gray-500 hover:text-red-500 transition-colors cursor-pointer z-10"
                            title="Logout"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    <main
                        className={`${
                            showPreview && window.innerWidth >= 768 ? "lg:flex-1" : "flex-1"
                        } flex justify-center items-center rounded-2xl shadow-sm overflow-y-auto p-3 sm:p-6 min-h-0`}
                    >
                        {children}
                    </main>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="w-full md:w-[400px] lg:w-[500px] xl:w-[600px] 2xl:w-[700px] mt-4 lg:mt-0 lg:ml-4 p-2 sm:p-4 rounded-2xl shadow-inner flex justify-center items-center bg-[#2a2a2a]/20">
                            <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center">
                                <div className="absolute text-xs top-10 left-2/3 text-white mb-4 text-center">
                                    URL: bio.site/anthonyrmch
                                </div>
                                <PhonePreview>
                                    <LivePreviewContent />
                                </PhonePreview>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile toggle preview */}
                <button
                    onClick={togglePreview}
                    className="hidden md:block lg:hidden fixed bottom-4 right-4 p-3 bg-[#2a2a2a] rounded-full shadow-lg text-gray-400 hover:text-white transition-colors z-50"
                    title={showPreview ? "Hide Preview" : "Show Preview"}
                >
                    {showPreview ? <X size={20} /> : <Smartphone size={20} />}
                </button>
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog
                open={isLogoutDialogOpen}
                onClose={handleCancelLogout}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            >
                <Dialog.Panel className="bg-[#2a2a2a] rounded-lg p-6 w-[90%] max-w-sm text-white shadow-xl">
                    <Dialog.Title className="text-lg font-semibold mb-4">Cerrar sesión</Dialog.Title>
                    <p className="text-sm mb-6">¿Estás seguro que deseas cerrar sesión?</p>
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={handleCancelLogout}
                            className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-sm cursor-pointer"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirmLogout}
                            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-sm cursor-pointer"
                        >
                            Cerrar sesión
                        </button>
                    </div>
                </Dialog.Panel>
            </Dialog>
        </>
    );
};

export default Layout;
