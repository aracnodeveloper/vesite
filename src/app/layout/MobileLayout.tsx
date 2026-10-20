import { Outlet } from "react-router-dom";
import { X } from "lucide-react";
import veSite from "../../assets/img/veSite.svg";
import ShareButton from "../../shared/ui/ShareButton.tsx";
import type { BiositeFull } from "../../features/biosite/types/Biosite.ts";
import type { NavItem } from "./navigation";
import type { useMobileDrawer } from "./useMobileDrawer";
import { BiositePhonePreview, UpdateButtonContent } from "./BiositePhonePreview";

interface MobileLayoutProps {
  biosite: BiositeFull | null;
  navItems: NavItem[];
  onItemClick: (item: NavItem) => void;
  drawer: ReturnType<typeof useMobileDrawer>;
  avatarSrc: string;
  onOpenSettings: () => void;
  isUpdating: boolean;
  onUpdate: () => void;
}

const MobileLayout = ({
  biosite,
  navItems,
  onItemClick,
  drawer,
  avatarSrc,
  onOpenSettings,
  isUpdating,
  onUpdate,
}: MobileLayoutProps) => (
  <div
    className={`flex flex-col h-screen relative ${drawer.isOpen ? "overflow-hidden" : ""}`}
    style={{ backgroundColor: `white`, height: "100%", width: "100%" }}
  >
    <div className="absolute inset-0 bg-white opacity-24 z-0"></div>

    <header className="flex items-center justify-between p-3 z-10 relative">
      <img
        src={avatarSrc}
        onClick={onOpenSettings}
        className="w-8 h-8 cursor-pointer rounded-full object-cover"
        alt="profile"
      />
      <div className="flex items-center space-x-5">
        <button className="p-2 text-gray-400 rounded-full hover:bg-black/20 ml-3 " onClick={onOpenSettings}>
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
        <div className="absolute top-3.5 right-21">
          <ShareButton />
        </div>
        <button
          onClick={onUpdate}
          disabled={isUpdating}
          className={`px-4 cursor-pointer py-2 text-xs rounded-lg flex items-center space-x-1.5 transition-colors ${
            isUpdating ? "bg-gray-600 text-gray-400" : "bg-white text-black"
          }`}
        >
          <UpdateButtonContent isUpdating={isUpdating} />
        </button>
      </div>
    </header>

    <main
      className={`flex-1 overflow-hidden flex items-center justify-center p-0 ${
        drawer.isOpen ? "pointer-events-none" : ""
      }`}
      style={{ maxHeight: "calc(100vh - 100px)", paddingBottom: drawer.isOpen ? "80px" : "0" }}
    >
      <BiositePhonePreview biosite={biosite} />
    </main>

    {/* Menú inferior, siempre visible */}
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 shadow-lg z-[60]">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 ${
              drawer.selectedSection === item.id
                ? "text-[#98C022] bg-[#98C022]/10"
                : "text-gray-600 hover:text-[#98C022] hover:bg-gray-100"
            }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>

    {drawer.isOpen && (
      <div
        ref={drawer.drawerRef}
        className="fixed bottom-0 p-4 left-0 right-0 bg-[#E0EED5]/95 backdrop-blur-lg rounded-t-2xl shadow-2xl z-50 flex flex-col pointer-events-auto"
        style={{
          height: `${drawer.height}vh`,
          transition: "height 0.3s ease-in-out",
          paddingBottom: "90px", // Espacio para el menú inferior
        }}
      >
        <div className="flex items-center justify-between pb-2 flex-shrink-0">
          <div className=" w-[40px] h-[40px] flex flex-col items-center justify-center">
            <img src={veSite} alt="logo" className="w-full h-full" />
          </div>
          <div
            onMouseDown={drawer.handleDragStart}
            onTouchStart={drawer.handleDragStart}
            className="flex-1 pb-2 cursor-grab active:cursor-grabbing flex justify-center"
          >
            <div className="w-10 h-1.5 bg-gray-600 rounded-full" />
          </div>
          <button
            onClick={drawer.close}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200/50 rounded-full transition-colors"
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <Outlet />
        </div>
      </div>
    )}
  </div>
);

export default MobileLayout;
