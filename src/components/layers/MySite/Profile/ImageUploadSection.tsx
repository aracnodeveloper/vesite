import { Upload, Image, message } from "antd";
import { uploadImage } from "./lib/uploadImage";
import type { BiositeFull, BiositeUpdateDto } from "../../../../interfaces/Biosite";

interface ImageUploadSectionProps {
    biosite: BiositeFull;
    loading: boolean;
    userId: string | undefined;
    updateBiosite: (data: BiositeUpdateDto) => Promise<BiositeFull | null>;
    updatePreview: (data: Partial<BiositeFull>) => void;
    role: string | undefined;
}
//http://pacoelmorlaco.com/assets/final-DVKF3YLC.png
    //https://media.bio.site/sites/c4f9c218-9fd0-4c21-9c9b-29c7a3e8a680/9Wiay7YtnvgUGWnNgAhTCk.jpg
const ImageUploadSection = ({
                                biosite,
                                loading,
                                userId,
                                updateBiosite,
                                updatePreview,
                                role
                            }: ImageUploadSectionProps) => {

    const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e5e7eb'/%3E%3Cpath d='M40 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM20 60c0-10 9-15 20-15s20 5 20 15v5H20v-5z' fill='%239ca3af'/%3E%3C/svg%3E";

    const placeholderBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f3f4f6'/%3E%3Cpath d='M40 40h120v40H40z' fill='%23d1d5db'/%3E%3Ccircle cx='60' cy='50' r='8' fill='%239ca3af'/%3E%3Cpath d='M80 65l20-15 40 25H80z' fill='%239ca3af'/%3E%3C/svg%3E";

    // Enhanced image validation
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

            const blockedDomains = [
                'visitaecuador.com',
                'suspicious-domain.com',
                'blocked-site.net'
            ];

            const isDomainBlocked = blockedDomains.some(domain =>
                urlObj.hostname.includes(domain) || urlObj.hostname === domain
            );

            if (isDomainBlocked) {
                console.warn(`Blocked domain detected: ${urlObj.hostname}`);
                return false;
            }

            return isHttps;
        } catch (error) {
            console.warn('Invalid URL:', url, error);
            return false;
        }
    };

    const handleUpload = async (info: any, key: "avatarImage" | "backgroundImage") => {
        console.log(`=== HANDLE UPLOAD DEBUG (${key}) ===`);
        console.log('Upload info:', info);
        console.log('File object:', info.file);
        console.log('File status:', info.file?.status);
        console.log('File name:', info.file?.name);
        console.log('File type:', info.file?.type);
        console.log('Has originFileObj:', !!info.file?.originFileObj);

        // Check if the upload was cancelled or no file was selected
        if (!info.file) {
            console.log("No file in info object, upload was likely cancelled");
            return;
        }

        // Check if the file status indicates removal or cancellation
        if (info.file.status === 'removed' || info.file.status === 'error') {
            console.log(`Upload ${info.file.status} for ${key}`);
            return;
        }

        // Fix: Check for both originFileObj and direct file object
        const fileToUpload = info.file.originFileObj || info.file;

        if (!fileToUpload) {
            console.log("No valid file object found");
            return;
        }

        // Additional check to ensure it's a File object
        if (!(fileToUpload instanceof File)) {
            console.log("File object is not an instance of File:", typeof fileToUpload);
            return;
        }

        console.log("Using file object:", fileToUpload);
        console.log("File details:", {
            name: fileToUpload.name,
            type: fileToUpload.type,
            size: fileToUpload.size
        });

        if (!biosite) {
            console.error("No biosite data available for upload");
            message.error("Error: No hay datos del biosite disponibles");
            return;
        }

        if (!biosite.id) {
            console.error("Biosite ID is missing for upload");
            message.error("Error: ID del biosite no disponible");
            return;
        }

        if (!userId) {
            console.error("User ID is missing for upload");
            message.error("Error: ID de usuario no disponible");
            return;
        }

        try {
            // Validate file type
            if (!fileToUpload.type.startsWith('image/')) {
                console.error("File is not an image");
                message.error("Error: El archivo debe ser una imagen");
                return;
            }

            // Validate file size (optional - e.g., max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (fileToUpload.size > maxSize) {
                console.error("File too large");
                message.error("Error: El archivo es demasiado grande (máximo 10MB)");
                return;
            }

            console.log(`Uploading ${key}...`);
            const loadingMessage = message.loading(
                `Subiendo ${key === 'avatarImage' ? 'avatar' : 'imagen de portada'}...`,
                0
            );

            const imageUrl = await uploadImage(fileToUpload);
            console.log("Upload completed, received URL:", imageUrl);

            if (!imageUrl) {
                loadingMessage();
                console.error("Upload failed - no URL returned");
                message.error("Error: No se pudo obtener la URL de la imagen");
                return;
            }

            console.log(`Upload successful. New URL: ${imageUrl}`);

            // Validate the uploaded image URL
            if (!isValidImageUrl(imageUrl)) {
                loadingMessage();
                console.error("Uploaded image URL is invalid:", imageUrl);
                message.error("Error: La URL de la imagen subida no es válida");
                return;
            }

            // Create proper update data object
            const updateData: BiositeUpdateDto = {
                ownerId: biosite.ownerId || userId,
                title: biosite.title,
                slug: biosite.slug,
                themeId: biosite.themeId,
                colors: biosite.colors || '{"primary":"#3B82F6","secondary":"#1F2937"}',
                fonts: biosite.fonts || '',
                avatarImage: key === 'avatarImage' ? imageUrl : (biosite.avatarImage || ''),
                backgroundImage: key === 'backgroundImage' ? imageUrl : (biosite.backgroundImage || ''),
                isActive: biosite.isActive ?? true
            };

            console.log(`=== UPDATING ${key.toUpperCase()} ===`);
            console.log('Update data:', updateData);

            const updated = await updateBiosite(updateData);
            loadingMessage();

            console.log(`=== ${key.toUpperCase()} UPDATE RESULT ===`);
            console.log('Updated result:', updated);

            if (updated) {
                updatePreview(updated);
                message.success(`${key === 'avatarImage' ? 'Avatar' : 'Imagen de portada'} actualizada correctamente`);
                console.log(`${key} updated successfully`);
            } else {
                console.error(`${key} update failed - returned null/undefined`);
                message.error("Error al actualizar la imagen");
            }
        } catch (error) {
            console.error(`=== ${key.toUpperCase()} UPLOAD ERROR ===`);
            console.error("Error updating image:", error);
            message.error("Error al subir la imagen. Verifica el archivo e inténtalo de nuevo.");
        }
    };

    const canEditCover = role === "ADMIN" || role === "SUPER_ADMIN";

    // Get safe image URLs with fallback
    const safeAvatarImage = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : placeholderAvatar;
    const safeBackgroundImage = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : placeholderBackground;

    return (
        <div className="space-y-6 flex gap-3 justify-between mb-6">
            {/* Avatar Section */}
            <div className="p-4 rounded-lg">
                <h3 className="font-semibold mb-3 text-white">Avatar</h3>
                <div className="flex items-center space-x-4">
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={(info) => handleUpload(info, "avatarImage")}
                        accept="image/*"
                        disabled={loading}
                    >
                        <div className="relative">
                            <Image
                                width={100}
                                height={120}
                                src={safeAvatarImage}
                                className="object-cover cursor-pointer rounded-lg"
                                fallback={placeholderAvatar}
                                preview={false}
                                onError={(e) => {
                                    console.warn('Avatar image failed to load:', biosite.avatarImage);
                                    const img = e.target as HTMLImageElement;
                                    if (img.src !== placeholderAvatar) {
                                        img.src = placeholderAvatar;
                                    }
                                }}
                            />
                            {loading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>
                    </Upload>
                    <div className="text-sm text-gray-400">
                        <p>Tamaño recomendado: 400x400px</p>
                    </div>
                </div>
            </div>

            {/* Background Image Section */}
            {canEditCover && (
                <div className="p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-white">Imagen de portada</h3>
                    <div className="space-y-3">
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={(info) => handleUpload(info, "backgroundImage")}
                            accept="image/*"
                            disabled={loading}
                        >
                            <div className="relative">
                                <Image
                                    width={200}
                                    height={120}
                                    src={safeBackgroundImage}
                                    className="rounded-lg object-cover cursor-pointer"
                                    fallback={placeholderBackground}
                                    preview={false}
                                    onError={(e) => {
                                        console.warn('Background image failed to load:', biosite.backgroundImage);
                                        const img = e.target as HTMLImageElement;
                                        if (img.src !== placeholderBackground) {
                                            img.src = placeholderBackground;
                                        }
                                    }}
                                />
                                {loading && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>
                        </Upload>
                        <div className="text-sm text-gray-400">
                            <p>Tamaño recomendado: 1200x400px</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploadSection;