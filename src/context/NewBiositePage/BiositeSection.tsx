import type { BiositeLink } from "../../interfaces/Biosite";
import Cardbase from "./CardBase";
import { ChevronRight } from "lucide-react";
import MusicEmbed from "./MusicEmbed";
import SocialEmbed from "./SocialEmbed";
import SocialLinks from "./SocialLink.tsx";
import SVG from "../../assets/icons/WHATS.svg";
import QR from "../../assets/icons/QR.svg";
import visitaecuador_com from "../../assets/icons/visitaecuador_com.svg";
import AppleStore from "../../assets/icons/AppleStore.svg";
import GooglePlay from "../../assets/icons/GooglePLay.svg";
import VideoEmbed from "./VideoEmbed.tsx";
import { useAnalytics } from "../../hooks/useAnalytics.ts";
import VCardModal from "./VCardModal.tsx";
import { useCallback, useEffect, useState } from "react";
import type { VCardData } from "../../types/V-Card.ts";
import { useBusinessCard } from "../../hooks/useVCard.ts";
import VCardButton from "../../components/global/VCard/VCard.tsx";

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
}

export interface VCard {
  avatar: string;
  onClick: () => void;
}

export default function BiositeSection({
  section,
  links,
  themeConfig,
  vcard,
}: {
  section: Section_type;
  links: BiositeLink[];
  themeConfig?: any;
  vcard?: VCard;
}) {
  const { businessCard } = useBusinessCard();

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

  if (links[0] && links[0].biositeId) {
    analytics = useAnalytics({
      biositeId: links[0].biositeId,
      isPublicView: true,
      debug: false,
    });
  }

  const onTrack = (id: string) => {
    analytics.trackLinkClick(id);
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
            image={vcard.avatar}
            onClick={vcard.onClick}
          />
        );
      case Section_type.Links:
        return links.map((link) => (
          <Cardbase
            icon={ChevronRight}
            onTrack={onTrack}
            url={link.url}
            image={link.image}
            id={link.id}
            themeConfig={themeConfig}
            title={link.label}
          />
        ));
      case Section_type.Contactame:
        return links.map((link) => (
          <Cardbase
            icon={ChevronRight}
            image={SVG}
            onTrack={onTrack}
            id={link.id}
            themeConfig={themeConfig}
            title={link.label}
          />
        ));
      case Section_type.Music_Podcast:
        return <MusicEmbed link={links[0]} />;
      case Section_type.Link_de_mi_App:
        return links.map((link) => (
          <Cardbase
            icon={isVisitaEcuadorApp(link.url) ? visitaecuador_com : ""}
            image={
              link.url?.includes("apps.apple.com") ? AppleStore : GooglePlay
            }
            onTrack={onTrack}
            id={link.id}
            themeConfig={themeConfig}
            title={link.label}
          />
        ));
      case Section_type.Social_Post:
        return <SocialEmbed link={links[0]} themeConfig={themeConfig} />;
      case Section_type.Social:
        return (
          <SocialLinks
            onTrack={onTrack}
            links={links}
            themeConfig={themeConfig}
          />
        );
      case Section_type.Video:
        return <VideoEmbed link={links[0]} />;
      default:
        return null;
    }
  };

  return renderSection();
}
