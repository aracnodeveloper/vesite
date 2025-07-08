import { useRef, useState } from "react";
import { ChevronLeft, X, ImagePlus } from "lucide-react";
import { message } from "antd";
import { uploadLinkImage } from "../../../MySite/Profile/lib/uploadImage.ts";
import LinkImage from "./LinkImage";
import type {RegularLink} from "../../../../../interfaces/PreviewContext.ts";

interface LinkEditFormProps {
    link: RegularLink;
    editTitle: string;
    editUrl: string;
    editImage: string | undefined;
    isSubmitting: boolean;
    onTitleChange: (title: string) => void;
    onUrlChange: (url: string) => void;
    onImageChange: (image: string | undefined) => void;
    onSave: () => void;
    onCancel: () => void;
}

const LinkEditForm = ({
                          link,
                          editTitle,
                          editUrl,
                          editImage,
                          isSubmitting,
                          onTitleChange,
                          onUrlChange,
                          onImageChange,
                          onSave,
                          onCancel
                      }: LinkEditFormProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const validateFile = (file: File): boolean => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF');
            return false;
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (file.size > maxSize) {
            message.error('El archivo es demasiado grande. Tamaño máximo: 5MB');
            return false;
        }

        return true;
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            console.error('Please select an image file');
            alert('Por favor selecciona un archivo de imagen válido');
            return;
        }

        // Validar tamaño (opcional - máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            console.error('Image size should be less than 5MB');
            alert('El tamaño de la imagen debe ser menor a 5MB');
            return;
        }

        if (!validateFile(file)) {
            return;
        }

        if (link.id) {
            try {
                setUploadingImage(true);
                console.log("Uploading image for link ID:", link.id);

                // Subir imagen usando el endpoint específico
                const imageUrl = await uploadLinkImage(file, link.id);
                console.log("Image uploaded successfully:", imageUrl);

                // Actualizar el estado local para mostrar la imagen inmediatamente
                onImageChange(imageUrl);

                console.log("Image URL set in edit state:", imageUrl);

            } catch (error) {
                console.error("Error uploading link image:", error);
                alert('Error al subir la imagen al servidor');

                // Fallback a base64 si falla la subida
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        onImageChange(reader.result);
                    }
                };
                reader.readAsDataURL(file);
            } finally {
                setUploadingImage(false);
            }
        } else {
            // Si no hay ID del enlace, usar base64 como fallback
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    onImageChange(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }

        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = '';
    };

    return (
        <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
            {/* Header */}
            <div className="p-4">
                <button
                    onClick={onCancel}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                    disabled={isSubmitting}
                >
                    <ChevronLeft className="w-5 h-5 mr-1 text-black"/>
                    <h1 className="text-lg text-black font-semibold">Editar Link</h1>
                </button>
            </div>

            {/* Form Content */}
            <div className="p-4">
                <div className="space-y-4">
                    <div>
                        <p className="text-sm mb-1 text-gray-600">NOMBRE</p>
                        <input
                            value={editTitle}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#FAFFF6] text-black focus:outline-none focus:border-blue-500"
                            placeholder="Nombre del enlace"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <p className="text-sm mb-1 text-gray-600">URL</p>
                        <input
                            value={editUrl}
                            onChange={(e) => onUrlChange(e.target.value)}
                            className="w-full p-3 rounded-lg bg-[#FAFFF6] text-black focus:outline-none focus:border-blue-500"
                            placeholder="https://ejemplo.com"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <p className="text-sm mb-1 text-gray-600">IMAGEN (opcional)</p>
                        <div className="flex items-center space-x-2">
                            {editImage ? (
                                <div className="relative">
                                    <LinkImage
                                        image={editImage}
                                        title={editTitle || "Link"}
                                        size="large"
                                    />
                                    <button
                                        onClick={() => onImageChange(undefined)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                                        disabled={isSubmitting || uploadingImage}
                                    >
                                        <X size={12} />
                                    </button>
                                    {uploadingImage && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors relative"
                                    disabled={isSubmitting || uploadingImage}
                                >
                                    {uploadingImage ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                                    ) : (
                                        <ImagePlus size={24} className="text-gray-400" />
                                    )}
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                disabled={uploadingImage}
                            />
                        </div>
                        {uploadingImage && (
                            <p className="text-sm text-blue-600 mt-1">Subiendo imagen...</p>
                        )}
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={onSave}
                            disabled={isSubmitting || !editTitle.trim() || !editUrl.trim() || uploadingImage}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            onClick={onCancel}
                            disabled={isSubmitting || uploadingImage}
                            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LinkEditForm;