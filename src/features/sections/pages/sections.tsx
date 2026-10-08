import Add from "../components/addMore";
import MySite from "../../biosite/components/Mysite";
import { useEffect } from "react";
import { usePreview } from "../../biosite/context/PreviewContext.tsx";
import { getSessionAdminId } from "../../../core/auth/session";
import { biositeService } from "../../biosite/services/biositeService";

const Sections = () => {
  const { biosite, getVideoEmbed } = usePreview();

  // Al entrar, un admin propaga su fondo a los biosites de sus usuarios hijos
  useEffect(() => {
    const adminId = getSessionAdminId();
    if (!adminId || !biosite?.backgroundImage) return;

    biositeService
      .updateChildrenBackground(adminId, biosite.backgroundImage)
      .catch((error) => console.error("Error updating admin background after login:", error));
  }, [biosite]);

  // ...y también el video de fondo, si tiene uno
  useEffect(() => {
    const adminId = getSessionAdminId();
    if (!adminId || !biosite) return;

    const videoUrl = getVideoEmbed()?.url;
    if (!videoUrl) return;

    biositeService
      .updateChildrenVideo(adminId, videoUrl)
      .catch((error) => console.error("Error updating admin video after login:", error));
  }, [biosite, getVideoEmbed]);

  return (
    <div className="flex max-w-[420px] flex-wrap gap-y-5 justify-center w-full h-full transform scale-[0.85]">
      <MySite />
      <Add />
    </div>
  );
};

export default Sections;
