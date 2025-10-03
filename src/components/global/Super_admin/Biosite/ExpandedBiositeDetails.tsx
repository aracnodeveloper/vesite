import { Database, LinkIcon } from "lucide-react";
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

export default function ExpandedBiositeDetails({
                                                 biosite,
                                                 userBusinessCard,
                                                 isLoadingCard,
                                                 biositeLinks,
                                                 loadingBiositeLinks,
                                                 formatDate,
                                                 parseVCardData,
                                                 ischild = false,
                                               }: {
  biosite: BiositeFull;
  userBusinessCard;
  isLoadingCard;
  biositeLinks: { [key: string]: LinkData[] };
  loadingBiositeLinks;
  formatDate;
  parseVCardData;
  ischild?: boolean;
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
            className="px-2 sm:px-6 py-3 sm:py-4 bg-gray-50 border-2 border-t-green-600 border-b-green-400"
        >
          {/* Error Message */}
          {(error || formError) && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
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
                  <div className="ml-2 sm:ml-3 flex-1">
                    <h3 className="text-xs sm:text-sm font-medium text-red-800">
                      Error al cargar información del biosite
                    </h3>
                    <div className="mt-1 text-xs sm:text-sm text-red-700 break-words">
                      {error || formError || "Ha ocurrido un error desconocido"}
                    </div>
                  </div>
                </div>
              </div>
          )}

          <div className="space-y-3 sm:space-y-6 w-full">
            {/* User Information */}
            <div>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Información del Usuario{ischild !== false ? " Hijo" : ""}
                {error && (
                    <span className="ml-2 text-xs text-red-600 font-normal">
                  (Error al cargar datos)
                </span>
                )}
              </h4>
              <div className="p-2 sm:p-3 rounded border bg-white">
                <form onSubmit={onSave} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-lg">
                    <FomrField title="Nombre">
                      <Input
                          name="owner.name"
                          value={editableBiosite.owner?.name ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <FomrField title="Email">
                      <Input
                          name="owner.email"
                          value={editableBiosite.owner?.email ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <FomrField title="Cédula">
                      <Input
                          name="owner.cedula"
                          value={editableBiosite.owner?.cedula ?? ""}
                          onChange={handleChange}
                      />
                    </FomrField>
                    <div>
                      <p className="text-xs mb-1 text-gray-600 uppercase">Rol</p>
                      <span
                          className={`inline-flex px-2 py-1 text-xs rounded-full ${
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <FomrField title="Avatar">
                      <ImageInput
                          maxHeight={150}
                          square
                          value={avatarFile}
                          initialSrc={biosite.avatarImage}
                          onChange={handleImageChange("avatarImage")}
                      />
                    </FomrField>
                    <FomrField title="Background">
                      <ImageInput
                          maxHeight={150}
                          value={backgroundFile}
                          initialSrc={biosite.backgroundImage}
                          onChange={handleImageChange("backgroundImage")}
                      />
                    </FomrField>
                  </div>

                  {update_profile && (
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <Button submit disabled={isLoading}>
                          {isLoading ? "Cargando..." : "Guardar"}
                        </Button>
                        <Button
                            onClick={onCancel}
                            variant="secondary"
                            disabled={isLoading}
                        >
                          Cancelar
                        </Button>
                      </div>
                  )}
                </form>
              </div>
            </div>

            {/* V-Card Information */}
            <div className='w-full'>
              <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 flex items-center flex-wrap">
                <Database className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                <span>Tarjeta Digital del Usuario{ischild !== false ? " Hijo" : ""}</span>
              </h4>

              {isLoadingCard ? (
                  <div className="flex justify-center py-4">
                    <Loading />
                  </div>
              ) : userBusinessCard ? (
                  <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    {/* QR Code Section */}
                    {userBusinessCard.qrCodeUrl && (
                        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 sm:p-4 text-center border-b">
                          <div className="flex flex-col items-center space-y-3">
                            <img
                                src={userBusinessCard.qrCodeUrl}
                                alt="QR Code"
                                className="w-16 h-16 sm:w-20 sm:h-20 bg-white p-2 rounded-lg shadow-sm"
                            />
                            <div className="text-center">
                              <p className="text-xs sm:text-sm font-medium text-gray-700">
                                QR Code Disponible
                              </p>
                              <p className="text-xs text-gray-500">
                                Escanea para ver la V-Card
                              </p>
                              {userBusinessCard.slug && (
                                  <p className="text-xs text-blue-600 mt-1 break-all px-2">
                                    /{userBusinessCard.slug}
                                  </p>
                              )}
                            </div>
                          </div>
                        </div>
                    )}

                    {/* V-Card Data */}
                    <div className="p-3 sm:p-4">
                      {(() => {
                        const vCardData = parseVCardData(userBusinessCard);

                        if (!vCardData) {
                          return (
                              <div className="text-center py-4">
                                <p className="text-xs sm:text-sm text-gray-500">
                                  V-Card sin datos configurados
                                </p>
                              </div>
                          );
                        }

                        return (
                            <div className="space-y-2 sm:space-y-3">
                              {[
                                { label: "Nombre", value: vCardData.name },
                                { label: "Título", value: vCardData.title },
                                { label: "Empresa", value: vCardData.company },
                                { label: "Email", value: vCardData.email, isEmail: true },
                                { label: "Teléfono", value: vCardData.phone, isPhone: true },
                                { label: "Web", value: vCardData.website, isUrl: true },
                              ]
                                  .filter((item) => item.value)
                                  .map((item, index) => (
                                      <div
                                          key={index}
                                          className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 pb-2 last:border-b-0 last:pb-0"
                                      >
                              <span className="text-xs text-gray-500 sm:w-24 mb-1 sm:mb-0 font-medium">
                                {item.label}:
                              </span>
                                        <div className="flex-1 min-w-0">
                                          {item.isEmail ? (
                                              <a
                                                  href={`mailto:${item.value}`}
                                                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                              >
                                                {item.value}
                                              </a>
                                          ) : item.isPhone ? (
                                              <a
                                                  href={`tel:${item.value}`}
                                                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                              >
                                                {item.value}
                                              </a>
                                          ) : item.isUrl ? (
                                              <a
                                                  href={item.value}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:underline break-all"
                                              >
                                                {item.value}
                                              </a>
                                          ) : (
                                              <span className="text-xs sm:text-sm text-gray-800 break-words">
                                    {item.value}
                                  </span>
                                          )}
                                        </div>
                                      </div>
                                  ))}
                            </div>
                        );
                      })()}

                      <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 space-y-2 sm:space-y-0">
                      <span
                          className={`px-2 py-1 rounded-full text-xs w-fit ${
                              userBusinessCard.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                          }`}
                      >
                        {userBusinessCard.isActive
                            ? "V-Card Activa"
                            : "V-Card Inactiva"}
                      </span>
                          <span className="break-all text-xs">
                        ID: {userBusinessCard.id?.substring(0, 8)}...
                      </span>
                        </div>
                      </div>
                    </div>
                  </div>
              ) : (
                  <div className="bg-white p-3 sm:p-4 rounded border text-center">
                    <div className="text-gray-400 mb-2">
                      <Database className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2" />
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600">
                      Este usuario hijo no tiene V-Card configurada
                    </p>
                  </div>
              )}
            </div>

            {/* Links Section */}
            {(() => {
              const currentBiositeLinks = biositeLinks[biosite.id] || [];
              const isLoadingLinks = loadingBiositeLinks[biosite.id];

              return (
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3 flex items-center flex-wrap">
                      <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 mr-2 flex-shrink-0" />
                      <span>Enlaces del veSite{ischild !== false ? " Hijo" : ""}</span>
                      {isLoadingLinks && (
                          <div className="ml-2">
                            <Loading />
                          </div>
                      )}
                    </h4>

                    {isLoadingLinks ? (
                        <div className="flex justify-center py-4">
                          <Loading />
                        </div>
                    ) : currentBiositeLinks.length > 0 ? (
                        <div className="max-h-[300px] sm:max-h-[600px] overflow-y-auto space-y-2 sm:space-y-3">
                          {currentBiositeLinks
                              .filter((link) => link.isActive)
                              .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                              .map((link, index) => (
                                  <div
                                      key={index}
                                      className="border border-gray-200 rounded-lg overflow-hidden"
                                  >
                                    <EditableLink
                                        key={index}
                                        link={link}
                                        linkType={getLinkType(link)}
                                        formatDate={formatDate}
                                    />
                                  </div>
                              ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 sm:py-8">
                          <LinkIcon className="w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-xs sm:text-sm text-gray-500">
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