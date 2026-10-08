import type { AppLink } from "../../biosite/types/PreviewContext";
import type { CreateLinkDto, Link, UpdateLinkDto } from "../types/Links";
import { APP_STORES } from "../utils/linkMappers";

interface LinkCrud {
  biositeId?: string;
  links: Link[];
  createLink: (data: CreateLinkDto) => Promise<Link | null>;
  updateLink: (id: string, data: UpdateLinkDto) => Promise<Link | null>;
  deleteLink: (id: string) => Promise<boolean>;
}

/** Alta, baja y edición de los botones de App Store / Google Play. */
export const useAppLinkOperations = ({ biositeId, links, createLink, updateLink, deleteLink }: LinkCrud) => {
  const addAppLink = async (link: Omit<AppLink, "id">) => {
    if (!biositeId) {
      throw new Error("Biosite ID is required");
    }

    try {
      await createLink({
        biositeId,
        ...APP_STORES[link.store],
        url: link.url,
        orderIndex: links.length,
        isActive: link.isActive,
        link_type: "app",
      });
    } catch (error) {
      console.error("Error creating app link:", error);
      throw error;
    }
  };

  const removeAppLink = async (id: string) => {
    try {
      await deleteLink(id);
    } catch (error) {
      console.error("Error deleting app link:", error);
      throw error;
    }
  };

  const updateAppLink = async (id: string, data: Partial<AppLink>) => {
    try {
      const updateData: UpdateLinkDto = { link_type: "app" };
      if (data.url !== undefined) updateData.url = data.url;
      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      if (data.store !== undefined) Object.assign(updateData, APP_STORES[data.store]);

      await updateLink(id, updateData);
    } catch (error) {
      console.error("Error updating app link:", error);
      throw error;
    }
  };

  return { addAppLink, removeAppLink, updateAppLink };
};
