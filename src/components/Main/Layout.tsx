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
    RefreshCw,
    Share2,
} from "lucide-react";
import { Dialog } from "@headlessui/react";

import imgP from "../../assets/img/img.png";
import imgP6 from "../../assets/img/img_6.png"
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useChangeDetection } from "../../hooks/useChangeDetection.ts";
import { useUpdateShareActions } from "../../hooks/useUpdateShareActions.ts";

import LivePreviewContent from "../Preview/LivePreviewContent.tsx";
import PhonePreview from "../Preview/phonePreview.tsx";
import SettingsModal from "../global/Settings/SettingsModal.tsx";

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const { biosite } = usePreview();
    const { hasChanges, markAsSaved, resetChangeDetection } = useChangeDetection();
    const { isUpdating, handleUpdate, handleShare } = useUpdateShareActions();

    const [activeItem, setActiveItem] = useState<string>("layers");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const handleExpoced = () => {
        if (biosite?.slug) {
            navigate("/expoced");
        } else {
            console.warn("No hay slug disponible para la navegación");
        }
    };

    // Función para manejar el botón de actualizar/compartir
    const handleUpdateShareAction = async () => {
        if (hasChanges) {
            await handleUpdate();
            markAsSaved();
        } else {
            await handleShare();
        }
    };

    // Resetear detección de cambios cuando cambie el biosite
    useEffect(() => {
        if (biosite) {
            resetChangeDetection();
        }
    }, [biosite?.id]);

    const sidebarItems = [
        { icon: Layers, label: "Layers", id: "layers", to: "/sections", color: "green" },
        { icon: Droplet, label: "Droplet", id: "droplet", to: "/droplet", color: "orange" },
        { icon: BarChart3, label: "Analytics", id: "analytics", to: "/analytics", color: "blue" },
    ];

    // Function to validate and get avatar image
    const getAvatarImage = () => {
        if (avatarError || !biosite?.avatarImage) {
            return imgP;
        }

        if (typeof biosite.avatarImage === 'string' && biosite.avatarImage.trim()) {
            if (biosite.avatarImage.startsWith('data:')) {
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

    const handleOpenSettings = () => setIsSettingsModalOpen(true);
    const handleCloseSettings = () => setIsSettingsModalOpen(false);

    const handleLogoutFromSettings = () => {
        setIsSettingsModalOpen(false);
        logout();
        navigate("/login");
    };

    const handleProfileSelect = (profile: any) => {
        console.log("Profile selected:", profile);
    };

    const handleCreateNewSite = () => {
        console.log("Create new site");
        navigate("/create-site");
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

    const isAnalyticsRoute = location.pathname === '/analytics';

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
                green: "text-[#98C022] border-l-4 border-[#98C022] lg:border-l-4 ",
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

    // Determinar el texto y el ícono del botón
    const getButtonContent = () => {
        if (isUpdating) {
            return {
                text: "Actualizando...",
                icon: <RefreshCw className="w-3 h-3 animate-spin" />,
                disabled: true
            };
        }

        if (hasChanges) {
            return {
                text: "Actualizar",
                icon: <RefreshCw className="w-3 h-3" />,
                disabled: false
            };
        }

        return {
            text: "Compartir",
            icon: <Share2 className="w-3 h-3" />,
            disabled: false
        };
    };

    const buttonContent = getButtonContent();

    return (
        <>
            <div className="flex flex-col lg:flex-row h-screen bg-[#E0EED5] p-2 sm:p-4 overflow-x-hidden md:overflow-y-hidden">
                <div className="lg:hidden flex items-center justify-between p-4 bg-[#FAFFF6] rounded-lg mb-2">
                    <div className="flex items-center space-x-3">
                        <img
                            src={getAvatarImage()}
                            onClick={handleOpenSettings}
                            className="w-8 h-8 rounded-xl object-cover"
                            alt="perfil"
                            onError={handleAvatarError}
                        />
                        <span className="text-gray-600 font-medium">Ve_Site</span>
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
                <div className="hidden lg:flex w-16 xl:w-14 bg-[#FAFFF6] shadow-lg mt-10 mb-4 flex-col items-center space-y-6 rounded-full mr-4">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                        <img
                            src={getAvatarImage()}
                            onClick={handleOpenSettings}
                            className="rounded-full w-10 h-10 xl:w-10 xl:h-10 object-cover"
                            alt="perfil"
                            onError={handleAvatarError}
                        />
                    </button>

                    <div className="flex flex-col space-y-4 mt-7">
                        {sidebarItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item)}
                                className={`p-4 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(item)}`}
                                title={item.label}
                            >
                                <item.icon size={20} />
                            </button>
                        ))}
                    </div>

                    {/* Settings Button */}
                    <div className="mt-auto z-10">
                        <button
                            onClick={handleOpenSettings}
                            className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
                            title="Settings"
                        >
                            <svg width="22" height="22" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.6666 5.99313C25.6666 4.70796 24.6253 3.66663 23.3401 3.66663H20.6616C19.3746 3.66663 18.3333 4.70796 18.3333 5.99313C18.3333 7.05279 17.6073 7.96213 16.6191 8.35079C16.4627 8.41435 16.3081 8.47913 16.1553 8.54513C15.1818 8.96679 14.025 8.83846 13.2733 8.08863C12.8368 7.65313 12.2454 7.40855 11.6288 7.40855C11.0122 7.40855 10.4208 7.65313 9.98429 8.08863L8.08863 9.98429C7.65313 10.4208 7.40855 11.0122 7.40855 11.6288C7.40855 12.2454 7.65313 12.8368 8.08863 13.2733C8.84029 14.025 8.96863 15.18 8.54329 16.1553C8.47648 16.3088 8.41231 16.4634 8.35079 16.6191C7.96213 17.6073 7.05279 18.3333 5.99313 18.3333C4.70796 18.3333 3.66663 19.3746 3.66663 20.6598V23.3401C3.66663 24.6253 4.70796 25.6666 5.99313 25.6666C7.05279 25.6666 7.96213 26.3926 8.35079 27.3808C8.41435 27.5372 8.47851 27.6918 8.54329 27.8446C8.96679 28.8181 8.83846 29.975 8.08863 30.7266C7.65313 31.1631 7.40855 31.7545 7.40855 32.3711C7.40855 32.9877 7.65313 33.5791 8.08863 34.0156L9.98429 35.9113C10.4208 36.3468 11.0122 36.5914 11.6288 36.5914C12.2454 36.5914 12.8368 36.3468 13.2733 35.9113C14.025 35.1596 15.18 35.0313 16.1553 35.4548C16.3081 35.522 16.4627 35.5868 16.6191 35.6491C17.6073 36.0378 18.3333 36.9471 18.3333 38.0068C18.3333 39.292 19.3746 40.3333 20.6598 40.3333H23.3401C24.6253 40.3333 25.6666 39.292 25.6666 38.0068C25.6666 36.9471 26.3926 36.0378 27.3808 35.6473C27.5372 35.5862 27.6918 35.5226 27.8446 35.4566C28.8181 35.0313 29.975 35.1615 30.7248 35.9113C31.1614 36.3474 31.7532 36.5923 32.3702 36.5923C32.9872 36.5923 33.5791 36.3474 34.0156 35.9113L35.9113 34.0156C36.3468 33.5791 36.5914 32.9877 36.5914 32.3711C36.5914 31.7545 36.3468 31.1631 35.9113 30.7266C35.1596 29.975 35.0313 28.82 35.4548 27.8446C35.522 27.6918 35.5868 27.5372 35.6491 27.3808C36.0378 26.3926 36.9471 25.6666 38.0068 25.6666C39.292 25.6666 40.3333 24.6253 40.3333 23.3401V20.6616C40.3333 19.3765 39.292 18.3351 38.0068 18.3351C36.9471 18.3351 36.0378 17.6091 35.6473 16.621C35.5858 16.4653 35.5216 16.3106 35.4548 16.1571C35.0331 15.1836 35.1615 14.0268 35.9113 13.2751C36.3468 12.8386 36.5914 12.2472 36.5914 11.6306C36.5914 11.014 36.3468 10.4226 35.9113 9.98613L34.0156 8.09046C33.5791 7.65496 32.9877 7.41038 32.3711 7.41038C31.7545 7.41038 31.1631 7.65496 30.7266 8.09046C29.975 8.84213 28.82 8.97046 27.8446 8.54696C27.6911 8.47954 27.5365 8.41475 27.3808 8.35263C26.3926 7.96213 25.6666 7.05096 25.6666 5.99313Z" stroke="currentColor" strokeWidth="2.5"/>
                                <path d="M29.3333 22C29.3333 23.9449 28.5607 25.8101 27.1854 27.1854C25.8101 28.5607 23.9449 29.3333 22 29.3333C20.055 29.3333 18.1898 28.5607 16.8145 27.1854C15.4392 25.8101 14.6666 23.9449 14.6666 22C14.6666 20.055 15.4392 18.1898 16.8145 16.8145C18.1898 15.4392 20.055 14.6666 22 14.6666C23.9449 14.6666 25.8101 15.4392 27.1854 16.8145C28.5607 18.1898 29.3333 20.055 29.3333 22Z" stroke="currentColor" strokeWidth="2.5"/>
                            </svg>
                        </button>
                    </div>

                    {/* Logout Button */}
                    <div className="mb-4 z-10">
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
                <div className="flex-1 flex flex-col pt-0 p-0 lg:flex-row min-h-screen">
                    <main
                        className={`${
                            showPreview && window.innerWidth >= 768 ? "lg:flex-1" : "flex-1"
                        } flex justify-center items-center overflow-y-auto p-3 sm:p-6 min-h-screen`}
                        style={{
                            background: `url(${imgP6}) no-repeat center center`,
                            backgroundSize: 'cover',
                            backgroundColor: 'white',
                        }}
                    >
                        {children}
                    </main>

                    {/* Preview Section - Solo se muestra si NO estamos en analytics */}
                    {!isAnalyticsRoute && showPreview && (
                        <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[800px] mt-0 lg:mt-0 p-0 md:p-0 flex justify-center items-center relative">
                            {/* Background difuminado con avatar */}
                            <div
                                className="absolute inset-0 opacity-20"
                                style={{
                                    backgroundSize: 'cover',
                                    filter: 'blur(40px)',
                                    transform: 'scale(1.1)',
                                }}
                            />

                            {/* Background overlay con imgP6 */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'white',
                                    backgroundSize: 'cover',
                                    height: '100%',
                                    opacity: 0.6,
                                }}
                            />

                            <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center relative">
                                <div
                                    onClick={handleExpoced}
                                    className="absolute cursor-pointer text-xs top-10 bg-[#464C3666] rounded-full p-2 left-20 text-white mb-4 text-center z-60"
                                >
                                    URL: bio.site/{biosite?.slug || 'tu-slug'}
                                </div>

                                {/* Botón dinámico de Actualizar/Compartir */}
                                <button
                                    onClick={handleUpdateShareAction}
                                    disabled={buttonContent.disabled}
                                    className={`absolute text-xs top-10 rounded-lg p-2 right-20 text-white mb-4 text-center z-60 flex items-center space-x-1 transition-all duration-200 ${
                                        buttonContent.disabled
                                            ? 'bg-[#464C3666] cursor-not-allowed opacity-70'
                                            : hasChanges
                                                ? 'bg-[#98C022] hover:bg-[#86A81E] cursor-pointer'
                                                : 'bg-[#464C3666] hover:bg-[#464C36AA] cursor-pointer'
                                    }`}
                                    title={hasChanges ? 'Actualizar vista previa' : 'Compartir enlace'}
                                >
                                    {buttonContent.icon}
                                    <span>{buttonContent.text}</span>
                                </button>

                                <PhonePreview>
                                    <LivePreviewContent />
                                </PhonePreview>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile toggle preview - Solo se muestra si NO estamos en analytics */}
                {!isAnalyticsRoute && (
                    <button
                        onClick={togglePreview}
                        className="hidden md:block lg:hidden fixed bottom-4 right-4 p-3 bg-[#2a2a2a] rounded-full shadow-lg text-gray-400 hover:text-white transition-colors z-50"
                        title={showPreview ? "Hide Preview" : "Show Preview"}
                    >
                        {showPreview ? <X size={20} /> : <Smartphone size={20} />}
                    </button>
                )}
            </div>

            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                onLogout={handleLogoutFromSettings}
                onProfileSelect={handleProfileSelect}
                onCreateNewSite={handleCreateNewSite}
            />

            {/* Logout Dialog */}
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
