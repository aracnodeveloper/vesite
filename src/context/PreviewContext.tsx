import React, { createContext, useContext, useState } from "react";

type SocialLink = {
    name: string;
    url: string;
    icon?: string;
    color?: string;
};

type DownloadItem = {
    title: string;
    url: string;
    price: string;
};

type LinkItem = {
    title: string;
    url: string;
    image?: string;
};

type SocialPostData = {
    url: string;
    note?: string;
};

interface PreviewContextType {
    name: string;
    description: string;
    profileImage: string | null;
    coverImage: string | null;
    socialLinks: SocialLink[];
    downloads: DownloadItem[];
    links: LinkItem[];
    selectedTemplate: number;
    themeColor: string;
    fontFamily: string;

    // Text Box
    textBox: {
        title: string;
        description: string;
    };

    // Music
    musicEmbedUrl: string;
    setMusicEmbedUrl: React.Dispatch<React.SetStateAction<string>>;
    musicNote: string;
    setMusicNote: React.Dispatch<React.SetStateAction<string>>;

    // Video
    videoUrl: string;
    videoTitle: string;
    setVideoUrl: React.Dispatch<React.SetStateAction<string>>;
    setVideoTitle: React.Dispatch<React.SetStateAction<string>>;

    // Social Post
    socialPost: SocialPostData;
    setSocialPost: React.Dispatch<React.SetStateAction<SocialPostData>>;

    // Analytics
    views: number;
    clicks: number;
    setViews: React.Dispatch<React.SetStateAction<number>>;
    setClicks: React.Dispatch<React.SetStateAction<number>>;

    // Setters
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
    setCoverImage: React.Dispatch<React.SetStateAction<string | null>>;
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
    setDownloads: React.Dispatch<React.SetStateAction<DownloadItem[]>>;
    setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
    setSelectedTemplate: React.Dispatch<React.SetStateAction<number>>;
    setThemeColor: React.Dispatch<React.SetStateAction<string>>;
    setFontFamily: React.Dispatch<React.SetStateAction<string>>;
    setTextBox: React.Dispatch<
        React.SetStateAction<{
            title: string;
            description: string;
        }>
    >;
}
const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const [name, setName] = useState("Anthonyr");
    const [description, setDescription] = useState("Bienvenidos a mi sitio");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
    const [downloads, setDownloads] = useState<DownloadItem[]>([]);
    const [links, setLinks] = useState<LinkItem[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<number>(0);
    const [themeColor, setThemeColor] = useState<string>("#ffffff");
    const [fontFamily, setFontFamily] = useState<string>("Lato");
    const [textBox, setTextBox] = useState<{ title: string; description: string }>({title: "", description: "",});
    const [videoUrl, setVideoUrl] = useState('');
    const [videoTitle, setVideoTitle] = useState('');
    const [musicEmbedUrl, setMusicEmbedUrl] = useState('');
    const [musicNote, setMusicNote] = useState('');
    const [socialPost, setSocialPost] = useState<SocialPostData>({ url: "", note: "" });
    const [views, setViews] = useState(14);
    const [clicks, setClicks] = useState(0);



    return (
        <PreviewContext.Provider
            value={{
                name,
                description,
                profileImage,
                coverImage,
                socialLinks,
                downloads,
                links,
                selectedTemplate,
                themeColor,
                fontFamily,
                textBox,
                videoUrl,
                videoTitle,
                musicEmbedUrl,
                musicNote,
                socialPost,
                views,
                clicks,

                setClicks,
                setViews,
                setSocialPost,
                setMusicEmbedUrl,
                setMusicNote,
                setVideoUrl,
                setVideoTitle,
                setTextBox,
                setName,
                setDescription,
                setProfileImage,
                setCoverImage,
                setSocialLinks,
                setDownloads,
                setLinks,
                setSelectedTemplate,
                setThemeColor,
                setFontFamily,
            }}
        >
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = (): PreviewContextType => {
    const context = useContext(PreviewContext);
    if (!context) {
        throw new Error("usePreview must be used within a PreviewProvider");
    }
    return context;
};
