import { Outlet } from "react-router-dom";
import { ExternalLink, Settings } from "lucide-react";
import ShareButton from "../../shared/ui/ShareButton.tsx";
import type { BiositeFull } from "../../features/biosite/types/Biosite.ts";
import { getNavItemClass, type NavItem } from "./navigation";
import { BiositePhonePreview, UpdateButtonContent } from "./BiositePhonePreview";

interface DesktopLayoutProps {
  biosite: BiositeFull | null;
  navItems: NavItem[];
  activeItem: string;
  onItemClick: (item: NavItem) => void;
  onOpenSettings: () => void;
  navAvatarSrc: string;
  avatarSrc: string;
  backgroundSrc: string;
  onAvatarError: () => void;
  profileBackground?: string;
  showPreviewPanel: boolean;
  hasChanges: boolean;
  isUpdating: boolean;
  onUpdate: () => void;
  onOpenPublicUrl: () => void;
}

const DesktopLayout = ({
  biosite,
  navItems,
  activeItem,
  onItemClick,
  onOpenSettings,
  navAvatarSrc,
  avatarSrc,
  backgroundSrc,
  onAvatarError,
  profileBackground,
  showPreviewPanel,
  hasChanges,
  isUpdating,
  onUpdate,
  onOpenPublicUrl,
}: DesktopLayoutProps) => (
  <div className="flex flex-col lg:flex-row h-screen bg-[#E0EED5] sm:pl-4 sm:pr-4 overflow-x-hidden md:overflow-y-hidden">
    <nav className="w-16 xl:w-14 bg-[#FAFFF6] shadow-lg mt-10 mb-4 flex-col items-center space-y-6 rounded-full mr-4 hidden lg:flex">
      <button className=" p-2 cursor-pointer rounded-t-full">
        <img
          src={navAvatarSrc}
          onClick={onOpenSettings}
          className="rounded-full w-10 h-10 xl:w-10 xl:h-10 object-cover "
          alt="perfil"
          onError={onAvatarError}
        />
      </button>
      <div className="flex flex-col space-y-4 mt-7">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item)}
            className={`p-4 pl-4 rounded-lg transition-all duration-200 cursor-pointer ${getNavItemClass(item, activeItem)}`}
            title={item.label}
          >
            <item.icon size={20} />
          </button>
        ))}
      </div>
      <div className="mt-auto pb-5 z-10">
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer z-10"
          title="Settings"
        >
          <Settings />
        </button>
      </div>
    </nav>

    <div className="flex-1 w-1/2 flex flex-col lg:flex-row ">
      <main
        className="flex w-full justify-center items-center overflow-y-auto p-3 sm:p-6 "
        style={{ backgroundColor: "#E0EED5" }}
      >
        {showPreviewPanel && (
          <div className={`relative -top-100 -right-180 ${biosite?.avatarImage === null ? "hidden" : ""}`}>
            <img
              src={avatarSrc}
              onClick={onOpenSettings}
              className="rounded-full w-10 h-10 xl:w-18 xl:h-16 object-cover "
              alt="perfil"
              onError={onAvatarError}
            />
          </div>
        )}
        <div className="w-full h-full flex justify-center items-center z-20">
          <Outlet />
        </div>
      </main>
    </div>

    {showPreviewPanel && (
      <div className=" w-1/2 flex justify-center items-center relative">
        <div
          className="absolute inset-0"
          style={{ backgroundColor: profileBackground, height: "110%", width: "110%" }}
        />
        <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
          <button
            onClick={onOpenPublicUrl}
            title="Mi URL"
            className={`text-xs cursor-pointer rounded-lg px-3 py-2 text-white flex items-center space-x-1.5 transition-all duration-200 ${
              isUpdating ? "bg-gray-600/60 cursor-not-allowed" : "bg-black/20 hover:bg-black/30"
            } backdrop-blur-sm`}
          >
            <ExternalLink className="w-3 h-3" />
            <span className="truncate max-w-[120px]">vesite/{biosite?.slug || "your-slug"}</span>
          </button>

          <div className="flex items-center space-x-2">
            <ShareButton />
            <button
              onClick={onUpdate}
              disabled={isUpdating}
              className={`text-xs cursor-pointer rounded-lg px-3 py-2 text-white flex items-center space-x-1.5 transition-all duration-200 ${
                isUpdating
                  ? "bg-gray-600/60 cursor-not-allowed"
                  : hasChanges
                    ? "bg-[#98C022] hover:bg-[#86A81E]"
                    : "bg-black/20 hover:bg-black/30"
              } backdrop-blur-sm`}
              title="Actualizar VeSite"
            >
              <UpdateButtonContent isUpdating={isUpdating} />
            </button>
          </div>
        </div>
        <div>
          <img
            src={backgroundSrc}
            alt="Background"
            className={`absolute top-27.5 left-0 w-full h-52 object-cover opacity-50 ${
              backgroundSrc.startsWith("data") ? "hidden" : ""
            } ${biosite?.backgroundImage === null ? "hidden" : ""}`}
            style={{ clipPath: "polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)" }}
          />
        </div>
        <BiositePhonePreview biosite={biosite} />
      </div>
    )}
  </div>
);

export default DesktopLayout;
