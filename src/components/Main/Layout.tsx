import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    RefreshCw,
    ArrowLeft,
    BarChartHorizontalBig,
    Palette,
    GanttChart,
    Music,
    Instagram,
    Shield
} from "lucide-react";

import imgP from "../../../public/img/img.png";
import imgP2 from "../../../public/img/fondo.svg";
import imgP6 from "../../../public/img/img_6.png"
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useChangeDetection } from "../../hooks/useChangeDetection.ts";
import { useUpdateShareActions } from "../../hooks/useUpdateShareActions.ts";
//import { useUser } from "../../hooks/useUser.ts";

import LivePreviewContent from "../Preview/LivePreviewContent.tsx";
import PhonePreview from "../Preview/phonePreview.tsx";
import SettingsModal from "../global/Settings/SettingsModal.tsx";
import StylesPage from "../../pages/styles.tsx";
import Analytics from "../../pages/analytics.tsx";
import SocialPage from "../layers/MySite/Social/socialPage.tsx";
import ProfilePage from "../layers/MySite/Profile/profilePage.tsx";
import VCardPage from "../layers/MySite/V-Card/V-CardPage.tsx";
import LinksPage from "../layers/AddMoreSections/Links/linksPage.tsx";
import VideoPage from "../layers/AddMoreSections/Video/videoPage.tsx";
import MusicPage from "../layers/AddMoreSections/Music-Posdcast/musicPage.tsx";
import PostPage from "../layers/AddMoreSections/Socialpost/socialPostPage.tsx";
import AppPage from "../layers/AddMoreSections/App/appPage.tsx";
import WhatsAppPage from "../layers/AddMoreSections/WhattsApp/whatsAppPage.tsx";
import ShareButton from "../ShareButton.tsx";
import {VideoCameraOutlined, WhatsAppOutlined} from "@ant-design/icons";
import Cookie from "js-cookie";


interface LayoutProps {
    children?: React.ReactNode;
}

interface SectionsWithDrawerInteractionProps {
    onSubsectionClick: (section: string) => void;
}

const SectionsWithDrawerInteraction: React.FC<SectionsWithDrawerInteractionProps> = ({ onSubsectionClick }) => {
    return (
        <div className="w-full">
            <div className="max-w-2xl mx-auto">
                {/* My Site Section */}
                <div className="mb-8">
                    <h3 className="text-gray-500 text-xl font-medium mb-6">My Site</h3>
                    <div className="space-y-3">
                        {/* Profile Card */}
                        <div
                            onClick={() => onSubsectionClick('profile')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#427AFE] rounded-lg flex items-center justify-center">
                                    <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6 12.5C6 9.73858 8.23858 7.5 11 7.5H38C40.7614 7.5 43 9.73858 43 12.5V39.5C43 42.2614 40.7614 44.5 38 44.5H11C8.23858 44.5 6 42.2614 6 39.5V12.5Z"
                                            fill="#427AFE"/>
                                        <path fillRule="evenodd" clipRule="evenodd"
                                              d="M25 17.5C23.6008 17.4997 22.2259 17.8665 21.0127 18.5636C19.7995 19.2608 18.7904 20.2639 18.086 21.473C17.3817 22.682 17.0067 24.0546 16.9987 25.4538C16.9906 26.8531 17.3497 28.2299 18.04 29.447C18.5066 28.8406 19.1064 28.3496 19.7931 28.012C20.4797 27.6744 21.2348 27.4992 22 27.5H28C28.7652 27.4992 29.5203 27.6744 30.2069 28.012C30.8936 28.3496 31.4934 28.8406 31.96 29.447C32.6503 28.2299 33.0094 26.8531 33.0013 25.4538C32.9933 24.0546 32.6183 22.682 31.914 21.473C31.2096 20.2639 30.2005 19.2608 28.9873 18.5636C27.7741 17.8665 26.3992 17.4997 25 17.5ZM32.943 31.576C33.0683 31.4127 33.1883 31.2453 33.303 31.074C34.4116 29.4267 35.0026 27.4856 35 25.5C35 19.977 30.523 15.5 25 15.5C19.477 15.5 15 19.977 15 25.5C14.9969 27.6968 15.72 29.8329 17.057 31.576L17.052 31.594L17.407 32.007C18.3449 33.1035 19.5094 33.9836 20.8202 34.5866C22.1311 35.1897 23.5571 35.5013 25 35.5C25.216 35.5 25.4307 35.4933 25.644 35.48C27.4484 35.3662 29.1877 34.7629 30.675 33.735C31.3863 33.2443 32.031 32.6635 32.593 32.007L32.948 31.594L32.943 31.576ZM25 19.5C24.2044 19.5 23.4413 19.8161 22.8787 20.3787C22.3161 20.9413 22 21.7043 22 22.5C22 23.2956 22.3161 24.0587 22.8787 24.6213C23.4413 25.1839 24.2044 25.5 25 25.5C25.7956 25.5 26.5587 25.1839 27.1213 24.6213C27.6839 24.0587 28 23.2956 28 22.5C28 21.7043 27.6839 20.9413 27.1213 20.3787C26.5587 19.8161 25.7956 19.5 25 19.5Z"
                                              fill="white"/>
                                    </svg>


                                </div>
                                <span className="text-black font-medium">Perfil</span>
                            </div>
                        </div>
                        {/* Social Card */}
                        <div
                            onClick={() => onSubsectionClick('social')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
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
                        </div>
                        {/* V-Card */}
                        <div
                            onClick={() => onSubsectionClick('VCard')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-white border border-black rounded-lg flex items-center justify-center">
                                    <img className="w-20 h-10" src="/img/v.png"/>



                                </div>
                                <span className="text-black font-medium">VCard</span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Add More Sections */}
                <div>
                    <h3 className="text-gray-400 text-lg font-medium mb-6">Add More Sections</h3>
                    <div className="space-y-3">
                        {/* App */}
                        <div
                            onClick={() => onSubsectionClick('app')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 14 14"><g fill="none" stroke="white" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 13.5h-1a1 1 0 0 1-1-1v-8h13v8a1 1 0 0 1-1 1h-1"/><path d="M4.5 11L7 13.5L9.5 11M7 13.5v-6M11.29 1a1 1 0 0 0-.84-.5h-6.9a1 1 0 0 0-.84.5L.5 4.5h13zM7 .5v4"/></g></svg>
                                </div>
                                <div>
                                    <div className="text-black font-medium">Link de mi App</div>
                                    <div className="text-gray-400 text-sm">Links de App</div>
                                </div>
                            </div>
                        </div>
                        {/* WhatsApp */}
                        <div
                            onClick={() => onSubsectionClick('whatsapp')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                    <WhatsAppOutlined size={16} className="text-white" style={{color:'white'}} />
                                </div>
                                <div>
                                    <div className="text-black font-medium">Contactame</div>
                                    <div className="text-gray-400 text-sm">WhatsAppeame</div>
                                </div>
                            </div>
                        </div>
                        {/* Links */}
                        <div
                            onClick={() => onSubsectionClick('links')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-[#6F4FC1] rounded-lg flex items-center justify-center">
                                    <svg width="50" height="51" viewBox="0 0 50 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6 12.5C6 9.73858 8.23858 7.5 11 7.5H38C40.7614 7.5 43 9.73858 43 12.5V39.5C43 42.2614 40.7614 44.5 38 44.5H11C8.23858 44.5 6 42.2614 6 39.5V12.5Z"
                                            fill="#6F4FC1"/>
                                        <path
                                            d="M25.6207 22.702L26.7409 23.8214C27.2556 24.336 27.6638 24.9469 27.9424 25.6193C28.2209 26.2917 28.3643 27.0124 28.3643 27.7402C28.3643 28.4679 28.2209 29.1886 27.9424 29.861C27.6638 30.5334 27.2556 31.1443 26.7409 31.6589L26.4607 31.9384C25.9461 32.453 25.3351 32.8612 24.6628 33.1397C23.9904 33.4182 23.2697 33.5616 22.5419 33.5616C21.8142 33.5616 21.0935 33.4182 20.4211 33.1397C19.7488 32.8612 19.1378 32.453 18.6232 31.9384C18.1086 31.4237 17.7004 30.8128 17.4219 30.1404C17.1433 29.468 17 28.7474 17 28.0196C17 27.2918 17.1433 26.5712 17.4219 25.8988C17.7004 25.2264 18.1086 24.6155 18.6232 24.1009L19.7434 25.2211C19.3732 25.5881 19.0791 26.0245 18.8781 26.5055C18.677 26.9864 18.5729 27.5023 18.5718 28.0236C18.5706 28.5449 18.6725 29.0612 18.8714 29.5431C19.0704 30.0249 19.3625 30.4626 19.7311 30.8312C20.0997 31.1998 20.5375 31.492 21.0193 31.6909C21.5011 31.8899 22.0175 31.9917 22.5388 31.9906C23.06 31.9895 23.5759 31.8854 24.0569 31.6843C24.5378 31.4832 24.9743 31.1892 25.3413 30.8189L25.6215 30.5387C26.3636 29.7964 26.7805 28.7898 26.7805 27.7402C26.7805 26.6905 26.3636 25.6839 25.6215 24.9416L24.5013 23.8214L25.6207 22.702ZM30.9392 27.4599L29.8197 26.3405C30.5465 25.595 30.9503 24.5932 30.9436 23.5521C30.9369 22.511 30.5203 21.5144 29.7841 20.7783C29.0479 20.0421 28.0512 19.6257 27.0101 19.6192C25.969 19.6126 24.9673 20.0166 24.2219 20.7434L23.9416 21.0229C23.1995 21.7652 22.7827 22.7718 22.7827 23.8214C22.7827 24.871 23.1995 25.8777 23.9416 26.6199L25.0618 27.7402L23.9416 28.8596L22.8222 27.7402C22.3075 27.2256 21.8993 26.6146 21.6208 25.9422C21.3422 25.2699 21.1989 24.5492 21.1989 23.8214C21.1989 23.0936 21.3422 22.373 21.6208 21.7006C21.8993 21.0282 22.3075 20.4173 22.8222 19.9027L23.1024 19.6232C23.6171 19.1086 24.228 18.7004 24.9004 18.4219C25.5728 18.1433 26.2934 18 27.0212 18C27.749 18 28.4696 18.1433 29.142 18.4219C29.8144 18.7004 30.4253 19.1086 30.9399 19.6232C31.4546 20.1378 31.8628 20.7488 32.1413 21.4211C32.4198 22.0935 32.5631 22.8142 32.5631 23.5419C32.5631 24.2697 32.4198 24.9904 32.1413 25.6628C31.8628 26.3351 31.4546 26.9461 30.9399 27.4607"
                                            fill="white"/>
                                    </svg>

                                </div>
                                <div>
                                    <div className="text-black font-medium">Links</div>
                                    <div className="text-gray-600 text-sm">Links Diversos</div>
                                </div>
                            </div>
                        </div>
                        {/* Videos */}
                        <div
                            onClick={() => onSubsectionClick('videos')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <VideoCameraOutlined  style={{color:'white'}}/>
                                </div>
                                <div>
                                    <div className="text-black font-medium">Video</div>
                                    <div className="text-gray-400 text-sm">Añade un video de Youtube que quieras mostrar </div>
                                </div>
                            </div>
                        </div>
                        {/* Music */}
                        <div
                            onClick={() => onSubsectionClick('music')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                                    <Music size={16} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-black font-medium">Music / Podcast</div>
                                    <div className="text-gray-400 text-sm">Añade Musica </div>
                                </div>
                            </div>
                        </div>
                        {/* Post */}
                        <div
                            onClick={() => onSubsectionClick('post')}
                            className="bg-[#FAFFF6] rounded-lg p-4 cursor-pointer hover:bg-[#3A3A3A] transition-colors flex items-center space-x-3"
                        >
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
                                    <Instagram size={16} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-black font-medium">Social Post</div>
                                    <div className="text-gray-400 text-sm">Publicaciones de Instagram</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuthContext();
    const role = Cookie.get('roleName');
    const userId = Cookie.get('userId')
    const { biosite } = usePreview();
    const { hasChanges, markAsSaved, resetChangeDetection } = useChangeDetection();
    const { isUpdating, handleUpdate, handleShare } = useUpdateShareActions();

    const [activeItem, setActiveItem] = useState<string>("layers");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(true);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [avatarError, setAvatarError] = useState(false);


    const [selectedSection, setSelectedSection] = useState<string | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartY, setDragStartY] = useState(0);
    const [currentDrawerHeight, setCurrentDrawerHeight] = useState(85);
    const drawerRef = useRef<HTMLDivElement>(null);
    const dragHandleRef = useRef<HTMLDivElement>(null);

    const [isInSubsection, setIsInSubsection] = useState(false);


    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';

            const preventDefault = (e: TouchEvent) => {
                if (e.target && drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                    e.preventDefault();
                }
            };

            document.addEventListener('touchmove', preventDefault, { passive: false });

            return () => {
                document.removeEventListener('touchmove', preventDefault);
            };
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [isDrawerOpen]);

    const handleDrawerSectionClick = (section: string) => {
        setSelectedSection(section);
        setIsDrawerOpen(true);
        setIsInSubsection(false);
        setCurrentDrawerHeight(85);
    };

    const handleMySiteSubsectionClick = (subsection: string) => {
        setSelectedSection(subsection);
        setIsInSubsection(true);
        setCurrentDrawerHeight(85);
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setSelectedSection(null);
        setIsInSubsection(false);
    };

    const goBackToSections = () => {
        if (isInSubsection) {
            setSelectedSection('sections');
            setIsInSubsection(false);
        } else {
            closeDrawer();
        }
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setDragStartY(startY);
    };

    const handleDragMove = (e: MouseEvent | TouchEvent) => {
        if (!isDragging || !drawerRef.current) return;

        const currentY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const deltaY = currentY - dragStartY;
        const newHeight = Math.max(0, Math.min(95, currentDrawerHeight - (deltaY / window.innerHeight) * 100));

        setCurrentDrawerHeight(newHeight);
        setDragStartY(currentY);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (currentDrawerHeight < 40) {
            closeDrawer();
        } else {
            setCurrentDrawerHeight(85);
        }
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
            document.addEventListener('touchmove', handleDragMove);
            document.addEventListener('touchend', handleDragEnd);
        }

        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, dragStartY, currentDrawerHeight]);

    const getDrawerTitle = () => {
        if (!selectedSection) return "My Site";

        const titles: { [key: string]: string } = {
            'sections': 'Secciones',
            'style': 'Estilos',
            'analytics': 'Estadísticas',
            'admin': 'Administración',
            'profile': 'Perfil',
            'social': 'Social',
            'VCard': 'V-Card',
            'links': 'Links',
            'videos': 'Videos',
            'music': 'Music',
            'post': 'Post',
            'app': 'App',
            'whatsapp': 'WhatsApp'
        };

        return titles[selectedSection] || selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1);
    }

    const handleExpoced = () => {
        if (biosite?.slug) {
            const url = `https://visitaecuador.com/vesite/${biosite?.slug || 'your-slug'}`;
            window.open(url, '_blank');
        } else {
            console.warn("No hay slug disponible para la navegación");
        }
    };

    const handleUpdateShareAction = async () => {
        if (hasChanges) {
            await handleUpdate();
            markAsSaved();
        }
    };

    useEffect(() => {
        if (biosite) {
            resetChangeDetection();
        }
    }, [biosite?.id]);


    const baseSidebarItems = [
        { icon: GanttChart, label: "Secciones", id: "sections", to: "/sections", color: "green" },
        { icon: Palette, label: "Estilos", id: "style", to: "/droplet", color: "orange" },
        { icon: BarChartHorizontalBig, label: "Estadísticas", id: "analytics", to: "/analytics", color: "blue" },
    ];


    const sidebarItems = role === 'SUPER_ADMIN'
        ? [
            ...baseSidebarItems,
            { icon: Shield, label: "Administración", id: "admin", to: "/admin", color: "red" }
        ]
        : baseSidebarItems;

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

    const handleOpenSettings = () => setIsSettingsModalOpen(true);

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
        const currentItem = sidebarItems.find((item) => location.pathname.includes(item.id));
        if (currentItem) {
            setActiveItem(currentItem.id);

        }
    }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileMenuOpen(false);
                setShowPreview(true);
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const isAnalyticsRoute = location.pathname === '/analytics' ;
    const isAdminRoute = location.pathname === '/admin' ;

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
                green: "text-[#98C022] border-l-4 border-[#98C022] lg:border-l-4",
                orange: "text-orange-600 border-l-4 border-orange-300 lg:border-l-4",
                blue: "text-blue-600 border-l-4 border-blue-300 lg:border-l-4",
                red: "text-red-600 border-l-4 border-red-300 lg:border-l-4"
            };
            return colorClasses[item.color as keyof typeof colorClasses] + " ";
        }
        return "text-gray-600 hover:text-gray-300 ";
    };

    const getButtonContent = () => {
        if (isUpdating) return { text: "Updating...", icon: <RefreshCw className="w-3 h-3 animate-spin" />, disabled: true };
        if (hasChanges) return { text: "Update", icon: <RefreshCw className="w-3 h-3" />, disabled: false };
        return { text: "Update", icon: <RefreshCw className="w-3 h-3" />, disabled: false };
    };

    const buttonContent = getButtonContent();

    const renderDrawerContent = () => {
        switch (selectedSection) {
            case 'sections':

                return (
                    <div className="p-4">
                        <SectionsWithDrawerInteraction onSubsectionClick={handleMySiteSubsectionClick} />
                    </div>
                );
            case 'style':
                return <StylesPage />;
            case 'analytics':
                return (
                    <div className="text-white p-4">
                        <Analytics />
                    </div>
                );
            case 'profile':
                return (
                    <div className="p-4">
                        <ProfilePage />
                    </div>
                );
            case 'social':
                return (
                    <div className="p-4">
                        <SocialPage />
                    </div>
                );
            case 'VCard':
                return (
                    <div className="p-4">
                        <VCardPage />
                    </div>
                );
            case 'links':
                return (
                    <div className="p-4">
                        <LinksPage />
                    </div>
                );
            case 'videos':
                return (
                    <div className="p-4">
                        <VideoPage />
                    </div>
                );
            case 'music':
                return (
                    <div className="p-4">
                        <MusicPage />
                    </div>
                );
            case 'post':
                return (
                    <div className="p-4">
                        <PostPage />
                    </div>
                );
            case 'app':
                return (
                    <div className="p-4">
                        <AppPage />
                    </div>
                );
            case 'whatsapp':
                return (
                    <div className="p-4">
                        <WhatsAppPage />
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <>
            {/* --- VISTA DESKTOP --- */}
            <div className="hidden lg:flex flex-col lg:flex-row h-screen bg-[#E0EED5] p-2 sm:p-4 overflow-x-hidden md:overflow-y-hidden">
                <div className="w-16 xl:w-14 bg-[#FAFFF6] shadow-lg mt-10 mb-4 flex-col items-center space-y-6 rounded-full mr-4 hidden lg:flex">
                    <button className="p-2 text-gray-600 hover:text-green-600 transition-colors cursor-pointer">
                        <img src={getAvatarImage()} onClick={handleOpenSettings} className="rounded-full w-10 h-10 xl:w-10 xl:h-10 object-cover" alt="perfil" onError={handleAvatarError} />
                    </button>
                    <div className="flex flex-col space-y-4 mt-7">
                        {sidebarItems.map((item) => (
                            <button key={item.id} onClick={() => handleItemClick(item)} className={`p-4 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(item)}`} title={item.label}>
                                <item.icon size={20} />
                            </button>
                        ))}
                    </div>
                    <div className="mt-auto pb-5 z-10">
                        <button onClick={handleOpenSettings} className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10" title="Settings">
                            {/* SVG for Settings Icon */}
                            <svg width="22" height="22" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.6666 5.99313C25.6666 4.70796 24.6253 3.66663 23.3401 3.66663H20.6616C19.3746 3.66663 18.3333 4.70796 18.3333 5.99313C18.3333 7.05279 17.6073 7.96213 16.6191 8.35079C16.4627 8.41435 16.3081 8.47913 16.1553 8.54513C15.1818 8.96679 14.025 8.83846 13.2733 8.08863C12.8368 7.65313 12.2454 7.40855 11.6288 7.40855C11.0122 7.40855 10.4208 7.65313 9.98429 8.08863L8.08863 9.98429C7.65313 10.4208 7.40855 11.0122 7.40855 11.6288C7.40855 12.2454 7.65313 12.8368 8.08863 13.2733C8.84029 14.025 8.96863 15.18 8.54329 16.1553C8.47648 16.3088 8.41231 16.4634 8.35079 16.6191C7.96213 17.6073 7.05279 18.3333 5.99313 18.3333C4.70796 18.3333 3.66663 19.3746 3.66663 20.6598V23.3401C3.66663 24.6253 4.70796 25.6666 5.99313 25.6666C7.05279 25.6666 7.96213 26.3926 8.35079 27.3808C8.41435 27.5372 8.47851 27.6918 8.54329 27.8446C8.96679 28.8181 8.83846 29.975 8.08863 30.7266C7.65313 31.1631 7.40855 31.7545 7.40855 32.3711C7.40855 32.9877 7.65313 33.5791 8.08863 34.0156L9.98429 35.9113C10.4208 36.3468 11.0122 36.5914 11.6288 36.5914C12.2454 36.5914 12.8368 36.3468 13.2733 35.9113C14.025 35.1596 15.18 35.0313 16.1553 35.4548C16.3081 35.522 16.4627 35.5868 16.6191 35.6491C17.6073 36.0378 18.3333 36.9471 18.3333 38.0068C18.3333 39.292 19.3746 40.3333 20.6598 40.3333H23.3401C24.6253 40.3333 25.6666 39.292 25.6666 38.0068C25.6666 36.9471 26.3926 36.0378 27.3808 35.6473C27.5372 35.5862 27.6918 35.5226 27.8446 35.4566C28.8181 35.0313 29.975 35.1615 30.7248 35.9113C31.1614 36.3474 31.7532 36.5923 32.3702 36.5923C32.9872 36.5923 33.5791 36.3474 34.0156 35.9113L35.9113 34.0156C36.3468 33.5791 36.5914 32.9877 36.5914 32.3711C36.5914 31.7545 36.3468 31.1631 35.9113 30.7266C35.1596 29.975 35.0313 28.82 35.4548 27.8446C35.522 27.6918 35.5868 27.5372 35.6491 27.3808C36.0378 26.3926 36.9471 25.6666 38.0068 25.6666C39.292 25.6666 40.3333 24.6253 40.3333 23.3401V20.6616C40.3333 19.3765 39.292 18.3351 38.0068 18.3351C36.9471 18.3351 36.0378 17.6091 35.6473 16.621C35.5858 16.4653 35.5216 16.3106 35.4548 16.1571C35.0331 15.1836 35.1615 14.0268 35.9113 13.2751C36.3468 12.8386 36.5914 12.2472 36.5914 11.6306C36.5914 11.014 36.3468 10.4226 35.9113 9.98613L34.0156 8.09046C33.5791 7.65496 32.9877 7.41038 32.3711 7.41038C31.7545 7.41038 31.1631 7.65496 30.7266 8.09046C29.975 8.84213 28.82 8.97046 27.8446 8.54696C27.6911 8.47954 27.5365 8.41475 27.3808 8.35263C26.3926 7.96213 25.6666 7.05096 25.6666 5.99313Z" stroke="currentColor" strokeWidth="2.5"></path><path d="M29.3333 22C29.3333 23.9449 28.5607 25.8101 27.1854 27.1854C25.8101 28.5607 23.9449 29.3333 22 29.3333C20.055 29.3333 18.1898 28.5607 16.8145 27.1854C15.4392 25.8101 14.6666 23.9449 14.6666 22C14.6666 20.055 15.4392 18.1898 16.8145 16.8145C18.1898 15.4392 20.055 14.6666 22 14.6666C23.9449 14.6666 25.8101 15.4392 27.1854 16.8145C28.5607 18.1898 29.3333 20.055 29.3333 22Z" stroke="currentColor" strokeWidth="2.5"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex flex-col pt-0 p-0 lg:flex-row min-h-screen">
                    <main className="lg:flex-1 flex justify-center items-center overflow-y-auto p-3 sm:p-6 min-h-screen" style={{ background: `url(${imgP6}) no-repeat center center`, backgroundSize: 'cover', backgroundColor: 'white' }}>
                        {children}
                    </main>

                    {!isAnalyticsRoute && !isAdminRoute && showPreview && (
                        <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[750px] mt-0 lg:mt-0 p-0 md:p-0 flex justify-center items-center relative">
                            <div className="absolute inset-0" style={{ background: `url(${imgP2}) no-repeat center center`, backgroundSize: 'cover', height: '100%', width: '100%', opacity: 0.6 }} />
                            <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center relative transition-transform duration-300 ease-in-out origin-center scale-[.60] md:scale-[.68] lg:scale-[.72] xl:scale-[.76] 2xl:scale-[.80]">
                                <div onClick={handleExpoced} title='Mi URL' className="absolute cursor-pointer text-xs top-0 bg-[#464C3666] rounded-full p-2 left-20 text-white mb-4 text-center z-50">
                                    URL: vesite/{biosite?.slug || 'your-slug'}
                                </div>
                                <div className="absolute top-0 right-40">
                                    <ShareButton/></div>
                                <button onClick={handleUpdateShareAction}  disabled={buttonContent.disabled} className={`absolute text-xs top-0 rounded-lg p-2 right-20 text-white mb-4 text-center z-50 flex items-center space-x-1 transition-all duration-200 ${buttonContent.disabled ? 'bg-[#464C3666] cursor-not-allowed' : hasChanges ? 'bg-[#98C022] hover:bg-[#86A81E]' : 'bg-[#464C3666] hover:bg-[#464C36AA]'} cursor-pointer`} title='Actualizar VeSite' >
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
            </div>

            {/* --- VISTA MÓVIL --- */}
            <div className={`lg:hidden flex flex-col h-screen relative ${isDrawerOpen ? 'overflow-hidden' : ''}`} style={{ background: `url(${imgP2}) no-repeat center center`, backgroundSize: 'cover', height: '100%', width: '100%'}}>
                {/* Overlay para opacar la imagen de fondo */}
                <div className="absolute inset-0 bg-white opacity-24 z-0"></div>

                <header className="flex items-center justify-between p-3 z-10 relative">
                    <img src={getAvatarImage()} onClick={handleOpenSettings} className="w-8 h-8 cursor-pointer rounded-full object-cover" alt="profile" />
                    <div className="flex items-center space-x-5">
                        {/* More options button (three dots) - consider functionality */}
                        <button className="p-2 text-gray-400 rounded-full hover:bg-black/20 " onClick={handleOpenSettings}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></svg>
                        </button>
                        <div className="absolute top-3.5 right-18">
                            <ShareButton/>
                        </div>
                        <button onClick={handleUpdateShareAction} disabled={buttonContent.disabled} className={`px-4 cursor-pointer py-2 text-xs rounded-lg flex items-center space-x-1.5 transition-colors ${buttonContent.disabled ? 'bg-gray-600 text-gray-400' : 'bg-white text-black'}`}>
                            {buttonContent.icon}
                            <span>{buttonContent.text}</span>
                        </button>
                    </div>
                </header>

                <main className={`flex-1 overflow-hidden flex items-center justify-center p-0 ${isDrawerOpen ? 'pointer-events-none' : ''}`} style={{ maxHeight: 'calc(100vh - 100px)' }}> {/* Adjusted height */}
                    <PhonePreview className="mobile-view">
                        <LivePreviewContent />
                    </PhonePreview>
                </main>

                <nav className="w-full flex mb-20 justify-around z-10">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleDrawerSectionClick(item.id)}
                            className={`flex cursor-pointer flex-col items-center space-y-1 p-3 -mt-20 transition-colors ${selectedSection === item.id ? 'text-white' : 'text-white hover:text-white'}`}
                        >
                            {item.id === 'sections' && <GanttChart size={22} />}
                            {item.id === 'style' && <Palette size={22} />}
                            {item.id === 'analytics' && <BarChartHorizontalBig size={22} />}
                            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* --- Drawer Deslizable --- */}
                {isDrawerOpen && (
                    <>
                        {/* Overlay para bloquear interacción con el fondo */}
                        <div className="fixed inset-0  z-40" onClick={closeDrawer} />

                        <div
                            ref={drawerRef}
                            className="fixed bottom-0 left-0 right-0 bg-[#E0EED5]/70 backdrop-blur-lg rounded-t-2xl shadow-2xl z-50 flex flex-col pointer-events-auto"
                            style={{ height: `${currentDrawerHeight}vh`, transition: isDragging ? 'none' : 'height 0.3s ease-in-out' }}
                        >
                            <div
                                ref={dragHandleRef}
                                onMouseDown={handleDragStart}
                                onTouchStart={handleDragStart}
                                className="w-full py-4 cursor-grab active:cursor-grabbing flex-shrink-0"
                            >
                                <div className="w-10 h-1.5 bg-gray-600 rounded-full mx-auto" />
                                <div className="flex items-center justify-start gap-32 px-4 pt-3">
                                    {/* Back button for drawer navigation */}
                                    <button onClick={goBackToSections} className="flex items-center space-x-2 text-gray-800">
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    <h2 className="text-gray-800 font-semibold">{getDrawerTitle()}</h2>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {renderDrawerContent()}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} onLogout={handleLogoutFromSettings} onProfileSelect={handleProfileSelect} onCreateNewSite={handleCreateNewSite} />
        </>
    );
};

export default Layout;