import { useState } from "react";
import { Database, Save, X, Edit } from "lucide-react";
import type { BusinessCard, UpdateBusinessCardDto, VCardData } from "../../../../types/V-Card";
import Loading from "../../../shared/Loading";
import Button from "../../../shared/Button";
import FomrField from "../../../shared/FomrField";
import Input from "../../../shared/Input";

interface EditableVCardSectionProps {
    userBusinessCard: BusinessCard | null;
    isLoadingCard: boolean;
    ownerId: string;
    parseVCardData: (businessCard: BusinessCard | null) => VCardData | null;
    onUpdateVCard: (id: string, data: UpdateBusinessCardDto) => Promise<void>;
}

export default function EditableVCardSection({
                                                 userBusinessCard,
                                                 isLoadingCard,
                                                 ownerId,
                                                 parseVCardData,
                                                 onUpdateVCard,
                                             }: EditableVCardSectionProps) {
    const [isEditingVCard, setIsEditingVCard] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const vCardData = parseVCardData(userBusinessCard);

    const [editableVCardData, setEditableVCardData] = useState<VCardData>({
        name: vCardData?.name || "",
        title: vCardData?.title || "",
        company: vCardData?.company || "",
        email: vCardData?.email || "",
        phone: vCardData?.phone || "",
        website: vCardData?.website || "",
    });

    const handleVCardChange = (field: keyof VCardData, value: string) => {
        setEditableVCardData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSaveVCard = async () => {
        if (!userBusinessCard?.id) {
            setError("No se encontró la VCard para actualizar");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const updateData: UpdateBusinessCardDto = {
                ownerId: ownerId,
                data: JSON.stringify(editableVCardData),
                isActive: userBusinessCard.isActive ?? true,
            };

            await onUpdateVCard(userBusinessCard.id, updateData);
            setIsEditingVCard(false);
        } catch (err) {
            console.error("Error updating VCard:", err);
            setError("Error al actualizar la VCard");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setEditableVCardData({
            name: vCardData?.name || "",
            title: vCardData?.title || "",
            company: vCardData?.company || "",
            email: vCardData?.email || "",
            phone: vCardData?.phone || "",
            website: vCardData?.website || "",
        });
        setIsEditingVCard(false);
        setError(null);
    };

    if (isLoadingCard) {
        return (
            <div className="flex justify-center py-6 sm:py-8">
                <Loading />
            </div>
        );
    }

    if (!userBusinessCard) {
        return (
            <div className="bg-white p-6 sm:p-8 rounded-lg border text-center">
                <div className="text-gray-400 mb-3 sm:mb-4">
                    <Database className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2" />
                </div>
                <p className="text-sm sm:text-base text-gray-600">
                    Este usuario no tiene V-Card configurada
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* QR Code Section */}
            {userBusinessCard.qrCodeUrl && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 sm:p-6 text-center border-b">
                    <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <img
                            src={userBusinessCard.qrCodeUrl}
                            alt="QR Code"
                            className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white p-2 rounded-lg shadow-sm flex-shrink-0"
                        />
                        <div className="text-center sm:text-left">
                            <p className="text-sm sm:text-base font-medium text-gray-700">
                                QR Code Disponible
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 mt-1">
                                Escanea para ver la V-Card
                            </p>
                            {userBusinessCard.slug && (
                                <p className="text-xs sm:text-sm text-blue-600 mt-2 break-all font-mono">
                                    /{userBusinessCard.slug}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* V-Card Data */}
            <div className="p-4 sm:p-6">
                {/* Header con botón de edición */}
                <div className="flex justify-between items-center mb-4">
                    <h5 className="text-sm sm:text-base font-semibold text-gray-700">
                        Información de V-Card
                    </h5>
                    {!isEditingVCard && (
                        <button
                            onClick={() => setIsEditingVCard(true)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Editar V-Card</span>
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {isEditingVCard ? (
                    // Modo de edición
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FomrField title="Nombre">
                                <Input
                                    value={editableVCardData.name}
                                    onChange={(e) => handleVCardChange("name", e.target.value)}
                                    placeholder="Nombre completo"
                                />
                            </FomrField>

                            <FomrField title="Título/Posición">
                                <Input
                                    value={editableVCardData.title}
                                    onChange={(e) => handleVCardChange("title", e.target.value)}
                                    placeholder="Ej: CEO, Desarrollador"
                                />
                            </FomrField>

                            <FomrField title="Empresa">
                                <Input
                                    value={editableVCardData.company}
                                    onChange={(e) => handleVCardChange("company", e.target.value)}
                                    placeholder="Nombre de la empresa"
                                />
                            </FomrField>

                            <FomrField title="Email">
                                <Input
                                    type="email"
                                    value={editableVCardData.email}
                                    onChange={(e) => handleVCardChange("email", e.target.value)}
                                    placeholder="correo@ejemplo.com"
                                />
                            </FomrField>

                            <FomrField title="Teléfono">
                                <Input
                                    type="tel"
                                    value={editableVCardData.phone}
                                    onChange={(e) => handleVCardChange("phone", e.target.value)}
                                    placeholder="+593 99 999 9999"
                                />
                            </FomrField>

                            <FomrField title="Sitio Web">
                                <Input
                                    type="url"
                                    value={editableVCardData.website}
                                    onChange={(e) => handleVCardChange("website", e.target.value)}
                                    placeholder="https://ejemplo.com"
                                />
                            </FomrField>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 border-t border-gray-200">
                            <div className="w-full sm:w-auto">
                                <Button onClick={handleSaveVCard} disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                            <span>Guardando...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            <span>Guardar VCard</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                            <div className="w-full sm:w-auto">
                                <Button onClick={handleCancelEdit} variant="secondary" disabled={isSaving}>
                                    <X className="w-4 h-4" />
                                    <span>Cancelar</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    // Modo de visualización
                    <>
                        {vCardData ? (
                            <div className="space-y-3 sm:space-y-4">
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
                                            className="flex flex-col sm:flex-row sm:items-center border-b border-gray-100 pb-2 sm:pb-3 last:border-b-0 last:pb-0"
                                        >
                      <span className="text-xs sm:text-sm text-gray-500 sm:w-24 lg:w-28 mb-1 sm:mb-0 font-medium uppercase tracking-wide">
                        {item.label}:
                      </span>
                                            <div className="flex-1 min-w-0">
                                                {item.isEmail ? (
                                                    <a
                                                        href={`mailto:${item.value}`}
                                                        className="text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors duration-200"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : item.isPhone ? (
                                                    <a
                                                        href={`tel:${item.value}`}
                                                        className="text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : item.isUrl ? (
                                                    <a
                                                        href={item.value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-sm sm:text-base text-blue-600 hover:text-blue-800 hover:underline break-all transition-colors duration-200"
                                                    >
                                                        {item.value}
                                                    </a>
                                                ) : (
                                                    <span className="text-sm sm:text-base text-gray-800 break-words">
                            {item.value}
                          </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 sm:py-8">
                                <p className="text-sm sm:text-base text-gray-500">
                                    V-Card sin datos configurados
                                </p>
                            </div>
                        )}
                    </>
                )}

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs sm:text-sm text-gray-500 space-y-2 sm:space-y-0">
            <span
                className={`px-3 py-2 rounded-full text-xs sm:text-sm w-fit font-medium ${
                    userBusinessCard.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                }`}
            >
              {userBusinessCard.isActive ? "V-Card Activa" : "V-Card Inactiva"}
            </span>
                        <span className="break-all font-mono text-xs sm:text-sm">
              ID: {userBusinessCard.id?.substring(0, 8)}...
            </span>
                    </div>
                </div>
            </div>
        </div>
    );
}