import  { createContext, useContext, useEffect, useState, ReactNode } from "react";


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
}

interface TextBoxData {
    title: string;
    description: string;
}

interface SocialPostData {
    url: string;
    note?: string;
}

interface PreviewContextType {
    name: string;
    setName: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    profileImage: string | null;
    setProfileImage: (val: string | null) => void;
    coverImage: string | null;
    setCoverImage: (val: string | null) => void;
    socialLinks: SocialLink[];
    setSocialLinks: (val: SocialLink[]) => void;
    downloads: DownloadItem[];
    setDownloads: (val: DownloadItem[]) => void;
    links: LinkItem[];
    setLinks: (val: LinkItem[]) => void;
    textBox: TextBoxData;
    setTextBox: (val: TextBoxData) => void;
    musicEmbedUrl: string;
    setMusicEmbedUrl: (val: string) => void;
    videoUrl: string;
    setVideoUrl: (val: string) => void;
    videoTitle: string;
    setVideoTitle: (val: string) => void;
    socialPost: SocialPostData;
    setSocialPost: (val: SocialPostData) => void;
    fontFamily: string;
    setFontFamily: (val: string) => void;
    themeColor: string;
    setThemeColor: (val: string) => void;
    selectedTemplate: number;
    setSelectedTemplate: (val: number) => void;
    updateTrigger: boolean;
    setUpdateTrigger: (val: boolean) => void;
    views: number;
    setViews: (val: number) => void;
    clicks: number;
    setClicks: (val: number) => void;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

export const PreviewProvider = ({ children }: { children: ReactNode }) => {
    const stored = localStorage.getItem("biosite-data");
    const initial = stored ? JSON.parse(stored) : {};

    const [name, setName] = useState(initial.name || "Your Name");
    const [description, setDescription] = useState(initial.description || "");
    const [profileImage, setProfileImage] = useState<string | null>(initial.profileImage || null);
    const [coverImage, setCoverImage] = useState<string | null>(initial.coverImage || null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [textBox, setTextBox] = useState<TextBoxData>({ title: "", description: "" });
    const [musicEmbedUrl, setMusicEmbedUrl] = useState("");
    const [videoUrl, setVideoUrl] = useState("");
    const [videoTitle, setVideoTitle] = useState("");
    const [socialPost, setSocialPost] = useState<SocialPostData>({ url: "" });
    const [fontFamily, setFontFamily] = useState(initial.fontFamily || "inherit");
    const [themeColor, setThemeColor] = useState(initial.themeColor || "#ffffff");
    const [selectedTemplate, setSelectedTemplate] = useState(initial.selectedTemplate || 0);
    const [updateTrigger, setUpdateTrigger] = useState(false);
    const [views, setViews] = useState(0);
    const [clicks, setClicks] = useState(0);

    useEffect(() => {
        localStorage.setItem("biosite-data", JSON.stringify({
            name,
            description,
            profileImage,
            coverImage,
            fontFamily,
            themeColor,
            selectedTemplate,
        }));
    }, [name, description, profileImage, coverImage, fontFamily, themeColor, selectedTemplate]);

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
                videoUrl,
                setVideoUrl,
                videoTitle,
                setVideoTitle,
                socialPost,
                setSocialPost,
                selectedTemplate,
                setSelectedTemplate,
                fontFamily,
                setFontFamily,
                themeColor,
                setThemeColor,
                views,
                setViews,
                clicks,
                setClicks,
            }}
        >
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) throw new Error("usePreview must be used within a PreviewProvider");
    return context;
};
