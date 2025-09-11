import { QRCode } from "antd";
import type { BiositeLink } from "../../interfaces/Biosite";
import Cardbase from "./CardBase";
import { ArrowBigRight, ArrowRight, QrCodeIcon } from "lucide-react";
import MusicEmbed from "./MusicEmbed";
import SocialEmbed from "./SocialEmbed";

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
  const renderSection = () => {
    switch (section) {
      case Section_type.Profile:
        return <div>Profile Section</div>;
      case Section_type.VCard:
        return (
          <Cardbase
            icon={QrCodeIcon}
            key={0}
            themeConfig={themeConfig}
            title={"VCard"}
            image={vcard.avatar}
            onClick={vcard.onClick}
          />
        );
      case Section_type.Links:
        return links.map((link) => (
          <Cardbase
            icon={ArrowRight}
            url={link.url}
            image={link.image}
            key={link.orderIndex}
            themeConfig={themeConfig}
            title={link.label}
          />
        ));
      case Section_type.Contactame:
        return links.map((link) => (
          <Cardbase
            icon={ArrowRight}
            image={link.icon}
            key={link.orderIndex}
            themeConfig={themeConfig}
            title={link.label}
          />
        ));
      case Section_type.Music_Podcast:
        return <MusicEmbed link={links[0]} />;
      case Section_type.Link_de_mi_App:
        return <div>Link_de_mi_App Section</div>;
      case Section_type.Social_Post:
        return <SocialEmbed link={links[0]} themeConfig={themeConfig} />;
      case Section_type.Social:
        return <div>Social Section</div>;
      case Section_type.Video:
        return <div>Video Section</div>;
      default:
        return null;
    }
  };

  return renderSection();
}
