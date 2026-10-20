import type { WhatsAppLink } from "../../biosite/types/PreviewContext";
import type { CreateLinkDto, Link, UpdateLinkDto } from "../types/Links";
import { buildWhatsAppUrl, parseWhatsAppUrl } from "../utils/linkMappers";

interface LinkCrud {
  biositeId?: string;
  links: Link[];
  createLink: (data: CreateLinkDto) => Promise<Link | null>;
  updateLink: (id: string, data: UpdateLinkDto) => Promise<Link | null>;
  deleteLink: (id: string) => Promise<boolean>;
}

/** Alta, baja y edición de los botones de WhatsApp (teléfono + mensaje). */
export const useWhatsAppLinkOperations = ({ biositeId, links, createLink, updateLink, deleteLink }: LinkCrud) => {
  const addWhatsAppLink = async (link: Omit<WhatsAppLink, "id">) => {
    if (!biositeId) {
      throw new Error("Biosite ID is required");
    }

    try {
      await createLink({
        biositeId,
        label: link.description || "WhatsApp",
        url: buildWhatsAppUrl(link.phone, link.message),
        icon: "whatsapp",
        orderIndex: links.length,
        isActive: link.isActive,
        link_type: "whatsapp",
      });
    } catch (error) {
      console.error("Error creating WhatsApp link:", error);
      throw error;
    }
  };

  const removeWhatsAppLink = async (id: string) => {
    try {
      await deleteLink(id);
    } catch (error) {
      console.error("Error deleting WhatsApp link:", error);
      throw error;
    }
  };

  const updateWhatsAppLink = async (id: string, data: Partial<WhatsAppLink>) => {
    try {
      const updateData: UpdateLinkDto = {};

      // Al cambiar teléfono o mensaje se reconstruye la URL con el otro valor actual
      if (data.phone !== undefined || data.message !== undefined) {
        const currentLink = links.find((link) => link.id === id);
        if (currentLink) {
          const current = parseWhatsAppUrl(currentLink.url, currentLink.label);
          updateData.url = buildWhatsAppUrl(data.phone ?? current.phone, data.message ?? current.message);
        }
      }

      if (data.isActive !== undefined) updateData.isActive = data.isActive;
      updateData.label = data.description || "WhatsApp";
      updateData.icon = "whatsapp";
      updateData.link_type = "whatsapp";

      await updateLink(id, updateData);
    } catch (error) {
      console.error("Error updating WhatsApp link:", error);
      throw error;
    }
  };

  return { addWhatsAppLink, removeWhatsAppLink, updateWhatsAppLink };
};
