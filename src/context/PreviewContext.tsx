import React, { createContext, useContext, useState } from "react";

type SocialLink = {
    name: string;
    url: string;
    icon?: string;
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

interface PreviewContextType {
    name: string;
    description: string;
    profileImage: string | null;
    coverImage: string | null;
    socialLinks: SocialLink[];
    downloads: DownloadItem[];
    links: LinkItem[];
    selectedTemplate: number;


    setSelectedTemplate: React.Dispatch<React.SetStateAction<number>>;
    setName: React.Dispatch<React.SetStateAction<string>>;
    setDescription: React.Dispatch<React.SetStateAction<string>>;
    setProfileImage: React.Dispatch<React.SetStateAction<string | null>>;
    setCoverImage: React.Dispatch<React.SetStateAction<string | null>>;
    setSocialLinks: React.Dispatch<React.SetStateAction<SocialLink[]>>;
    setDownloads: React.Dispatch<React.SetStateAction<DownloadItem[]>>;
    setLinks: React.Dispatch<React.SetStateAction<LinkItem[]>>;
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
    const [selectedTemplate, setSelectedTemplate] = useState(0);

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

                setSelectedTemplate,
                setName,
                setDescription,
                setProfileImage,
                setCoverImage,
                setSocialLinks,
                setDownloads,
                setLinks,
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
