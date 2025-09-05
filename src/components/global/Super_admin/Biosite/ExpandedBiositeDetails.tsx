import { Database, LinkIcon } from "lucide-react";
import Input from "../../../shared/Input";
import { getLinkType, LinkImageDisplay } from "../SharedLinksComponents";
import FomrField from "../../../shared/FomrField";
import ImageInput from "../../../shared/ImageInput";
import { useState } from "react";
import Button from "../../../shared/Button";
import type { BiositeFull } from "../../../../interfaces/AdminData";
import Loading from "../../../shared/Loading";
import { useUser, type UpdateUserDto } from "../../../../hooks/useUser";

export default function ExpandedBiositeDetails({
  biosite,
  userBusinessCard,
  isLoadingCard,
  biositeLinks,
  loadingBiositeLinks,
  formatDate,
  parseVCardData,
}: {
  biosite: BiositeFull;
  userBusinessCard;
  isLoadingCard;
  biositeLinks;
  loadingBiositeLinks;
  formatDate;
  parseVCardData;
}) {
  const [update_profile, setUpdate_profile] = useState(false);
  const [editableBiosite, setEditableBiosite] = useState(biosite);
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser, error } = useUser();
  const [avatarFile, setAvatarFile] = useState();
  const [backgroundFile, setBackgroundFile] = useState();

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
    setEditableBiosite((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
    setUpdate_profile(true);
  };

  const onCancel = () => {
    setEditableBiosite(biosite);
    setUpdate_profile(false);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <tr>
      <td
        colSpan={8}
        className="px-6 py-4 bg-gray-50 border-2 border-t-green-600 border-b-green-400"
      >
        {/* Mostrar error si existe */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error al cargar información del biosite
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {error || "Ha ocurrido un error desconocido"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Información del Usuario */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Información del Usuario Hijo
              {error && (
                <span className="ml-2 text-xs text-red-600 font-normal">
                  (Error al cargar datos)
                </span>
              )}
            </h4>
            <div className=" p-2 rounded border">
              <form
                onSubmit={onSave}
                className="grid grid-cols-2 gap-4 rounded-lg"
              >
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
                <div>
                  <p className="text-xs text-gray-600  uppercase">Rol</p>
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
                {biosite.avatarImage && (
                  <FomrField title={"Avatar"}>
                    <ImageInput
                      maxHeight={200}
                      square
                      value={avatarFile}
                      initialSrc={biosite.avatarImage}
                      onChange={handleImageChange("avatarImage")}
                    />
                  </FomrField>
                )}
                {biosite.backgroundImage && (
                  <FomrField title={"Background"}>
                    <ImageInput
                      maxHeight={200}
                      value={backgroundFile}
                      initialSrc={biosite.backgroundImage}
                      onChange={handleImageChange("backgroundImage")}
                    />
                  </FomrField>
                )}
                {update_profile && (
                  <div className="grid grid-cols-2 gap-x-5 max-w-[200px]">
                    <Button submit disabled={isLoading}>
                      {isLoading ? <Loading /> : "Guardar"}
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
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Database className="w-4 h-4 mr-2" />
              Tarjeta Digital del Usuario Hijo
            </h4>

            {isLoadingCard ? (
              <div className="bg-white p-4 rounded border flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">
                  Cargando V-Card...
                </span>
              </div>
            ) : userBusinessCard ? (
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                {/* QR Code Section */}
                {userBusinessCard.qrCodeUrl && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 text-center border-b">
                    <div className="flex items-center justify-center space-x-4">
                      <img
                        src={userBusinessCard.qrCodeUrl}
                        alt="QR Code"
                        className="w-20 h-20 bg-white p-2 rounded-lg shadow-sm"
                      />
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-700">
                          QR Code Disponible
                        </p>
                        <p className="text-xs text-gray-500">
                          Escanea para ver la V-Card
                        </p>
                        {userBusinessCard.slug && (
                          <p className="text-xs text-blue-600 mt-1">
                            /{userBusinessCard.slug}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* V-Card Data */}
                <div className="p-4">
                  {(() => {
                    const vCardData = parseVCardData(userBusinessCard);

                    if (!vCardData) {
                      return (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">
                            V-Card sin datos configurados
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {vCardData.name && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Nombre:
                            </span>
                            <span className="text-sm text-gray-800 font-medium">
                              {vCardData.name}
                            </span>
                          </div>
                        )}
                        {vCardData.title && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Título:
                            </span>
                            <span className="text-sm text-gray-800">
                              {vCardData.title}
                            </span>
                          </div>
                        )}
                        {vCardData.company && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Empresa:
                            </span>
                            <span className="text-sm text-gray-800">
                              {vCardData.company}
                            </span>
                          </div>
                        )}
                        {vCardData.email && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Email:
                            </span>
                            <a
                              href={`mailto:${vCardData.email}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {vCardData.email}
                            </a>
                          </div>
                        )}
                        {vCardData.phone && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Teléfono:
                            </span>
                            <a
                              href={`tel:${vCardData.phone}`}
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {vCardData.phone}
                            </a>
                          </div>
                        )}
                        {vCardData.website && (
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500 w-16">
                              Web:
                            </span>
                            <a
                              href={vCardData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {vCardData.website}
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          userBusinessCard.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {userBusinessCard.isActive
                          ? "V-Card Activa"
                          : "V-Card Inactiva"}
                      </span>
                      <span>
                        ID: {userBusinessCard.id?.substring(0, 8)}
                        ...
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded border text-center">
                <div className="text-gray-400 mb-2">
                  <Database className="w-8 h-8 mx-auto mb-2" />
                </div>
                <p className="text-sm text-gray-600">
                  Este usuario hijo no tiene V-Card configurada
                </p>
              </div>
            )}
          </div>

          {/* Enlaces detallados */}
          {(() => {
            const currentBiositeLinks = biositeLinks[biosite.id] || [];
            const isLoadingLinks = loadingBiositeLinks[biosite.id];

            return (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                  <LinkIcon className="w-4 h-4 text-purple-500 mr-2" />
                  Enlaces del Biosite Hijo ({currentBiositeLinks.length})
                  {isLoadingLinks && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-purple-500 ml-2"></div>
                  )}
                </h4>

                {isLoadingLinks ? (
                  <div className="bg-white p-4 rounded border text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Cargando enlaces...</p>
                  </div>
                ) : currentBiositeLinks.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto space-y-3">
                    {currentBiositeLinks
                      .filter((link) => link.isActive)
                      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0))
                      .map((link, index) => {
                        const linkType = getLinkType(link);
                        return (
                          <div
                            key={link.id || index}
                            className="bg-white p-4 rounded border hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <LinkImageDisplay link={link} />

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <p className="text-sm font-medium text-gray-900 break-words">
                                      {link.label || "Sin título"}
                                    </p>
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${linkType.color}`}
                                    >
                                      {linkType.icon}
                                      <span className="ml-1">
                                        {linkType.type}
                                      </span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-blue-600 hover:text-blue-800 break-all mt-1">
                                    <a
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      {link.url.length > 50
                                        ? `${link.url.substring(0, 50)}...`
                                        : link.url}
                                    </a>
                                  </p>
                                  {link.description && (
                                    <p className="text-xs text-gray-400 mt-1 break-words">
                                      {link.description}
                                    </p>
                                  )}
                                  {link.color && (
                                    <div className="flex items-center mt-2">
                                      <div
                                        className="w-4 h-4 rounded border mr-2"
                                        style={{
                                          backgroundColor: link.color,
                                        }}
                                      ></div>
                                      <span className="text-xs text-gray-500">
                                        {link.color}
                                      </span>
                                    </div>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                    <span>
                                      Orden: #{link.orderIndex || index + 1}
                                    </span>
                                    <span>
                                      ID: {link.id.substring(0, 8)}
                                      ...
                                    </span>
                                    {link.createdAt && (
                                      <span>
                                        Creado: {formatDate(link.createdAt)}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1 ml-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                                    link.isActive
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {link.isActive ? "Activo" : "Inactivo"}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
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
