import { Database, Edit, LinkIcon } from "lucide-react";
import Input from "../../../shared/Input";
import { getLinkType } from "../SharedLinksComponents";
import FomrField from "../../../shared/FomrField";
import ImageInput from "../../../shared/ImageInput";
import { useState } from "react";
import Button from "../../../shared/Button";
import type { BiositeFull, LinkData } from "../../../../interfaces/AdminData";
import Loading from "../../../shared/Loading";
import { useUser, type UpdateUserDto } from "../../../../hooks/useUser";
import {
  uploadBiositeAvatar,
  uploadBiositeBackground,
} from "../../../layers/MySite/Profile/lib/uploadImage";
import EditableLink from "./EditableLink";
import EditableVCardSection from "./EditableVCardSection";
import type { UpdateBusinessCardDto } from "../../../../types/V-Card";

export default function ExpandedBiositeDetails({
                                                 biosite,
                                                 userBusinessCard,
                                                 isLoadingCard,
                                                 biositeLinks,
                                                 loadingBiositeLinks,
                                                 formatDate,
                                                 parseVCardData,
                                                 ischild = false,
                                                 onUpdateVCard,
                                               }: {
  biosite: BiositeFull;
  userBusinessCard;
  isLoadingCard;
  biositeLinks: { [key: string]: LinkData[] };
  loadingBiositeLinks;
  formatDate;
  parseVCardData;
  ischild?: boolean;
  onUpdateVCard: (id: string, data: UpdateBusinessCardDto) => Promise<void>;
}) {
  const [update_profile, setUpdate_profile] = useState(false);
  const [update_avatar, setUpdate_avatar] = useState(false);
  const [update_background, setUpdate_background] = useState(false);
  const [editableBiosite, setEditableBiosite] = useState(biosite);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser, error } = useUser();
  const [avatarFile, setAvatarFile] = useState<File>();
  const [backgroundFile, setBackgroundFile] = useState<File>();
  const [formError, setFormError] = useState("");

  const handleChange = (
      e: React.ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parentKey, childKey] = name.split(".");
      setEditableBiosite((prev) => ({
        ...prev,
        [parentKey]: {
          ...prev[parentKey],
          [childKey]: value,
        },
      }));
    } else {
      setEditableBiosite((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    setUpdate_profile(true);
  };

  const handleImageChange = (fieldName: string) => (file: File | null) => {
    if (fieldName == "avatarImage") {
      setAvatarFile(file);
      setUpdate_avatar(true);
    } else if (fieldName == "backgroundImage") {
      setBackgroundFile(file);
      setUpdate_background(true);
    }
    setUpdate_profile(true);
  };

  const onCancel = () => {
    setEditableBiosite(biosite);
    setUpdate_profile(false);
    setFormError("");
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updateUserData: UpdateUserDto = {
        name: editableBiosite.owner?.name,
        email: editableBiosite.owner?.email,
        cedula: editableBiosite.owner?.cedula,
        description: editableBiosite.owner?.description,
        avatarUrl: editableBiosite.owner?.avatarUrl,
        site: editableBiosite.owner?.site,
        phone: editableBiosite.owner?.phone,
        isActive: editableBiosite.owner?.isActive,
      };

      const result = await updateUser(biosite.ownerId, updateUserData);
      if (update_background) {
        await uploadBiositeBackground(backgroundFile, biosite.id);
      }
      if (update_avatar) {
        await uploadBiositeAvatar(avatarFile, biosite.id);
      }

      if (result) {
        setUpdate_profile(false);
      }
    } catch (error) {
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      } else if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as any).message;
      }
      setFormError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <tr>
        <td
            colSpan={8}
            className="px-3 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50 border-2 border-t-green-600 border-b-green-400"
        >
          {/* Mostrar error si existe */}
          {(error || formError) && (
              <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                        className="h-4 w-4 sm:h-5 sm:w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                      <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <h3 className="text-sm sm:text-base font-medium text-red-800">
                      Error al cargar información del biosite
                    </h3>
                    <div className="mt-1 text-xs sm:text-sm text-red-700">
                      {error || formError || "Ha ocurrido un error desconocido"}
                    </div>
                  </div>
                </div>
              </div>
          )}

          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Información del Usuario */}
            <div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3">
                Información del Usuario {biosite.title}
                {error && (
                    <span className="ml-2 text-xs sm:text-sm text-red-600 font-normal">
                  (Error al cargar datos)
                </span>
                )}
              </h4>
              <div className="p-3 sm:p-4 lg:p-6 rounded-lg border bg-white shadow-sm">
                <span className="flex items-center text-black font-bold mb-3 gap-2">     <Edit  className="w-4 h-4" /> EDITOR</span>
                <form onSubmit={onSave} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    <FomrField title={"Nombre"}>
                      <Input
                          name="owner.name"
                          value={editableBiosite.owner?.name ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <FomrField title={"Email"}>
                      <Input
                          name="owner.email"
                          value={editableBiosite.owner?.email ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <FomrField title={"Cédula"}>
                      <Input
                          name="owner.cedula"
                          value={editableBiosite.owner?.cedula ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <FomrField title={"Telefono"}>
                      <Input
                          name="owner.phone"
                          value={editableBiosite.owner?.phone ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wide">
                        Rol
                      </p>
                      <span
                          className={`inline-flex px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm rounded-full font-medium ${
                              biosite.owner?.role === "ADMIN"
                                  ? "bg-blue-100 text-blue-800"
                                  : biosite.owner?.role === "SUPER_ADMIN"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-green-100 text-green-800"
                          }`}
                      >
                      {biosite.owner?.role || "USER"}
                    </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <FomrField title={"Avatar"}>
                      <ImageInput
                          maxHeight={200}
                          square
                          value={avatarFile}
                          initialSrc={biosite.avatarImage}
                          onChange={handleImageChange("avatarImage")}
                      />
                    </FomrField>
                    <FomrField title={"Background"}>
                      <ImageInput
                          maxHeight={200}
                          value={backgroundFile}
                          initialSrc={biosite.backgroundImage}
                          onChange={handleImageChange("backgroundImage")}
                      />
                    </FomrField>
                  </div>

                  {update_profile && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                        <div className="w-full sm:w-auto">
                          <Button submit disabled={isLoading}>
                            {isLoading ? "Cargando..." : "Guardar"}
                          </Button>
                        </div>
                        <div className="w-full sm:w-auto">
                          <Button
                              onClick={onCancel}
                              variant="secondary"
                              disabled={isLoading}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                  )}
                </form>
              </div>
            </div>

            {/* V-Card Information con edición */}
            <div>
              <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center">
                <Database className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Tarjeta Digital del Usuario{ischild !== false ? " Hijo" : ""}
              </h4>

              <EditableVCardSection
                  userBusinessCard={userBusinessCard}
                  isLoadingCard={isLoadingCard}
                  ownerId={biosite.ownerId}
                  parseVCardData={parseVCardData}
                  onUpdateVCard={onUpdateVCard}
              />
            </div>

            {/* Enlaces detallados */}
            {(() => {
              const currentBiositeLinks = biositeLinks[biosite.id] || [];
              const isLoadingLinks = loadingBiositeLinks[biosite.id];

              return (
                  <div>
                    <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center">
                      <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 mr-2 flex-shrink-0" />
                      Enlaces del veSite{ischild !== false ? " Hijo" : ""}
                      {isLoadingLinks && (
                          <div className="ml-2">
                            <Loading />
                          </div>
                      )}
                    </h4>

                    {isLoadingLinks ? (
                        <div className="flex justify-center py-6 sm:py-8">
                          <Loading />
                        </div>
                    ) : currentBiositeLinks.length > 0 ? (
                        <div className="max-h-[300px] sm:max-h-[500px] lg:max-h-[600px] overflow-y-auto space-y-2 sm:space-y-3">
                          {currentBiositeLinks
                              .filter((link) => link.isActive)
                              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                              .map((link, index) => {
                                return (
                                    <div
                                        key={index}
                                        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                    >
                                      <EditableLink
                                          key={index}
                                          link={link}
                                          linkType={getLinkType(link)}
                                          formatDate={formatDate}
                                      />
                                    </div>
                                );
                              })}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-12">
                          <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                          <p className="text-sm sm:text-base text-gray-500">
                            Este biosite hijo no tiene enlaces configurados
                          </p>
                        </div>
                    )}
                  </div>
              );
            })()}
          </div>
        </td>
      </tr>
  );
}