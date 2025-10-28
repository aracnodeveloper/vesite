import Add from "../components/layers/AddMoreSections/addMore";
import MySite from "../components/layers/MySite/Mysite";
import Cookie from "js-cookie";
import apiService from "../service/apiService.ts";
import { useEffect } from "react";
import { usePreview } from "../context/PreviewContext.tsx";
//import {FirstOne} from "../components/global/Page/FirstOne.tsx"

const Sections = () => {
  const { biosite, getVideoEmbed, appLinks } = usePreview();

  const updateAdminAndChildrenBackground = async (backgroundImage: string) => {
    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

    if (!isAdmin || !userId) {
      return;
    }

    try {
      await apiService.patch(
          `/biosites/admin/update-background/${userId}?background=${encodeURIComponent(
              backgroundImage
          )}`,
          {}
      );
      console.log("Background updated for admin and children successfully");
    } catch (error) {
      console.error("Error updating background for admin and children:", error);
      throw error;
    }
  };

  const updateAdminAndChildrenVideoEffect = async (videoUrl: string) => {
    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

    if (!isAdmin || !userId) {
      return;
    }

    try {
      await apiService.patch(
          `/biosites/admin/update-video/${userId}?video=${encodeURIComponent(
              videoUrl
          )}`,
          {}
      );
      console.log("Video updated for admin and children successfully");
    } catch (error) {
      console.error("Error updating video for admin and children:", error);
      throw error;
    }
  };

  // 🔥 NUEVA FUNCIÓN: Actualizar apps en biosites hijos
  const updateAdminAndChildrenApp = async (type: "appstore" | "googleplay", appUrl: string) => {
    const role = Cookie.get("roleName");
    const userId = Cookie.get("userId");
    const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

    if (!isAdmin || !userId) {
      return;
    }

    try {
      await apiService.patch(
          `/biosites/admin/update-app/${userId}?type=${type}&appUrl=${encodeURIComponent(appUrl)}`,
          {}
      );
      console.log(`${type} updated for admin and children successfully`);
    } catch (error) {
      console.error(`Error updating ${type} for admin and children:`, error);
      throw error;
    }
  };

  // Effect para background
  useEffect(() => {
    const executeAdminBackgroundUpdate = async () => {
      const role = Cookie.get("roleName");
      const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      if (isAdmin && biosite?.backgroundImage) {
        try {
          await updateAdminAndChildrenBackground(biosite.backgroundImage);
        } catch (error) {
          console.error("Error updating admin background after login:", error);
        }
      }
    };

    if (biosite) {
      executeAdminBackgroundUpdate();
    }
  }, [biosite]);

  // Effect para video
  useEffect(() => {
    const executeAdminVideoUpdate = async () => {
      const role = Cookie.get("roleName");
      const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      if (isAdmin) {
        const videoEmbed = getVideoEmbed();
        if (videoEmbed && videoEmbed.url) {
          try {
            await updateAdminAndChildrenVideoEffect(videoEmbed.url);
          } catch (error) {
            console.error("Error updating admin video after login:", error);
          }
        }
      }
    };

    if (biosite) {
      executeAdminVideoUpdate();
    }
  }, [biosite, getVideoEmbed]);

  // 🔥 NUEVO EFFECT: Para actualizar apps (App Store y Google Play)
  useEffect(() => {
    const executeAdminAppUpdate = async () => {
      const role = Cookie.get("roleName");
      const isAdmin = role === "SUPER_ADMIN" || role === "ADMIN";

      if (isAdmin && appLinks && appLinks.length > 0) {
        try {
          // Buscar App Store activo
          const appStore = appLinks.find(
              (link) => link.store === "appstore" && link.isActive === true
          );
          if (appStore && appStore.url) {
            await updateAdminAndChildrenApp("appstore", appStore.url);
          }

          // Buscar Google Play activo
          const googlePlay = appLinks.find(
              (link) => link.store === "googleplay" && link.isActive === true
          );
          if (googlePlay && googlePlay.url) {
            await updateAdminAndChildrenApp("googleplay", googlePlay.url);
          }
        } catch (error) {
          console.error("Error updating admin apps after login:", error);
        }
      }
    };

    if (biosite && appLinks) {
      executeAdminAppUpdate();
    }
  }, [biosite, appLinks]);

  return (
      <div className="flex max-w-[420px] flex-wrap gap-y-5 justify-center w-full h-full transform scale-[0.85]">
        <MySite />
        <Add />
      </div>
  );
};

export default Sections;