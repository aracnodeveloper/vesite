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
import imgP6 from "../../assets/img/img_6.png"
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { usePreview } from "../../context/PreviewContext.tsx";

import LivePreviewContent from "../Preview/LivePreviewContent";
import PhonePreview from "../Preview/phonePreview.tsx";

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const { biosite } = usePreview();
    const [activeItem, setActiveItem] = useState<string>("layers");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const handleExpoced = () => {
        if (biosite?.slug) {
            navigate("/expoced");
        } else {
            console.warn("No hay slug disponible para la navegación");
            // Opcional: mostrar una notificación al usuario o manejar el caso
        }
    };

    const sidebarItems = [
        { icon: Layers, label: "Layers", id: "layers", to: "/sections", color: "green" },
        { icon: Droplet, label: "Droplet", id: "droplet", to: "/droplet", color: "orange" },
        { icon: BarChart3, label: "Analytics", id: "analytics", to: "/analytics", color: "blue" },
    ];

    // Function to validate and get avatar image
    const getAvatarImage = () => {
        if (avatarError || !biosite?.avatarImage) {
            return imgP; // Fallback to default static image
        }

        // Check if it's a valid image URL
        if (typeof biosite.avatarImage === 'string' && biosite.avatarImage.trim()) {
            if (biosite.avatarImage.startsWith('data:')) {
                // Validate base64 data URL
                const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
                return dataUrlRegex.test(biosite.avatarImage) ? biosite.avatarImage : imgP;
            }

            try {
                new URL(biosite.avatarImage);
                return biosite.avatarImage;
            } catch {
                return imgP;
            }
        }

        return imgP;
    };

    const handleAvatarError = () => {
        setAvatarError(true);
    };

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

    // Reset avatar error when biosite avatar changes
    useEffect(() => {
        setAvatarError(false);
    }, [biosite?.avatarImage]);

    const handleItemClick = (item: any) => {
        setActiveItem(item.id);
        navigate(item.to);
        setIsMobileMenuOpen(false);
    };

    const getItemStyles = (item: any) => {
        if (activeItem === item.id) {
            const colorClasses = {
                green: "text-green-600 border-l-4 border-green-300 lg:border-l-4 ",
                orange: "text-orange-600 border-l-4 border-orange-300 lg:border-l-4 ",
                blue: "text-blue-600 border-l-4 border-blue-300 lg:border-l-4 ",
            };
            return colorClasses[item.color as keyof typeof colorClasses] + " ";
        }
        return "text-gray-600 hover:text-gray-300 ";
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row h-screen bg-[#E0EED5]  p-2 sm:p-4  overflow-x-hidden md:overflow-y-hidden" >

                <div  className="lg:hidden flex items-center justify-between p-4 bg-[#FAFFF6] rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                        <img
                            src={getAvatarImage()}
                            className="w-8 h-8 rounded-xl object-cover"
                            alt="perfil"
                            onError={handleAvatarError}
                        />
                        <span className="text-white font-medium">Dashboard</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={togglePreview}
                            className="p-2 text-gray-400 hover:text-black transition-colors md:hidden cursor-pointer"
                            title="Toggle Preview"
                        >
                            <Smartphone size={20} />
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-gray-400 hover:text-black transition-colors cursor-pointer"
                        >
                            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-[#FAFFF6] rounded-lg mb-2 p-4">
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
                <div className="hidden lg:flex w-14 xl:w-14 bg-[#FAFFF6] shadow-lg mt-5 mb-4 flex-col items-center space-y-6 rounded-full mr-4">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                        <img
                            src={getAvatarImage()}
                            className="rounded-full w-8 h-8 xl:w-10 xl:h-10 object-cover"
                            alt="perfil"
                            onError={handleAvatarError}
                        />
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
                <div className="flex-1 flex flex-col pt-0 p-0 lg:flex-row min-h-screen ">
                    <main
                        className={`${
                            showPreview && window.innerWidth >= 768 ? "lg:flex-1" : "flex-1"
                        } flex justify-center items-center  overflow-y-auto p-3 sm:p-6 min-h-screen`}
                        style={{
                            background: `url(${imgP6}) no-repeat center center`,
                            backgroundSize: 'cover',
                            backgroundColor: 'white',
                        }}
                    >
                        {children}
                    </main>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[800px] mt-0 lg:mt-0 p-0 md:p-0 flex justify-center items-center relative">
                            {/* Background difuminado con avatar */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{

                                    backgroundSize: 'cover',
                                    filter: 'blur(40px)',
                                    transform: 'scale(1.1)', // Evita bordes difuminados
                                }}
                            />

                            {/* Background overlay con imgP6 */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'white',
                                    backgroundSize: 'cover',
                                    height:'100%',
                                    opacity: 0.6,
                                }}
                            />

                            {/* Contenido del preview (celular) */}
                            <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center z-50 relative">
                                <div onClick={handleExpoced} className="absolute cursor-pointer text-xs top-10 bg-[#464C3666] rounded-full p-2  left-20 text-white mb-4 text-center z-60">
                                    URL: bio.site/{biosite?.slug || 'tu-slug'}
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
