import type { BiositeLink } from "../biosite/types/Biosite";
import Cardbase from "./CardBase";

import MusicEmbed from "./MusicEmbed";
import SocialEmbed from "./SocialEmbed";
import SocialLinks from "./SocialLink.tsx";
import SVG from "../../assets/icons/WHATS.svg";
import QR from "../../assets/icons/QR.svg";
import linkicon from "../../assets/icons/links.svg";
import visitaecuador_com from "../../assets/icons/visitaecuador_com.svg";
import AppleStore from "../../assets/icons/AppleStore.svg";
import GooglePlay from "../../assets/icons/GooglePLay.svg";
import VideoEmbed from "./VideoEmbed.tsx";
import { useAnalytics } from "../analytics/hooks/useAnalytics.ts";
//import { useBusinessCard } from "../vcard/hooks/useVCard.ts";
import { useNavigate } from "react-router-dom";
import { ImageGallerySection } from "./ImageGallerySection.tsx";
import LinksDesign from "../links/design/LinksDesign.tsx";
import type { LinkLayout } from "../links/design/linkLayouts.ts";

export enum Section_type {
  Profile = "Profile",
  VCard = "VCard",
  Links = "Links",
  Contactame = "Contactame",
  Music_Podcast = "Music / Podcast",
  Link_de_mi_App = "Link de mi App",
  Social_Post = "Social Post",
  Social = "Social",
  Video = "Video",
  Gallery = "Gallery", // Sección de galería de imágenes
}

export interface VCard {
  avatar: string;
  background: string;
  onClick: () => void;
}

export default function BiositeSection({
  section,
  links,
  textBlocks, // Bloques de texto con imágenes para Gallery
  themeConfig,
  vcard,
  isPreview = false,
  isPublicView = false,
  linksLayout = "button",
  contactLayout = "button",
  appLayout = "button",
}: {
  section: Section_type;
  links?: BiositeLink[]; // Opcional: usado por Social, Links, Music, etc.
  textBlocks?: any[]; // Opcional: usado por Gallery
  themeConfig?: any;
  vcard?: VCard;
  isPreview?: boolean;
  isPublicView?: boolean;
  /** Diseño de la sección Links ("button" = el de siempre). */
  linksLayout?: LinkLayout;
  /** Diseños de las secciones Contáctame y Link de mi App. */
  contactLayout?: LinkLayout;
  appLayout?: LinkLayout;
}) {
  const navigate = useNavigate();

  const isVisitaEcuadorApp = (url: string) => {
    return (
      url?.includes(
        "https://apps.apple.com/ec/app/visitaecuador-com/id1385161516"
      ) ||
      url?.includes(
        "https://play.google.com/store/apps/details?id=com.visitaEcuador&hl=es"
      )
    );
  };

  let analytics;

  // Solo inicializar analytics si hay links
  if (links && links[0] && links[0].biositeId) {
    analytics = useAnalytics({
      biositeId: links[0].biositeId,
      isPublicView: isPublicView,
      debug: false,
    });
  }

  const onTrack = (id: string) => {
    if (analytics) {
      analytics.trackLinkClick(id);
    }
  };

  const renderSection = () => {
    switch (section) {
      case Section_type.Profile:
        return <div className="hidden">Profile Section</div>;
      case Section_type.VCard:
        return (
          <Cardbase
            icon={QR}
            onTrack={onTrack}
            id={""}
            themeConfig={themeConfig}
            title={"VCard"}
            image={vcard.avatar || vcard.background}
            showBorder
            useAccentText
            onClick={!isPreview ? vcard.onClick : () => navigate("/VCard")}
          />
        );
      case Section_type.Links:
        if (linksLayout !== "button" && links?.length) {
          return (
            <LinksDesign
              layout={linksLayout}
              links={[...links]
                .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
                .map((link) => ({ id: link.id, label: link.label, url: link.url, image: link.image, onClick: link.onClick }))}
              themeConfig={themeConfig}
              onTrack={onTrack}
            />
          );
        }
        return links
          ?.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map((link) => (
            <Cardbase
              icon={undefined}
              onTrack={onTrack}
              url={link.url}
              image={link.image || linkicon}
              onClick={link.onClick}
              id={link.id}
              themeConfig={themeConfig}
              title={link.label}
              showBorder
              useAccentText
            />
          ));
      case Section_type.Contactame:
        if (contactLayout !== "button" && links?.length) {
          return (
            <LinksDesign
              layout={contactLayout}
              links={links.map((link) => ({
                id: link.id,
                label: link.label,
                url: link.url,
                image: SVG,
                imageFit: "contain" as const,
                onClick: link.onClick,
              }))}
              themeConfig={themeConfig}
              onTrack={onTrack}
            />
          );
        }
        return links?.map((link) => (
          <Cardbase
            icon={undefined}
            url={link.url}
            image={SVG}
            onTrack={onTrack}
            onClick={link.onClick}
            id={link.id}
            themeConfig={themeConfig}
            title={link.label}
            useAccentText
          />
        ));
      case Section_type.Music_Podcast:
        return links && links[0] ? (
          <MusicEmbed
            onClick={links[0].onClick}
            onTrack={onTrack}
            link={links[0]}
          />
        ) : null;
      case Section_type.Link_de_mi_App:
        if (appLayout !== "button" && links?.length) {
          return (
            <LinksDesign
              layout={appLayout}
              links={links.map((link) => ({
                id: link.id,
                label: link.label,
                url: link.url,
                image: link.tag?.includes("apps.apple.com") ? AppleStore : GooglePlay,
                imageFit: "contain" as const,
                onClick: link.onClick,
              }))}
              themeConfig={themeConfig}
              onTrack={onTrack}
            />
          );
        }
        return links?.map((link) => (
          <Cardbase
            icon={isVisitaEcuadorApp(link.url) ? visitaecuador_com : ""}
            image={
              link.tag?.includes("apps.apple.com") ? AppleStore : GooglePlay
            }
            onTrack={onTrack}
            id={link.id}
            themeConfig={themeConfig}
            onClick={link.onClick}
            url={link.url}
            title={link.label}
            useAccentText
          />
        ));
      case Section_type.Social_Post:
        return links && links[0] ? (
          <SocialEmbed
            onLinkClick={links[0].onClick}
            onTrack={onTrack}
            link={links[0]}
            themeConfig={themeConfig}
          />
        ) : null;
      case Section_type.Social:
        return links ? (
          <SocialLinks
            onTrack={onTrack}
            links={links}
            themeConfig={themeConfig}
          />
        ) : null;
      case Section_type.Video:
        return links && links[0] ? (
          <VideoEmbed onClick={links[0].onClick} link={links[0]} />
        ) : null;
      case Section_type.Gallery:
        // Renderiza el carrusel de imágenes con los textBlocks
        return (
          <ImageGallerySection
            key="gallery-section"
            textBlocks={textBlocks || []}
            isExposedRoute={isPublicView}
            themeConfig={themeConfig}
            // Mismo patrón que VCard (línea 98)
            // Si !isPreview (público) → undefined (ImageGallerySection maneja el modal)
            // Si isPreview (dueño) → navega al editor
            handleGalleryClick={!isPreview ? undefined : () => navigate('/gallery')}
          />
        );
      default:
        return null;
    }
  };

  return renderSection();
}
