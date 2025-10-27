import { Upload, Image, message, Modal } from "antd";
import { uploadBiositeAvatar, uploadBiositeBackground } from "./lib/uploadImage.ts";
import type { BiositeFull, BiositeUpdateDto, BiositeColors } from "../../../../interfaces/Biosite";
import { useState } from "react";

interface ImageUploadSectionProps {
    biosite: BiositeFull;
    loading: boolean;
    userId: string | undefined;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    updatePreview: (data: Partial<BiositeFull>) => void;
    role: string | undefined;
}

const ImageUploadSection = ({
                                biosite,
                                loading,
                                userId,
                                updateBiosite,
                                updatePreview,
                                role
                            }: ImageUploadSectionProps) => {

    const [hoveredImage, setHoveredImage] = useState<'avatar' | 'background' | null>(null);

    const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e5e7eb'/%3E%3Cpath d='M40 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM20 60c0-10 9-15 20-15s20 5 20 15v5H20v-5z' fill='%239ca3af'/%3E%3C/svg%3E";

    const placeholderBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f3f4f6'/%3E%3Cpath d='M40 40h120v40H40z' fill='%23d1d5db'/%3E%3Ccircle cx='60' cy='50' r='8' fill='%239ca3af'/%3E%3Cpath d='M80 65l20-15 40 25H80z' fill='%239ca3af'/%3E%3C/svg%3E";

    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        if (url.startsWith('data:')) {
            const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
            const isValid = dataUrlRegex.test(url);
            if (isValid) {
                const base64Part = url.split(',')[1];
                return base64Part && base64Part.length > 10;
            }
            return false;
        }

        try {
            const urlObj = new URL(url);
            const isHttps = ['http:', 'https:'].includes(urlObj.protocol);
            const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
                url.includes('/img/') ||
                url.includes('image-');

            return isHttps && (hasValidExtension || !urlObj.pathname.includes('.'));
        } catch (error) {
            console.warn('Invalid URL:', url, error);
            return false;
        }
    };

    const validateFile = (file: File): boolean => {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            message.error('Formato de archivo no válido. Solo se permiten: JPG, PNG, WebP, GIF');
            return false;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('El archivo es demasiado grande. Tamaño máximo: 5MB');
            return false;
        }

        return true;
    };

    const handleUpload = async (file: File, key: "avatarImage" | "backgroundImage") => {
        console.log('=== handleUpload called ===');
        console.log('File:', file);
        console.log('Key:', key);
        console.log('File type:', file.type);
        console.log('File size:', file.size);
        console.log('File instanceof File:', file instanceof File);

        if (!file || !(file instanceof File)) {
            console.error('Invalid file object:', file);
            message.error("Error: Archivo no válido");
            return;
        }

        if (!validateFile(file)) {
            console.error('File validation failed');
            return;
        }

        if (!biosite?.id) {
            console.error('Biosite ID missing');
            message.error("Error: ID del biosite no disponible");
            return;
        }

        if (!userId) {
            console.error('User ID missing');
            message.error("Error: ID de usuario no disponible");
            return;
        }

        try {
            const loadingMessage = message.loading(
                `Subiendo ${key === 'avatarImage' ? 'avatar' : 'imagen de portada'}...`,
                0
            );

            console.log('Starting upload...');
            let imageUrl: string;

            if (key === 'avatarImage') {
                imageUrl = await uploadBiositeAvatar(file, biosite.id);
            } else {
                imageUrl = await uploadBiositeBackground(file, biosite.id);
            }

            console.log('Upload completed. URL:', imageUrl);
            loadingMessage();

            if (!imageUrl) {
                throw new Error("No se pudo obtener la URL de la imagen");
            }

            if (!isValidImageUrl(imageUrl)) {
                throw new Error("La URL de la imagen subida no es válida");
            }

            const previewUpdate = {
                [key]: imageUrl
            };

            updatePreview(previewUpdate);

            message.success(`${key === 'avatarImage' ? 'Avatar' : 'Imagen de portada'} actualizada correctamente`);

            console.log('Upload successful, reloading page...');
            setTimeout(() => {
                window.location.reload();
            }, 800);

        } catch (error: any) {
            console.error('Upload error:', error);
            let errorMessage = "Error al subir la imagen";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            message.error(errorMessage);
        }
    };

    const handleRemoveImage = async (key: "avatarImage" | "backgroundImage", e: React.MouseEvent) => {
        // CRÍTICO: Detener la propagación del evento
        e.preventDefault();
        e.stopPropagation();

        console.log('handleRemoveImage called with key:', key);
        console.log('Current biosite:', biosite);



        try {
            const loadingMessage = message.loading('Eliminando imagen...', 0);

            console.log('Preparing update data...');

            const ensureColorsAsString = (
                colors: string | BiositeColors | null | undefined
            ): string => {
                if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                if (typeof colors === 'string') {
                    try {
                        JSON.parse(colors);
                        return colors;
                    } catch {
                        return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                    }
                }
                return JSON.stringify(colors);
            };

            const updateData: BiositeUpdateDto = {
                ownerId: biosite.ownerId || userId!,
                title: biosite.title,
                slug: biosite.slug,
                themeId: biosite.themeId,
                colors: ensureColorsAsString(biosite.colors),
                fonts: biosite.fonts || "Inter",
                backgroundImage: key === 'backgroundImage' ? null : (biosite.backgroundImage || null),
                isActive: biosite.isActive ?? true,
            };

            if (key === 'avatarImage') {
                updateData.avatarImage = null;
                console.log('Removing avatar image');
            }

            console.log('Update data prepared:', updateData);
            console.log('Calling updateBiosite...');

            const updated = await updateBiosite(updateData);

            console.log('Update response:', updated);

            if (updated) {
                const previewUpdate: Partial<BiositeFull> = {};

                if (key === 'avatarImage') {
                    previewUpdate.avatarImage = null;
                } else {
                    previewUpdate.backgroundImage = null;
                }

                updatePreview(previewUpdate);

                loadingMessage();
                message.success('Imagen eliminada correctamente');

                console.log('Image removed successfully, reloading page...');

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            } else {
                throw new Error('No se recibió respuesta del servidor');
            }
        } catch (error: any) {
            console.error('Error removing image:', error);
            console.error('Error details:', {
                message: error?.message,
                response: error?.response,
                stack: error?.stack
            });
            message.error(`Error al eliminar la imagen: ${error?.message || 'Error desconocido'}`);
        }
    };

    const customUpload = (options: any, key: "avatarImage" | "backgroundImage") => {
        console.log('=== customUpload called ===');
        console.log('Options:', options);
        console.log('Key:', key);

        const { file, onSuccess, onError } = options;

        console.log('File from options:', file);
        console.log('File type:', typeof file);
        console.log('File is File instance:', file instanceof File);
        console.log('File is Blob instance:', file instanceof Blob);

        // En algunos casos en Mac/Safari, el file puede venir como Blob
        // Necesitamos asegurarnos de que sea un File válido
        let fileToUpload: File;

        if (file instanceof File) {
            fileToUpload = file;
        } else if (file instanceof Blob) {
            // Convertir Blob a File
            const fileName =  `image-${Date.now()}.jpg`;
            fileToUpload = new File([file], fileName, { type: file.type || 'image/jpeg' });
            console.log('Converted Blob to File:', fileToUpload);
        } else {
            console.error('Invalid file type:', file);
            onError(new Error('Tipo de archivo no válido'));
            return;
        }

        if (!validateFile(fileToUpload)) {
            console.error('File validation failed');
            onError(new Error('Validación de archivo falló'));
            return;
        }

        console.log('Valid file, starting upload:', {
            name: fileToUpload.name,
            type: fileToUpload.type,
            size: fileToUpload.size
        });

        handleUpload(fileToUpload, key)
            .then(() => {
                console.log('Upload successful');
                onSuccess({ status: 'done' }, fileToUpload);
            })
            .catch((error) => {
                console.error('Upload failed:', error);
                onError(error);
            });
    };

    const canEditCover = role === "SUPER_ADMIN" || role === "ADMIN";

    const safeAvatarImage = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : placeholderAvatar;
    const safeBackgroundImage = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : placeholderBackground;

    const hasRealAvatar = isValidImageUrl(biosite.avatarImage);
    const hasRealBackground = isValidImageUrl(biosite.backgroundImage);

    return (
        <div className="flex gap-3">
            {/* Avatar Section */}
            <div className="flex-1">
                <div
                    className="relative group"
                    onMouseEnter={() => setHoveredImage('avatar')}
                    onMouseLeave={() => setHoveredImage(null)}
                >
                    <div className="w-24 h-24 border-gray-400 rounded-xl border flex items-center justify-center overflow-hidden">
                        <Image
                            width={100}
                            height={100}
                            src={safeAvatarImage}
                            className="object-cover"
                            fallback={placeholderAvatar}
                            preview={false}
                            onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                if (img.src !== placeholderAvatar) {
                                    img.src = placeholderAvatar;
                                }
                            }}
                        />
                    </div>

                    {/* Action Buttons */}
                    {hoveredImage === 'avatar' && !loading && (
                        <div className="absolute inset-0 bg-black bg-opacity-70 rounded-xl flex flex-col items-center justify-center gap-2 transition-opacity">
                            <Upload
                                showUploadList={false}
                                customRequest={(options) => customUpload(options, "avatarImage")}
                                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                disabled={loading}
                                multiple={false}
                                maxCount={1}
                            >
                                <button className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-xs font-medium hover:bg-gray-100 transition-colors">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    REPLACE
                                </button>
                            </Upload>

                            {hasRealAvatar && (
                                <button
                                    onClick={(e) => handleRemoveImage('avatarImage',e)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-md text-xs font-medium text-white hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    REMOVE
                                </button>
                            )}
                        </div>
                    )}

                    {loading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-xl">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Background Image Section */}
            {canEditCover && (
                <div className="flex-1">
                    <div
                        className="relative group"
                        onMouseEnter={() => setHoveredImage('background')}
                        onMouseLeave={() => setHoveredImage(null)}
                    >
                        <div className="w-59 h-24 bg-gray-100 rounded-lg border-gray-400 border flex items-center justify-center overflow-hidden">
                            <Image
                                width={340}
                                height={100}
                                src={safeBackgroundImage}
                                className="rounded-lg object-cover"
                                fallback={placeholderBackground}
                                preview={false}
                                onError={(e) => {
                                    const img = e.target as HTMLImageElement;
                                    if (img.src !== placeholderBackground) {
                                        img.src = placeholderBackground;
                                    }
                                }}
                            />
                        </div>

                        {/* Action Buttons */}
                        {hoveredImage === 'background' && !loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg flex flex-col items-center justify-center gap-2 transition-opacity">
                                <Upload
                                    showUploadList={false}
                                    customRequest={(options) => customUpload(options, "backgroundImage")}
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    disabled={loading}
                                    multiple={false}
                                    maxCount={1}
                                    beforeUpload={(file) => {
                                        console.log('beforeUpload called with:', file);
                                        const isValid = validateFile(file);
                                        console.log('File validation result:', isValid);
                                        return isValid || Upload.LIST_IGNORE;
                                    }}
                                >
                                    <button
                                        type="button"
                                        className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-md text-xs font-medium hover:bg-gray-100 transition-colors"
                                        onClick={(e) => {
                                            console.log('REPLACE button clicked for background');
                                            e.stopPropagation();
                                        }}
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        REPLACE
                                    </button>
                                </Upload>

                                {hasRealBackground && (
                                    <button
                                        onClick={(e) => handleRemoveImage('backgroundImage',e)}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-md text-xs font-medium text-white hover:bg-red-600 transition-colors"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        REMOVE
                                    </button>
                                )}
                            </div>
                        )}

                        {loading && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;