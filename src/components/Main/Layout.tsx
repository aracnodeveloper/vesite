import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  RefreshCw,
  ArrowLeft,
  BarChartHorizontalBig,
  Palette,
  GanttChart,
  Shield,
} from "lucide-react";

import imgP from "../../../public/img/img.png";
import imgP2 from "../../../public/img/fondo.svg";
import imgP6 from "../../../public/img/img_6.png";
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import { usePreview } from "../../context/PreviewContext.tsx";
import { useChangeDetection } from "../../hooks/useChangeDetection.ts";
import { useUpdateShareActions } from "../../hooks/useUpdateShareActions.ts";

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
import Cookie from "js-cookie";

import SectionsWithDrawerInteraction from "./MobileDrawer.tsx";
import NewBiositePage from "../../context/NewBiositePage/NewBiositePage.tsx";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const role = Cookie.get("roleName");
  const userId = Cookie.get("userId");
  const hasAdminAccess =
    role === "SUPER_ADMIN" ||
    userId === "92784deb-3a8e-42a0-91ee-cd64fb3726f5" ||
    role === "ADMIN";
  const { biosite } = usePreview();
  const { hasChanges, markAsSaved, resetChangeDetection } =
    useChangeDetection();
  const { isUpdating, handleUpdate } = useUpdateShareActions();

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
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const preventDefault = (e: TouchEvent) => {
        if (
          e.target &&
          drawerRef.current &&
          !drawerRef.current.contains(e.target as Node)
        ) {
          e.preventDefault();
        }
      };

      document.addEventListener("touchmove", preventDefault, {
        passive: false,
      });

      return () => {
        document.removeEventListener("touchmove", preventDefault);
      };
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
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
      setSelectedSection("sections");
      setIsInSubsection(false);
    } else {
      closeDrawer();
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const startY = "touches" in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(startY);
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !drawerRef.current) return;

    const currentY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = currentY - dragStartY;
    const newHeight = Math.max(
      0,
      Math.min(95, currentDrawerHeight - (deltaY / window.innerHeight) * 100)
    );

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
      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
      document.addEventListener("touchmove", handleDragMove);
      document.addEventListener("touchend", handleDragEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("touchend", handleDragEnd);
    };
  }, [isDragging, dragStartY, currentDrawerHeight]);

  const getDrawerTitle = () => {
    if (!selectedSection) return "My Site";

    const titles: { [key: string]: string } = {
      sections: "Secciones",
      style: "Estilos",
      analytics: "Estadísticas",
      admin: "Administración",
      profile: "Perfil",
      social: "Social",
      VCard: "V-Card",
      links: "Links",
      videos: "Videos",
      music: "Music",
      post: "Post",
      app: "App",
      whatsapp: "WhatsApp",
    };

    return (
      titles[selectedSection] ||
      selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)
    );
  };

  const handleExpoced = () => {
    if (biosite?.slug) {
      const url = `https://visitaecuador.com/vesite/${
        biosite?.slug || "your-slug"
      }`;
      window.open(url, "_blank");
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
    {
      icon: GanttChart,
      label: "Secciones",
      id: "sections",
      to: "/sections",
      color: "green",
    },
    {
      icon: Palette,
      label: "Estilos",
      id: "style",
      to: "/droplet",
      color: "orange",
    },
    {
      icon: BarChartHorizontalBig,
      label: "Estadísticas",
      id: "analytics",
      to: "/analytics",
      color: "blue",
    },
  ];

  const sidebarItems = hasAdminAccess
    ? [
        ...baseSidebarItems,
        {
          icon: Shield,
          label: "Administración",
          id: "admin",
          to: "/admin",
          color: "red",
        },
      ]
    : baseSidebarItems;

  const getAvatarImage = () => {
    if (avatarError || !biosite?.avatarImage) {
      return imgP;
    }
    if (typeof biosite.avatarImage === "string" && biosite.avatarImage.trim()) {
      if (biosite.avatarImage.startsWith("data:")) {
        const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
        return dataUrlRegex.test(biosite.avatarImage)
          ? biosite.avatarImage
          : imgP;
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
    const currentItem = sidebarItems.find((item) =>
      location.pathname.includes(item.id)
    );
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

  const isAnalyticsRoute = location.pathname === "/analytics";
  const isAdminRoute = location.pathname === "/admin";

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
        red: "text-red-600 border-l-4 border-red-300 lg:border-l-4",
      };
      return colorClasses[item.color as keyof typeof colorClasses] + " ";
    }
    return "text-gray-600 hover:text-gray-300 ";
  };

  const getButtonContent = () => {
    if (isUpdating)
      return {
        text: "Updating...",
        icon: <RefreshCw className="w-3 h-3 animate-spin" />,
        disabled: true,
      };
    if (hasChanges)
      return {
        text: "Update",
        icon: <RefreshCw className="w-3 h-3" />,
        disabled: false,
      };
    return {
      text: "Update",
      icon: <RefreshCw className="w-3 h-3" />,
      disabled: false,
    };
  };

  const buttonContent = getButtonContent();

  const renderDrawerContent = () => {
    switch (selectedSection) {
      case "sections":
        return (
          <div className="p-4">
            <SectionsWithDrawerInteraction
              onSubsectionClick={handleMySiteSubsectionClick}
            />
          </div>
        );
      case "style":
        return <StylesPage />;
      case "analytics":
        return (
          <div className="text-white p-4">
            <Analytics />
          </div>
        );
      case "profile":
        return (
          <div className="p-4">
            <ProfilePage />
          </div>
        );
      case "social":
        return (
          <div className="p-4">
            <SocialPage />
          </div>
        );
      case "VCard":
        return (
          <div className="p-4">
            <VCardPage />
          </div>
        );
      case "links":
        return (
          <div className="p-4">
            <LinksPage />
          </div>
        );
      case "videos":
        return (
          <div className="p-4">
            <VideoPage />
          </div>
        );
      case "music":
        return (
          <div className="p-4">
            <MusicPage />
          </div>
        );
      case "post":
        return (
          <div className="p-4">
            <PostPage />
          </div>
        );
      case "app":
        return (
          <div className="p-4">
            <AppPage />
          </div>
        );
      case "whatsapp":
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
                className={`p-4 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getItemStyles(
                  item
                )}`}
                title={item.label}
              >
                <item.icon size={20} />
              </button>
            ))}
          </div>
          <div className="mt-auto pb-5 z-10">
            <button
              onClick={handleOpenSettings}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
              title="Settings"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 44 44"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M25.6666 5.99313C25.6666 4.70796 24.6253 3.66663 23.3401 3.66663H20.6616C19.3746 3.66663 18.3333 4.70796 18.3333 5.99313C18.3333 7.05279 17.6073 7.96213 16.6191 8.35079C16.4627 8.41435 16.3081 8.47913 16.1553 8.54513C15.1818 8.96679 14.025 8.83846 13.2733 8.08863C12.8368 7.65313 12.2454 7.40855 11.6288 7.40855C11.0122 7.40855 10.4208 7.65313 9.98429 8.08863L8.08863 9.98429C7.65313 10.4208 7.40855 11.0122 7.40855 11.6288C7.40855 12.2454 7.65313 12.8368 8.08863 13.2733C8.84029 14.025 8.96863 15.18 8.54329 16.1553C8.47648 16.3088 8.41231 16.4634 8.35079 16.6191C7.96213 17.6073 7.05279 18.3333 5.99313 18.3333C4.70796 18.3333 3.66663 19.3746 3.66663 20.6598V23.3401C3.66663 24.6253 4.70796 25.6666 5.99313 25.6666C7.05279 25.6666 7.96213 26.3926 8.35079 27.3808C8.41435 27.5372 8.47851 27.6918 8.54329 27.8446C8.96679 28.8181 8.83846 29.975 8.08863 30.7266C7.65313 31.1631 7.40855 31.7545 7.40855 32.3711C7.40855 32.9877 7.65313 33.5791 8.08863 34.0156L9.98429 35.9113C10.4208 36.3468 11.0122 36.5914 11.6288 36.5914C12.2454 36.5914 12.8368 36.3468 13.2733 35.9113C14.025 35.1596 15.18 35.0313 16.1553 35.4548C16.3081 35.522 16.4627 35.5868 16.6191 35.6491C17.6073 36.0378 18.3333 36.9471 18.3333 38.0068C18.3333 39.292 19.3746 40.3333 20.6598 40.3333H23.3401C24.6253 40.3333 25.6666 39.292 25.6666 38.0068C25.6666 36.9471 26.3926 36.0378 27.3808 35.6473C27.5372 35.5862 27.6918 35.5226 27.8446 35.4566C28.8181 35.0313 29.975 35.1615 30.7248 35.9113C31.1614 36.3474 31.7532 36.5923 32.3702 36.5923C32.9872 36.5923 33.5791 36.3474 34.0156 35.9113L35.9113 34.0156C36.3468 33.5791 36.5914 32.9877 36.5914 32.3711C36.5914 31.7545 36.3468 31.1631 35.9113 30.7266C35.1596 29.975 35.0313 28.82 35.4548 27.8446C35.522 27.6918 35.5868 27.5372 35.6491 27.3808C36.0378 26.3926 36.9471 25.6666 38.0068 25.6666C39.292 25.6666 40.3333 24.6253 40.3333 23.3401V20.6616C40.3333 19.3765 39.292 18.3351 38.0068 18.3351C36.9471 18.3351 36.0378 17.6091 35.6473 16.621C35.5858 16.4653 35.5216 16.3106 35.4548 16.1571C35.0331 15.1836 35.1615 14.0268 35.9113 13.2751C36.3468 12.8386 36.5914 12.2472 36.5914 11.6306C36.5914 11.014 36.3468 10.4226 35.9113 9.98613L34.0156 8.09046C33.5791 7.65496 32.9877 7.41038 32.3711 7.41038C31.7545 7.41038 31.1631 7.65496 30.7266 8.09046C29.975 8.84213 28.82 8.97046 27.8446 8.54696C27.6911 8.47954 27.5365 8.41475 27.3808 8.35263C26.3926 7.96213 25.6666 7.05096 25.6666 5.99313Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                ></path>
                <path
                  d="M29.3333 22C29.3333 23.9449 28.5607 25.8101 27.1854 27.1854C25.8101 28.5607 23.9449 29.3333 22 29.3333C20.055 29.3333 18.1898 28.5607 16.8145 27.1854C15.4392 25.8101 14.6666 23.9449 14.6666 22C14.6666 20.055 15.4392 18.1898 16.8145 16.8145C18.1898 15.4392 20.055 14.6666 22 14.6666C23.9449 14.6666 25.8101 15.4392 27.1854 16.8145C28.5607 18.1898 29.3333 20.055 29.3333 22Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col pt-0 p-0 lg:flex-row min-h-screen">
          <main
            className="lg:flex-1 flex justify-center items-center overflow-y-auto p-3 sm:p-6 min-h-screen"
            style={{
              background: `url(${imgP6}) no-repeat center center`,
              backgroundSize: "cover",
              backgroundColor: "white",
            }}
          >
            {children}
          </main>

          {!isAnalyticsRoute && !isAdminRoute && showPreview && (
            <div className="w-full md:w-[500px] lg:w-[600px] xl:w-[700px] 2xl:w-[750px] mt-0 lg:mt-0 p-0 md:p-0 flex justify-center items-center relative">
              <div
                className="absolute inset-0"
                style={{
                  background: `url(${imgP2}) no-repeat center center`,
                  backgroundSize: "cover",
                  height: "100%",
                  width: "100%",
                  opacity: 0.6,
                }}
              />
              <div className="w-full max-w-[350px] lg:max-w-none flex justify-center items-center relative transition-transform duration-300 ease-in-out origin-center scale-[.60] md:scale-[.68] lg:scale-[.72] xl:scale-[.76] 2xl:scale-[.80]">
                <div
                  onClick={handleExpoced}
                  title="Mi URL"
                  className="absolute cursor-pointer text-xs top-0 bg-[#464C3666] rounded-full p-2 left-20 text-white mb-4 text-center z-50"
                >
                  URL: vesite/{biosite?.slug || "your-slug"}
                </div>
                <div className="absolute top-0 right-40">
                  <ShareButton />
                </div>
                <button
                  onClick={handleUpdateShareAction}
                  disabled={buttonContent.disabled}
                  className={`absolute text-xs top-0 rounded-lg p-2 right-20 text-white mb-4 text-center z-50 flex items-center space-x-1 transition-all duration-200 ${
                    buttonContent.disabled
                      ? "bg-[#464C3666] cursor-not-allowed"
                      : hasChanges
                      ? "bg-[#98C022] hover:bg-[#86A81E]"
                      : "bg-[#464C3666] hover:bg-[#464C36AA]"
                  } cursor-pointer`}
                  title="Actualizar VeSite"
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
      </div>

      {/* --- VISTA MÓVIL --- */}
      <div
        className={`lg:hidden flex flex-col h-screen relative ${
          isDrawerOpen ? "overflow-hidden" : ""
        }`}
        style={{
          background: `url(${imgP2}) no-repeat center center`,
          backgroundSize: "cover",
          height: "100%",
          width: "100%",
        }}
      >
        <div className="absolute inset-0 bg-white opacity-24 z-0"></div>

        <header className="flex items-center justify-between p-3 z-10 relative">
          <img
            src={getAvatarImage()}
            onClick={handleOpenSettings}
            className="w-8 h-8 cursor-pointer rounded-full object-cover"
            alt="profile"
          />
          <div className="flex items-center space-x-5">
            <button
              className="p-2 text-gray-400 rounded-full hover:bg-black/20 "
              onClick={handleOpenSettings}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            <div className="absolute top-3.5 right-18">
              <ShareButton />
            </div>
            <button
              onClick={handleUpdateShareAction}
              disabled={buttonContent.disabled}
              className={`px-4 cursor-pointer py-2 text-xs rounded-lg flex items-center space-x-1.5 transition-colors ${
                buttonContent.disabled
                  ? "bg-gray-600 text-gray-400"
                  : "bg-white text-black"
              }`}
            >
              {buttonContent.icon}
              <span>{buttonContent.text}</span>
            </button>
          </div>
        </header>

        <main
          className={`flex-1 overflow-hidden flex items-center justify-center p-0 ${
            isDrawerOpen ? "pointer-events-none" : ""
          }`}
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          <PhonePreview className="mobile-view">
            <LivePreviewContent />
          </PhonePreview>
        </main>

        <nav className="w-full flex mb-20 justify-around z-10">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleDrawerSectionClick(item.id)}
              className={`flex cursor-pointer flex-col items-center space-y-1 p-3 -mt-20 transition-colors ${
                selectedSection === item.id
                  ? "text-white"
                  : "text-white hover:text-white"
              }`}
            >
              {item.id === "sections" && <GanttChart size={22} />}
              {item.id === "style" && <Palette size={22} />}
              {item.id === "analytics" && <BarChartHorizontalBig size={22} />}
              {item.id === "admin" && <Shield size={22} />}
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* --- Drawer Deslizable --- */}
        {isDrawerOpen && (
          <>
            <div className="fixed inset-0  z-40" onClick={closeDrawer} />

            <div
              ref={drawerRef}
              className="fixed bottom-0 left-0 right-0 bg-[#E0EED5]/70 backdrop-blur-lg rounded-t-2xl shadow-2xl z-50 flex flex-col pointer-events-auto"
              style={{
                height: `${currentDrawerHeight}vh`,
                transition: isDragging ? "none" : "height 0.3s ease-in-out",
              }}
            >
              <div
                ref={dragHandleRef}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
                className="w-full py-4 cursor-grab active:cursor-grabbing flex-shrink-0"
              >
                <div className="flex justify-center items-center w-10 h-1.5 bg-gray-600 rounded-full mx-auto " />
                <div className="flex items-center justify-between px-4 pt-3">
                  {/* Back button for drawer navigation */}
                  <button
                    onClick={goBackToSections}
                    className="flex items-center space-x-2 text-gray-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-gray-800 font-semibold">
                    {getDrawerTitle()}
                  </h2>
                  <svg
                    width="50"
                    height="50"
                    viewBox="0 0 534 349"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_140_16)">
                      <path
                        d="M204.795 335H204.272C190.663 334.4 182.158 314.394 168.419 278.982C166.718 274.581 164.887 269.979 163.055 265.277C145.259 220.563 119.743 166.345 80.227 143.638C78.9185 143.037 78.6563 141.737 79.4417 140.737C80.0953 139.937 81.4038 139.636 82.5819 139.937C83.1051 140.037 95.9282 142.837 118.304 155.542C153.24 175.549 185.299 205.258 207.019 227.966C210.422 218.462 220.76 194.654 249.677 160.644C271.398 134.935 299.269 108.827 332.243 82.8181C373.46 50.5076 423.183 18.397 479.71 -12.6131C480.888 -13.3133 482.589 -13.0133 483.505 -12.113C484.291 -11.2127 484.159 -10.0123 482.982 -9.31204C482.85 -9.21201 463.747 2.19171 436.269 24.2989C398.583 55.0089 365.216 88.7201 336.823 124.832C301.101 170.146 267.341 229.566 233.583 306.491L233.451 306.591C222.591 326.198 213.694 335 204.795 335ZM97.3685 149.94C130.342 176.649 152.324 224.165 168.289 264.177C170.121 268.879 171.952 273.381 173.654 277.882C184.122 304.891 194.066 330.399 204.534 330.899C208.852 331.099 216.572 326.798 228.479 305.191C262.239 227.966 296.259 168.246 332.112 122.731C360.768 86.319 394.397 52.3081 432.474 21.398C435.353 19.0972 438.1 16.8965 440.718 14.8958C403.818 36.703 369.012 60.3108 336.3 85.719C303.456 111.427 275.978 137.336 254.388 162.744C224.946 197.355 213.039 224.065 210.945 233.367C210.814 234.168 209.899 234.868 208.852 235.068C207.805 235.268 206.628 234.968 205.973 234.268C184.513 211.56 151.409 180.15 115.294 159.343C109.537 155.842 103.649 152.741 97.3685 149.94Z"
                        fill="#fff"
                      />
                      <path
                        d="M419.632 46L414 53.3021L418.276 49.501C424.221 51.6016 418.693 56.1029 417.025 57.5033C425.473 54.4024 418.902 49.701 419.632 46Z"
                        fill="#96C121"
                      />
                      <path
                        d="M403.578 58C399.197 58.4001 401.283 62.1012 403.369 63.0014C403.265 61.301 405.664 58.9003 403.578 58Z"
                        fill="#96C121"
                      />
                      <path
                        d="M426.632 63L421 70.3021L425.276 66.501C431.221 68.6016 425.693 73.1029 424.025 74.5033C432.473 71.4024 425.902 66.701 426.632 63Z"
                        fill="#D3E7C0"
                      />
                      <path
                        d="M410.578 75C406.197 75.4001 408.283 79.1012 410.369 80.0014C410.265 78.301 412.664 75.9003 410.578 75Z"
                        fill="#D3E7C0"
                      />
                      <path
                        d="M427.632 80L422 87.3021L426.276 83.501C432.221 85.6016 426.693 90.1029 425.025 91.5033C433.473 88.4024 426.902 83.701 427.632 80Z"
                        fill="#E0EED5"
                      />
                      <path
                        d="M411.578 92C407.197 92.4001 409.283 96.1012 411.369 97.0014C411.265 95.301 413.664 92.9003 411.578 92Z"
                        fill="#E0EED5"
                      />
                      <path
                        d="M213.293 235.354C214.545 234.454 215.588 233.253 216.735 233.753C215.9 232.153 215.066 231.653 213.293 235.354Z"
                        fill="#96C121"
                      />
                      <path
                        d="M216.631 233.853L217.048 234.854V233.954L216.631 233.853Z"
                        fill="#96C121"
                      />
                      <path
                        d="M301.887 186.128C301.678 181.127 304.703 180.527 305.954 176.626L311.378 178.126C312.942 174.325 309.188 174.225 309.292 170.424C314.611 169.824 317.949 162.321 319.409 161.221C322.016 162.021 320.66 164.522 321.39 165.923C323.476 161.421 319.722 158.12 324.102 153.819L325.145 154.719C332.133 140.515 349.029 130.412 363.109 119.609C361.962 119.909 361.649 118.809 360.71 118.209C376.251 107.306 397.944 101.904 409.834 86C399.613 89.3009 379.067 88.8008 371.87 100.204C366.238 98.0034 363.109 105.605 359.25 101.904C344.231 107.606 342.25 116.808 330.673 125.411C328.378 125.911 327.648 123.31 325.771 121.81C328.587 119.009 330.986 115.508 334.323 113.207C331.82 113.708 329.317 114.508 326.918 115.508C327.961 111.407 336.096 109.406 334.323 105.105C327.44 114.008 311.691 122.01 308.353 131.813C312.629 130.212 316.071 126.011 320.452 123.31C323.268 123.31 326.814 122.21 328.17 124.311C321.182 138.015 309.396 141.616 301.47 153.719C299.384 156.52 295.733 159.621 293.335 158.52C294.378 156.32 291.457 156.32 291.979 154.219C289.997 159.121 298.549 160.221 292.709 164.622L286.555 158.72C291.874 166.323 279.776 164.922 280.923 172.124C276.856 171.724 277.377 167.823 279.672 164.422C275.604 167.223 279.567 170.424 277.169 173.225L273.101 166.323C276.543 173.325 267.678 171.224 264.236 171.824C265.592 173.025 271.641 174.325 268.303 178.026C266.217 179.226 265.279 177.426 264.027 177.226C265.383 178.426 267.156 181.427 265.8 184.328C263.297 183.628 263.61 180.627 261.524 179.226C260.377 181.427 259.855 183.428 257.039 184.028C256.622 188.829 260.272 185.528 261.315 189.029C256.413 194.031 253.389 185.628 247.444 185.328C247.027 179.226 249.321 172.524 249.426 169.223L245.775 179.026C243.481 177.126 237.744 182.827 238.057 176.626C230.131 184.528 226.689 197.131 225.333 207.034C226.793 206.134 228.149 204.734 229.713 205.634C229.296 210.835 226.063 209.035 223.664 209.235C223.977 213.436 228.879 214.736 231.487 218.137C224.29 223.639 226.689 225.54 218.658 229.741L223.56 230.841C218.137 233.942 225.333 236.843 220.848 240.544C219.701 240.544 219.075 238.343 218.449 236.643C218.658 241.244 213.026 239.344 213.547 243.945L209.167 239.244C208.124 242.544 208.541 247.846 204.265 244.945C208.437 252.147 203.222 261.75 204.891 269.652L200.719 268.352C203.118 270.853 201.762 274.354 201.136 277.855C190.811 260.65 176.731 245.045 159.939 235.542C156.81 232.542 147.632 233.442 142 232.141C145.65 237.143 148.258 235.442 152.742 239.544C154.828 243.745 151.595 248.846 151.178 253.648L153.577 249.246C160.669 251.047 154.098 253.748 161.19 254.348L154.724 258.849C159.104 257.649 158.896 262.75 157.957 265.151L163.381 263.45C162.963 267.952 163.172 270.452 159.313 273.853L163.485 271.153C161.399 273.853 171.203 282.756 161.295 282.956C162.859 283.356 165.571 283.056 166.197 285.357L161.816 287.857C164.528 290.258 167.24 293.159 165.049 295.06C163.068 293.959 160.878 294.359 158.583 294.759C164.111 307.663 174.958 290.758 181.215 302.262L178.087 303.362L182.78 305.062L180.381 309.864C186.639 310.064 188.203 314.165 189.663 319.467C191.645 323.668 192.479 327.269 196.547 331.97C199.05 335.871 214.278 339.672 221.37 334.471C228.775 329.869 226.48 329.97 227.732 328.469C228.775 326.168 229.505 323.768 229.609 321.267C230.965 314.765 237.431 313.565 238.37 306.263L233.26 305.863C239.204 301.761 245.879 284.757 258.395 283.056C255.475 278.055 257.248 283.256 253.285 282.456C249.843 273.053 258.082 274.254 262.046 270.753C260.898 265.351 259.125 274.053 256.205 270.652C262.046 264.051 251.616 262.95 257.665 254.548C260.69 254.448 258.708 257.349 260.377 258.849C257.665 251.247 264.131 239.844 267.469 230.541C274.874 221.138 284.261 207.334 294.795 198.832L293.335 197.732C300.427 195.831 300.218 189.229 305.642 185.528L301.887 186.128Z"
                        fill="#96C121"
                      />
                      <path
                        d="M300.381 184.339C300.172 179.338 303.197 178.738 304.448 174.837L309.872 176.337C311.436 172.536 307.682 172.436 307.786 168.635C313.105 168.035 316.443 160.532 317.903 159.432C320.51 160.232 319.154 162.733 319.884 164.134C321.97 159.632 318.216 156.331 322.596 152.03L323.639 152.93C330.627 138.726 347.523 128.623 361.603 117.82C360.456 118.12 360.143 117.02 359.204 116.42C374.745 105.517 396.438 100.115 408.328 84.2106C398.107 87.5115 377.561 87.0114 370.364 98.4147C364.732 96.214 361.603 103.816 357.744 100.115C342.725 105.817 340.744 115.019 329.167 123.622C326.872 124.122 326.142 121.521 324.265 120.021C327.081 117.22 329.48 113.719 332.817 111.418C330.314 111.919 327.811 112.719 325.412 113.719C326.455 109.618 334.59 107.617 332.817 103.316C325.934 112.219 310.185 120.221 306.847 130.024C311.123 128.423 314.565 124.222 318.946 121.521C321.762 121.521 325.308 120.421 326.664 122.522C319.676 136.226 307.89 139.827 299.964 151.93C297.878 154.731 294.227 157.832 291.829 156.731C292.872 154.531 289.951 154.531 290.473 152.43C288.491 157.332 297.043 158.432 291.203 162.833L285.049 156.931C290.368 164.534 278.27 163.133 279.417 170.335C275.35 169.935 275.871 166.034 278.166 162.633C274.098 165.434 278.061 168.635 275.663 171.436L271.595 164.534C275.037 171.536 266.172 169.435 262.73 170.035C264.086 171.236 270.135 172.536 266.797 176.237C264.711 177.437 263.773 175.637 262.521 175.437C263.877 176.637 265.65 179.638 264.294 182.539C261.791 181.839 262.104 178.838 260.018 177.437C258.871 179.638 258.349 181.639 255.533 182.239C255.116 187.04 258.766 183.739 259.809 187.24C254.907 192.242 251.883 183.839 245.938 183.539C245.521 177.437 247.815 170.735 247.92 167.434L244.269 177.237C241.975 175.337 236.238 181.038 236.551 174.837C228.625 182.739 225.183 195.342 223.827 205.245C225.287 204.345 226.643 202.945 228.207 203.845C227.79 209.046 224.557 207.246 222.158 207.446C222.471 211.647 227.373 212.947 229.981 216.348C222.784 221.85 225.183 223.751 217.152 227.952L222.054 229.052C216.631 232.153 223.827 235.054 219.342 238.755C218.195 238.755 217.569 236.554 216.943 234.854C217.152 239.455 211.52 237.555 212.041 242.156L207.661 237.455C206.618 240.755 207.035 246.057 202.759 243.156C206.931 250.358 201.716 259.961 203.385 267.863L199.213 266.563C201.612 269.064 200.256 272.565 199.63 276.066C189.305 258.861 175.225 243.256 158.433 233.753C155.304 230.753 146.126 231.653 140.494 230.352C144.144 235.354 146.752 233.653 151.236 237.755C153.322 241.956 150.089 247.057 149.672 251.859L152.071 247.457C159.163 249.258 152.592 251.959 159.684 252.559L153.218 257.06C157.598 255.86 157.39 260.961 156.451 263.362L161.875 261.661C161.457 266.163 161.666 268.663 157.807 272.064L161.979 269.364C159.893 272.064 169.697 280.967 159.789 281.167C161.353 281.567 164.065 281.267 164.691 283.568L160.31 286.068C163.022 288.469 165.734 291.37 163.543 293.271C161.562 292.17 159.372 292.57 157.077 292.97C162.605 305.874 173.452 288.969 179.709 300.473L176.581 301.573L181.274 303.273L178.875 308.075C185.133 308.275 186.697 312.376 188.157 317.678C190.139 321.879 190.973 325.48 195.041 330.181C197.544 334.082 212.772 337.883 219.864 332.682C227.269 328.08 224.974 328.181 226.226 326.68C227.269 324.379 227.999 321.979 228.103 319.478C229.459 312.976 235.925 311.776 236.864 304.474L231.754 304.074C237.698 299.972 244.373 282.968 256.889 281.267C253.969 276.266 255.742 281.467 251.779 280.667C248.337 271.264 256.576 272.465 260.54 268.964C259.392 263.562 257.619 272.264 254.699 268.863C260.54 262.262 250.11 261.161 256.159 252.759C259.184 252.659 257.202 255.56 258.871 257.06C256.159 249.458 262.625 238.055 265.963 228.752C273.368 219.349 282.755 205.545 293.289 197.043L291.829 195.943C298.921 194.042 298.712 187.44 304.136 183.739L300.381 184.339Z"
                        fill="#E0EED5"
                      />
                      <path
                        d="M292.887 171.128C292.678 166.127 295.703 165.527 296.954 161.626L302.378 163.126C303.942 159.325 300.188 159.225 300.292 155.424C305.611 154.824 308.949 147.321 310.409 146.221C313.016 147.021 311.66 149.522 312.39 150.923C314.476 146.421 310.722 143.12 315.102 138.819L316.145 139.719C323.133 125.515 340.029 115.412 354.109 104.609C352.962 104.909 352.649 103.809 351.71 103.209C367.251 92.3064 388.944 86.9044 400.834 71C390.613 74.3009 370.067 73.8008 362.87 85.2041C357.238 83.0034 354.109 90.6054 350.25 86.9044C335.231 92.6064 333.25 101.808 321.673 110.411C319.378 110.911 318.648 108.31 316.771 106.81C319.587 104.009 321.986 100.508 325.323 98.2074C322.82 98.7084 320.317 99.5084 317.918 100.508C318.961 96.4074 327.096 94.4064 325.323 90.1054C318.44 99.0084 302.691 107.01 299.353 116.813C303.629 115.212 307.071 111.011 311.452 108.31C314.268 108.31 317.814 107.21 319.17 109.311C312.182 123.015 300.396 126.616 292.47 138.719C290.384 141.52 286.733 144.621 284.335 143.52C285.378 141.32 282.457 141.32 282.979 139.219C280.997 144.121 289.549 145.221 283.709 149.622L277.555 143.72C282.874 151.323 270.776 149.922 271.923 157.124C267.856 156.724 268.377 152.823 270.672 149.422C266.604 152.223 270.567 155.424 268.169 158.225L264.101 151.323C267.543 158.325 258.678 156.224 255.236 156.824C256.592 158.025 262.641 159.325 259.303 163.026C257.217 164.226 256.279 162.426 255.027 162.226C256.383 163.426 258.156 166.427 256.8 169.328C254.297 168.628 254.61 165.627 252.524 164.226C251.377 166.427 250.855 168.428 248.039 169.028C247.622 173.829 251.272 170.528 252.315 174.029C247.413 179.031 244.389 170.628 238.444 170.328C238.027 164.226 240.321 157.524 240.426 154.223L236.775 164.026C234.481 162.126 228.744 167.827 229.057 161.626C221.131 169.528 217.689 182.131 216.333 192.034C217.793 191.134 219.149 189.734 220.713 190.634C220.296 195.835 217.063 194.035 214.664 194.235C214.977 198.436 219.879 199.736 222.487 203.137C215.29 208.639 217.689 210.54 209.658 214.741L214.56 215.841C209.137 218.942 216.333 221.843 211.848 225.544C210.701 225.544 210.075 223.343 209.449 221.643C209.658 226.244 204.026 224.344 204.547 228.945L200.167 224.244C199.124 227.544 199.541 232.846 195.265 229.945C199.437 237.147 194.222 246.75 195.891 254.652L191.719 253.352C194.118 255.853 192.762 259.354 192.136 262.855C181.811 245.65 167.731 230.045 150.939 220.542C147.81 217.542 138.632 218.442 133 217.141C136.65 222.143 139.258 220.442 143.742 224.544C145.828 228.745 142.595 233.846 142.178 238.648L144.577 234.246C151.669 236.047 145.098 238.748 152.19 239.348L145.724 243.849C150.104 242.649 149.896 247.75 148.957 250.151L154.381 248.45C153.963 252.952 154.172 255.452 150.313 258.853L154.485 256.153C152.399 258.853 162.203 267.756 152.295 267.956C153.859 268.356 156.571 268.056 157.197 270.357L152.816 272.857C155.528 275.258 158.24 278.159 156.049 280.06C154.068 278.959 151.878 279.359 149.583 279.759C155.111 292.663 165.958 275.758 172.215 287.262L169.087 288.362L173.78 290.062L171.381 294.864C177.639 295.064 179.203 299.165 180.663 304.467C182.645 308.668 183.479 312.269 187.547 316.97C190.05 320.871 205.278 324.672 212.37 319.471C219.775 314.869 217.48 314.97 218.732 313.469C219.775 311.168 220.505 308.768 220.609 306.267C221.965 299.765 228.431 298.565 229.37 291.263L224.26 290.863C230.204 286.761 236.879 269.757 249.395 268.056C246.475 263.055 248.248 268.256 244.285 267.456C240.843 258.053 249.082 259.254 253.046 255.753C251.898 250.351 250.125 259.053 247.205 255.652C253.046 249.051 242.616 247.95 248.665 239.548C251.69 239.448 249.708 242.349 251.377 243.849C248.665 236.247 255.131 224.844 258.469 215.541C265.874 206.138 275.261 192.334 285.795 183.832L284.335 182.732C291.427 180.831 291.218 174.229 296.642 170.528L292.887 171.128Z"
                        fill="#D3E7C0"
                      />
                      <path
                        d="M275.887 161.128C275.678 156.127 278.703 155.527 279.954 151.626L285.378 153.126C286.942 149.325 283.188 149.225 283.292 145.424C288.611 144.824 291.949 137.321 293.409 136.221C296.016 137.021 294.66 139.522 295.39 140.923C297.476 136.421 293.722 133.12 298.102 128.819L299.145 129.719C306.133 115.515 323.029 105.412 337.109 94.6094C335.962 94.9094 335.649 93.8094 334.71 93.2094C350.251 82.3064 371.944 76.9044 383.834 61C373.613 64.3009 353.067 63.8008 345.87 75.2041C340.238 73.0034 337.109 80.6054 333.25 76.9044C318.231 82.6064 316.25 91.8084 304.673 100.411C302.378 100.911 301.648 98.3104 299.771 96.8104C302.587 94.0094 304.986 90.5084 308.323 88.2074C305.82 88.7084 303.317 89.5084 300.918 90.5084C301.961 86.4074 310.096 84.4064 308.323 80.1054C301.44 89.0084 285.691 97.0104 282.353 106.813C286.629 105.212 290.071 101.011 294.452 98.3104C297.268 98.3104 300.814 97.2104 302.17 99.3114C295.182 113.015 283.396 116.616 275.47 128.719C273.384 131.52 269.733 134.621 267.335 133.52C268.378 131.32 265.457 131.32 265.979 129.219C263.997 134.121 272.549 135.221 266.709 139.622L260.555 133.72C265.874 141.323 253.776 139.922 254.923 147.124C250.856 146.724 251.377 142.823 253.672 139.422C249.604 142.223 253.567 145.424 251.169 148.225L247.101 141.323C250.543 148.325 241.678 146.224 238.236 146.824C239.592 148.025 245.641 149.325 242.303 153.026C240.217 154.226 239.279 152.426 238.027 152.226C239.383 153.426 241.156 156.427 239.8 159.328C237.297 158.628 237.61 155.627 235.524 154.226C234.377 156.427 233.855 158.428 231.039 159.028C230.622 163.829 234.272 160.528 235.315 164.029C230.413 169.031 227.389 160.628 221.444 160.328C221.027 154.226 223.321 147.524 223.426 144.223L219.775 154.026C217.481 152.126 211.744 157.827 212.057 151.626C204.131 159.528 200.689 172.131 199.333 182.034C200.793 181.134 202.149 179.734 203.713 180.634C203.296 185.835 200.063 184.035 197.664 184.235C197.977 188.436 202.879 189.736 205.487 193.137C198.29 198.639 200.689 200.54 192.658 204.741L197.56 205.841C192.137 208.942 199.333 211.843 194.848 215.544C193.701 215.544 193.075 213.343 192.449 211.643C192.658 216.244 187.026 214.344 187.547 218.945L183.167 214.244C182.124 217.544 182.541 222.846 178.265 219.945C182.437 227.147 177.222 236.75 178.891 244.652L174.719 243.352C177.118 245.853 175.762 249.354 175.136 252.855C164.811 235.65 150.731 220.045 133.939 210.542C130.81 207.542 121.632 208.442 116 207.141C119.65 212.143 122.258 210.442 126.742 214.544C128.828 218.745 125.595 223.846 125.178 228.648L127.577 224.246C134.669 226.047 128.098 228.748 135.19 229.348L128.724 233.849C133.104 232.649 132.896 237.75 131.957 240.151L137.381 238.45C136.963 242.952 137.172 245.452 133.313 248.853L137.485 246.153C135.399 248.853 145.203 257.756 135.295 257.956C136.859 258.356 139.571 258.056 140.197 260.357L135.816 262.857C138.528 265.258 141.24 268.159 139.049 270.06C137.068 268.959 134.878 269.359 132.583 269.759C138.111 282.663 148.958 265.758 155.215 277.262L152.087 278.362L156.78 280.062L154.381 284.864C160.639 285.064 162.203 289.165 163.663 294.467C165.645 298.668 166.479 302.269 170.547 306.97C173.05 310.871 188.278 314.672 195.37 309.471C202.775 304.869 200.48 304.97 201.732 303.469C202.775 301.168 203.505 298.768 203.609 296.267C204.965 289.765 211.431 288.565 212.37 281.263L207.26 280.863C213.204 276.761 219.879 259.757 232.395 258.056C229.475 253.055 231.248 258.256 227.285 257.456C223.843 248.053 232.082 249.254 236.046 245.753C234.898 240.351 233.125 249.053 230.205 245.652C236.046 239.051 225.616 237.95 231.665 229.548C234.69 229.448 232.708 232.349 234.377 233.849C231.665 226.247 238.131 214.844 241.469 205.541C248.874 196.138 258.261 182.334 268.795 173.832L267.335 172.732C274.427 170.831 274.218 164.229 279.642 160.528L275.887 161.128Z"
                        fill="#E0EED5"
                      />
                      <path
                        d="M278.887 163.128C278.678 158.127 281.703 157.527 282.954 153.626L288.378 155.126C289.942 151.325 286.188 151.225 286.292 147.424C291.611 146.824 294.949 139.321 296.409 138.221C299.016 139.021 297.66 141.522 298.39 142.923C300.476 138.421 296.722 135.12 301.102 130.819L302.145 131.719C309.133 117.515 326.029 107.412 340.109 96.6094C338.962 96.9094 338.649 95.8094 337.71 95.2094C353.251 84.3064 374.944 78.9044 386.834 63C376.613 66.3009 356.067 65.8008 348.87 77.2041C343.238 75.0034 340.109 82.6054 336.25 78.9044C321.231 84.6064 319.25 93.8084 307.673 102.411C305.378 102.911 304.648 100.31 302.771 98.8104C305.587 96.0094 307.986 92.5084 311.323 90.2074C308.82 90.7084 306.317 91.5084 303.918 92.5084C304.961 88.4074 313.096 86.4064 311.323 82.1054C304.44 91.0084 288.691 99.0104 285.353 108.813C289.629 107.212 293.071 103.011 297.452 100.31C300.268 100.31 303.814 99.2104 305.17 101.311C298.182 115.015 286.396 118.616 278.47 130.719C276.384 133.52 272.733 136.621 270.335 135.52C271.378 133.32 268.457 133.32 268.979 131.219C266.997 136.121 275.549 137.221 269.709 141.622L263.555 135.72C268.874 143.323 256.776 141.922 257.923 149.124C253.856 148.724 254.377 144.823 256.672 141.422C252.604 144.223 256.567 147.424 254.169 150.225L250.101 143.323C253.543 150.325 244.678 148.224 241.236 148.824C242.592 150.025 248.641 151.325 245.303 155.026C243.217 156.226 242.279 154.426 241.027 154.226C242.383 155.426 244.156 158.427 242.8 161.328C240.297 160.628 240.61 157.627 238.524 156.226C237.377 158.427 236.855 160.428 234.039 161.028C233.622 165.829 237.272 162.528 238.315 166.029C233.413 171.031 230.389 162.628 224.444 162.328C224.027 156.226 226.321 149.524 226.426 146.223L222.775 156.026C220.481 154.126 214.744 159.827 215.057 153.626C207.131 161.528 203.689 174.131 202.333 184.034C203.793 183.134 205.149 181.734 206.713 182.634C206.296 187.835 203.063 186.035 200.664 186.235C200.977 190.436 205.879 191.736 208.487 195.137C201.29 200.639 203.689 202.54 195.658 206.741L200.56 207.841C195.137 210.942 202.333 213.843 197.848 217.544C196.701 217.544 196.075 215.343 195.449 213.643C195.658 218.244 190.026 216.344 190.547 220.945L186.167 216.244C185.124 219.544 185.541 224.846 181.265 221.945C185.437 229.147 180.222 238.75 181.891 246.652L177.719 245.352C180.118 247.853 178.762 251.354 178.136 254.855C167.811 237.65 153.731 222.045 136.939 212.542C133.81 209.542 124.632 210.442 119 209.141C122.65 214.143 125.258 212.442 129.742 216.544C131.828 220.745 128.595 225.846 128.178 230.648L130.577 226.246C137.669 228.047 131.098 230.748 138.19 231.348L131.724 235.849C136.104 234.649 135.896 239.75 134.957 242.151L140.381 240.45C139.963 244.952 140.172 247.452 136.313 250.853L140.485 248.153C138.399 250.853 148.203 259.756 138.295 259.956C139.859 260.356 142.571 260.056 143.197 262.357L138.816 264.857C141.528 267.258 144.24 270.159 142.049 272.06C140.068 270.959 137.878 271.359 135.583 271.759C141.111 284.663 151.958 267.758 158.215 279.262L155.087 280.362L159.78 282.062L157.381 286.864C163.639 287.064 165.203 291.165 166.663 296.467C168.645 300.668 169.479 304.269 173.547 308.97C176.05 312.871 191.278 316.672 198.37 311.471C205.775 306.869 203.48 306.97 204.732 305.469C205.775 303.168 206.505 300.768 206.609 298.267C207.965 291.765 214.431 290.565 215.37 283.263L210.26 282.863C216.204 278.761 222.879 261.757 235.395 260.056C232.475 255.055 234.248 260.256 230.285 259.456C226.843 250.053 235.082 251.254 239.046 247.753C237.898 242.351 236.125 251.053 233.205 247.652C239.046 241.051 228.616 239.95 234.665 231.548C237.69 231.448 235.708 234.349 237.377 235.849C234.665 228.247 241.131 216.844 244.469 207.541C251.874 198.138 261.261 184.334 271.795 175.832L270.335 174.732C277.427 172.831 277.218 166.229 282.642 162.528L278.887 163.128Z"
                        fill="#96C121"
                      />
                      <path
                        d="M333.13 97.0143L329.793 94.1134L324.682 99.9151C329.271 101.316 328.958 98.2146 333.13 97.0143Z"
                        fill="#96C121"
                      />
                      <path
                        d="M338.554 108.418L340.744 105.017L335.633 108.017L338.554 108.418Z"
                        fill="#96C121"
                      />
                      <path
                        d="M267.006 160.833L268.153 160.432L273.472 147.729L267.006 160.833Z"
                        fill="#96C121"
                      />
                      <path
                        d="M209.225 233.653C207.557 231.553 209.225 229.652 208.287 227.652V234.354L209.225 233.653Z"
                        fill="#96C121"
                      />
                      <path
                        d="M177.311 289.269C184.611 292.77 176.372 293.771 183.986 291.87C183.36 288.169 179.709 290.77 177.311 289.269Z"
                        fill="#96C121"
                      />
                      <path
                        d="M186.176 303.273C186.802 301.673 185.863 300.473 184.82 299.372C180.961 300.873 184.924 301.673 186.176 303.273Z"
                        fill="#96C121"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_140_16">
                        <rect width="534" height="349" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {renderDrawerContent()}
              </div>
            </div>
          </>
        )}
      </div>
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleLogoutFromSettings}
        onProfileSelect={handleProfileSelect}
        onCreateNewSite={handleCreateNewSite}
      />
    </>
  );
};

export default Layout;
