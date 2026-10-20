import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Cookie from "js-cookie";
import imgP from "../../assets/img/img.png";
import { useAuthContext } from "../../features/auth/hooks/useAuthContext.ts";
import { usePreview } from "../../features/biosite/context/PreviewContext.tsx";
import { useChangeDetection } from "../../features/biosite/hooks/useChangeDetection.ts";
import { useUpdateShareActions } from "../../features/biosite/hooks/useUpdateShareActions.ts";
import SettingsModal from "../../features/biosite/settings/SettingsModal.tsx";
import { blackCardService } from "../../features/blackcard/services/blackCardService.ts";
import { getThemeConfig } from "../../shared/utils/biositeUtils.ts";
import { canAccessAdmin, canUseBlackCard } from "../../core/auth/session";
import { getNavItems, toSafeImage, type NavItem } from "./navigation";
import { useMobileDrawer } from "./useMobileDrawer";
import DesktopLayout from "./DesktopLayout";
import MobileLayout from "./MobileLayout";

const PUBLIC_SITE_URL = "https://visitaecuador.com/vesite";

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, role, user } = useAuthContext();
  const { biosite } = usePreview();
  const { hasChanges, markAsSaved, resetChangeDetection } = useChangeDetection();
  const { isUpdating, handleUpdate } = useUpdateShareActions();
  const drawer = useMobileDrawer();

  const userId = Cookie.get("userId");
  const navItems = getNavItems({
    hasAdminAccess: canAccessAdmin(role, user?.id),
    hasBlackCard: canUseBlackCard(userId),
    userId,
  });

  const [activeItem, setActiveItem] = useState<string>("layers");
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (biosite) {
      resetChangeDetection();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [biosite?.id]);

  useEffect(() => {
    setAvatarError(false);
  }, [biosite?.avatarImage]);

  const openBlackCard = async () => {
    if (!userId) return;

    try {
      const member = await blackCardService.getMemberByUserId(userId);
      window.open(`${PUBLIC_SITE_URL}/blackcard/${member.memberId}`, "_blank");
      setActiveItem("blackcard");
      drawer.open();
    } catch {
      console.warn("Este usuario no tiene Black Card asignada");
    }
  };

  const handleDesktopItemClick = (item: NavItem) => {
    if (item.id === "blackcard") {
      openBlackCard();
      return;
    }
    setActiveItem(item.id);
    navigate(item.to);
    drawer.open();
  };

  const handleMobileItemClick = (item: NavItem) => {
    if (item.id === "blackcard") {
      openBlackCard();
      return;
    }
    drawer.openSection(item.id);
  };

  const openPublicUrl = () => {
    if (biosite?.slug) {
      window.open(`${PUBLIC_SITE_URL}/${biosite.slug}`, "_blank");
    } else {
      console.warn("No hay slug disponible para la navegación");
    }
  };

  const saveChanges = async () => {
    if (hasChanges) {
      await handleUpdate();
      markAsSaved();
    }
  };

  const handleLogout = () => {
    setIsSettingsModalOpen(false);
    logout();
    navigate("/login");
  };

  const openSettings = () => setIsSettingsModalOpen(true);
  const avatarSrc = avatarError ? imgP : toSafeImage(biosite?.avatarImage, imgP);
  const showPreviewPanel = location.pathname !== "/analytics" && location.pathname !== "/admin";

  return (
    <>
      {isDesktop ? (
        <DesktopLayout
          biosite={biosite}
          navItems={navItems}
          activeItem={activeItem}
          onItemClick={handleDesktopItemClick}
          onOpenSettings={openSettings}
          navAvatarSrc={biosite?.avatarImage || biosite?.backgroundImage || imgP}
          avatarSrc={avatarSrc}
          backgroundSrc={avatarError ? imgP : toSafeImage(biosite?.backgroundImage, imgP)}
          onAvatarError={() => setAvatarError(true)}
          profileBackground={getThemeConfig(biosite)?.colors.profileBackground}
          showPreviewPanel={showPreviewPanel}
          hasChanges={hasChanges}
          isUpdating={isUpdating}
          onUpdate={saveChanges}
          onOpenPublicUrl={openPublicUrl}
        />
      ) : (
        <MobileLayout
          biosite={biosite}
          navItems={navItems}
          onItemClick={handleMobileItemClick}
          drawer={drawer}
          avatarSrc={avatarSrc}
          onOpenSettings={openSettings}
          isUpdating={isUpdating}
          onUpdate={saveChanges}
        />
      )}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onLogout={handleLogout}
        onProfileSelect={(profile) => console.log("Profile selected:", profile)}
        onCreateNewSite={() => navigate("/create-site")}
      />
    </>
  );
};

export default Layout;
