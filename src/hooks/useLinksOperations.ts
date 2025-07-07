import type { BiositeFull } from "../interfaces/Biosite";
import type { SocialLink, RegularLink } from "../interfaces/PreviewContext";

interface UseLinksOperationsParams {
    biositeData: BiositeFull | null;
    links: any[];
    socialLinks: SocialLink[];
    regularLinks: RegularLink[];
    setSocialLinksState: (links: SocialLink[]) => void;
    setRegularLinksState: (links: RegularLink[]) => void;
    createLink: (data: any) => Promise<any>;
    updateLink: (id: string, data: any) => Promise<any>;
    deleteLink: (id: string) => Promise<boolean>;
    reorderLinks: (biositeId: string, data: { id: string; orderIndex: number }[]) => Promise<void>;
    fetchLinks: () => Promise<void>;
    getIconIdentifier: (iconPath: string) => string;
}

export const useLinksOperations = ({
                                       biositeData,
                                       links,
                                       socialLinks,
                                       regularLinks,
                                       setSocialLinksState,
                                       setRegularLinksState,
                                       createLink,
                                       updateLink,
                                       deleteLink,
                                       reorderLinks,
                                       fetchLinks,
                                       getIconIdentifier
                                   }: UseLinksOperationsParams) => {
    const addSocialLink = async (link: SocialLink) => {
        if (!biositeData?.id) throw new Error("No biosite available");

        const icon = getIconIdentifier(link.icon);
        const maxOrderIndex = Math.max(...links.map(l => l.orderIndex ?? -1), -1);

        await createLink({
            biositeId: biositeData.id,
            label: link.label,
            url: link.url,
            icon,
            orderIndex: maxOrderIndex + 1,
            isActive: true
        });

        await fetchLinks();
    };

    const removeSocialLink = async (linkId: string) => {
        await deleteLink(linkId);
        setSocialLinksState(socialLinks.filter(link => link.id !== linkId));
        await fetchLinks();
    };

    const updateSocialLink = async (linkId: string, updateData: Partial<SocialLink>) => {
        const updatePayload: any = {
            label: updateData.label,
            url: updateData.url,
            isActive: updateData.isActive
        };
        if (updateData.icon) updatePayload.icon = getIconIdentifier(updateData.icon);

        await updateLink(linkId, updatePayload);
        await fetchLinks();
    };

    const addRegularLink = async (link: Omit<RegularLink, 'id'>) => {
        if (!biositeData?.id) throw new Error("No biosite available");

        await createLink({
            biositeId: biositeData.id,
            label: link.title,
            url: link.url,
            icon: "link",
            orderIndex: link.orderIndex,
            isActive: link.isActive
        });

        await fetchLinks();
    };

    const removeRegularLink = async (linkId: string) => {
        await deleteLink(linkId);
        setRegularLinksState(regularLinks.filter(link => link.id !== linkId));
        await fetchLinks();
    };

    const updateRegularLink = async (linkId: string, updateData: Partial<RegularLink>) => {
        const updatePayload: any = {
            label: updateData.title,
            url: updateData.url,
            isActive: updateData.isActive,
            orderIndex: updateData.orderIndex
        };

        await updateLink(linkId, updatePayload);
        await fetchLinks();
    };

    const reorderRegularLinks = async (newLinks: RegularLink[]) => {
        if (!biositeData?.id) throw new Error("No biosite available");

        setRegularLinksState(newLinks);

        const data = newLinks.map((link, i) => ({
            id: link.id,
            orderIndex: i
        }));

        await reorderLinks(biositeData.id, data);
        await fetchLinks();
    };

    return {
        addSocialLink,
        removeSocialLink,
        updateSocialLink,
        addRegularLink,
        removeRegularLink,
        updateRegularLink,
        reorderRegularLinks
    };
};
