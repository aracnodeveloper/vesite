import React, { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useAnalytics } from "../hooks/useFetchMetrics.ts";
import { useUpdateTheme } from "../hooks/useFetchUpdateTheme.ts";

interface SocialLink {
    name: string;
    url: string;
    icon?: string;
}

interface DownloadItem {
    title: string;
    url: string;
    price: string;
}

interface LinkItem {
    title: string;
    url: string;
    image?: string;
}

interface TextBox {
    title: string;
    description: string;
}

interface SocialPostData {
    url: string;
    note?: string;
}

interface PreviewContextType {
    name: string;
    description: string;
    profileImage: string | null;
    coverImage: string | null;
    socialLinks: SocialLink[];
    downloads: DownloadItem[];
    links: LinkItem[];
    textBox: TextBox;
    musicEmbedUrl: string;
    setMusicEmbedUrl: React.Dispatch<React.SetStateAction<string>>;
    musicNote: string;
    setMusicNote: React.Dispatch<React.SetStateAction<string>>;
    videoUrl: string;
    videoTitle: string;
    setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
    setVideoTitle: React.Dispatch<React.SetStateAction<string>>;
    socialPost: SocialPostData;
    setSocialPost: React.Dispatch<React.SetStateAction<SocialPostData>>;
    views: number;
    clicks: number;
    setViews: React.Dispatch<React.SetStateAction<number>>;
    setClicks: React.Dispatch<React.SetStateAction<number>>;
    selectedTemplate: number;
    setSelectedTemplate: React.Dispatch<React.SetStateAction<number>>;
    themeColor: string;
    setThemeColor: React.Dispatch<React.SetStateAction<string>>;
    fontFamily: string;
    setFontFamily: React.Dispatch<React.SetStateAction<string>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
    setCoverImage: React.Dispatch<React.SetStateAction<string | null>>;
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
    setDownloads: React.Dispatch<React.SetStateAction<DownloadItem[]>>;
    setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
    setTextBox: React.Dispatch<React.SetStateAction<TextBox>>;
}

const PreviewContext = createContext<PreviewContextType>({} as PreviewContextType);

export const usePreview = () => useContext(PreviewContext);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const [name, setName] = useState("Your Name");
    const [description, setDescription] = useState("Add a short description");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [textBox, setTextBox] = useState<TextBox>({ title: "", description: "" });
    const [musicEmbedUrl, setMusicEmbedUrl] = useState("");
    const [musicNote, setMusicNote] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoTitle, setVideoTitle] = useState("");
    const [socialPost, setSocialPost] = useState<SocialPostData>({ url: "", note: "" });
    const [views, setViews] = useState(0);
    const [clicks, setClicks] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState(0);
    const [themeColor, setThemeColor] = useState("#ffffff");
    const [fontFamily, setFontFamily] = useState("Lato");

    const { data: analyticsData } = useAnalytics();
    const { updateTheme } = useUpdateTheme();
    const biositeId = Cookies.get("biositeId");

    // Actualiza views y clicks desde el backend
    useEffect(() => {
        if (analyticsData) {
            setViews(analyticsData.views);
            setClicks(analyticsData.clicks);
        }
    }, [analyticsData]);

    // Sincroniza estilo visual con backend
    useEffect(() => {
        if (themeColor && fontFamily && biositeId) {
            updateTheme({
                backgroundColor: themeColor,
                fontFamily,
                templateId: selectedTemplate,
            });
        }
    }, [themeColor, fontFamily, selectedTemplate]);

    return (
        <PreviewContext.Provider
            value={{
                name,
                setName,
                description,
                setDescription,
                profileImage,
                setProfileImage,
                coverImage,
                setCoverImage,
                socialLinks,
                setSocialLinks,
                downloads,
                setDownloads,
                links,
                setLinks,
                textBox,
                setTextBox,
                musicEmbedUrl,
                setMusicEmbedUrl,
                musicNote,
                setMusicNote,
                videoUrl,
                setVideoUrl,
                videoTitle,
                setVideoTitle,
                socialPost,
                setSocialPost,
                views,
                setViews,
                clicks,
                setClicks,
                selectedTemplate,
                setSelectedTemplate,
                themeColor,
                setThemeColor,
                fontFamily,
                setFontFamily,
            }}
        >
            {children}
        </PreviewContext.Provider>
    );
};
