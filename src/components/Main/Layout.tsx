import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Layers,
    Droplet,
    BarChart3,
    CreditCard,
    Users,
    Mail,
    Menu,
    X,Smartphone
} from "lucide-react";

import imgP from "../../assets/img/img.png";
import { usePreview } from "../../context/PreviewContext";

import LivePreviewContent from "../Preview/LivePreviewContent";
import PhonePreview from "../Preview/phonePreview.tsx";

interface LayoutProps {
    children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeItem, setActiveItem] = useState<string>("layers");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);

    const {
        name,
        description,
        profileImage,
        coverImage,
        socialLinks,
        downloads,
        links
    } = usePreview();

    const sidebarItems = [
        { icon: Layers, label: "Layers", id: "layers", to: "/sections", color: "green" },
        { icon: Droplet, label: "Droplet", id: "droplet", to: "/droplet", color: "orange" },
        { icon: BarChart3, label: "Analytics", id: "analytics", to: "/analytics", color: "blue" },
        { icon: CreditCard, label: "Sales", id: "sales", to: "/sales", color: "purple" },
        { icon: Users, label: "Audience", id: "users", to: "/audience", color: "pink" },
        { icon: Mail, label: "Mail", id: "mail", to: "/mail", color: "yellow" },
    ];

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
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
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
                purple: "text-purple-600 border-l-4 border-purple-300 lg:border-l-4 md:border-b-2 md:border-l-0",
                pink: "text-pink-600 border-l-4 border-pink-300 lg:border-l-4 md:border-b-2 md:border-l-0",
                yellow: "text-yellow-600 border-l-4 border-yellow-300 lg:border-l-4 md:border-b-2 md:border-l-0",
            };
            return colorClasses[item.color as keyof typeof colorClasses] + " shadow-sm bg-gray-700/50";
        }
        return "text-gray-600 hover:text-white hover:bg-gray-700/30";
    };

    const togglePreview = () => {
        setShowPreview(!showPreview);
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen  bg-[#1b1b1b] p-2 sm:p-4">
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
                        <Smartphone size={20}/>
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
            <div className="hidden lg:flex w-14 xl:w-16 bg-[#2a2a2a] shadow-lg mt-5 mb-4 flex-col items-center space-y-6 rounded-full mr-4">
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
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                {/* Main Content */}
                <main className={`${showPreview && window.innerWidth >= 768 ? 'lg:flex-1' : 'flex-1'} flex justify-center items-center rounded-2xl shadow-sm overflow-y-auto p-3 sm:p-6 min-h-0`}>
                    {children}
                </main>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="w-full md:w-[400px] lg:w-[500px] xl:w-[600px] 2xl:w-[700px] mt-4 lg:mt-0 lg:ml-4 p-2 sm:p-4 rounded-2xl shadow-inner flex justify-center items-center bg-[#2a2a2a]/20">
                        <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center">
                            <PhonePreview>
                                <LivePreviewContent
                                    name={name}
                                    description={description}
                                    profileImage={profileImage}
                                    coverImage={coverImage}
                                    socialLinks={socialLinks}
                                    downloads={downloads}
                                    links={links}
                                />
                            </PhonePreview>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={togglePreview}
                className="hidden md:block lg:hidden fixed bottom-4 right-4 p-3 bg-[#2a2a2a] rounded-full shadow-lg text-gray-400 hover:text-white transition-colors z-50"
                title={showPreview ? "Hide Preview" : "Show Preview"}
            >
                {showPreview ? <X size={20} /> : <Smartphone size={20} />}
            </button>
        </div>
    );
};

export default Layout;