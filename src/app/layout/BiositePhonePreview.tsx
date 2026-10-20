import { RefreshCw } from "lucide-react";
import PhonePreview from "../../features/biosite/preview/phonePreview.tsx";
import NewBiositePage from "../../features/biosite-public/NewBiositePage.tsx";
import LivePreviewContent from "../../features/biosite/preview/LivePreviewContent.tsx";
import type { BiositeFull } from "../../features/biosite/types/Biosite.ts";
import { useBiositeChangeVersion } from "../../features/biosite/hooks/useBiositeChangeVersion.ts";

/**
 * El biosite dentro del marco de teléfono: la página pública si ya tiene slug,
 * si no el preview del editor. Se recarga (sin parpadeo) cada vez que el editor
 * guarda un cambio.
 */
export const BiositePhonePreview = ({ biosite }: { biosite: BiositeFull | null }) => {
  const changeVersion = useBiositeChangeVersion();

  if (!biosite) return null;

  return (
    <PhonePreview key={biosite.id}>
      {biosite.slug ? (
        <NewBiositePage slug={biosite.slug} refreshKey={changeVersion} />
      ) : (
        <LivePreviewContent refreshKey={changeVersion} />
      )}
    </PhonePreview>
  );
};

/** Icono y texto del botón "Update" del VeSite. */
export const UpdateButtonContent = ({ isUpdating }: { isUpdating: boolean }) => (
  <>
    <RefreshCw className={`w-3 h-3 ${isUpdating ? "animate-spin" : ""}`} />
    <span>{isUpdating ? "Updating..." : "Update"}</span>
  </>
);
