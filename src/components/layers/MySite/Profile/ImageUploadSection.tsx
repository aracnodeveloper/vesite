import { Upload, Image, message } from "antd";
import { uploadBiositeAvatar, uploadBiositeBackground } from "./lib/uploadImage.ts";
import type { BiositeFull, BiositeUpdateDto, BiositeColors } from "../../../../interfaces/Biosite";
import { useState, useEffect, useRef } from "react";
import ImageEditorModal from "../../../global/ImagenesModal/ImageEditorModal.tsx";

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

    const [showModal, setShowModal] = useState<'avatar' | 'background' | null>(null);
    const [showEditor, setShowEditor] = useState(false);
    const [imageToEdit, setImageToEdit] = useState<string>("");
    const [editingType, setEditingType] = useState<"avatarImage" | "backgroundImage" | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowModal(null);
            }
        };

        if (showModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showModal]);

    const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='120' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e5e7eb'/%3E%3Cpath d='M40 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM20 60c0-10 9-15 20-15s20 5 20 15v5H20v-5z' fill='%239ca3af'/%3E%3C/svg%3E";

    const placeholderBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f3f4f6'/%3E%3Cpath d='M40 40h120v40H40z' fill='%23d1d5db'/%3E%3Ccircle cx='60' cy='50' r='8' fill='%239ca3af'/%3E%3Cpath d='M80 65l20-15 40 25H80z' fill='%239ca3af'/%3E%3C/svg%3E";

    const DEFAULT_BACKGROUND = "https://visitaecuador.com/bio-api/img/image-1753208386348-229952436.jpeg";

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

    const handleFileSelect = (file: File, key: "avatarImage" | "backgroundImage") => {
        if (!validateFile(file)) return;

        const reader = new FileReader();

        reader.onerror = () => {
            message.error('Error al leer el archivo');
        };

        reader.onload = (e) => {
            const imageUrl = e.target?.result as string;

            if (!imageUrl || imageUrl.trim() === '') {
                message.error('Error: La imagen no se pudo cargar correctamente');
                return;
            }

            setImageToEdit(imageUrl);
            setEditingType(key);
            setPendingFile(file);
            setShowEditor(true);
            setShowModal(null);
        };

        reader.readAsDataURL(file);
    };

    const handleEditorSave = async (croppedBlob: Blob) => {
        if (!editingType || !biosite?.id || !userId || isUploading) {
            message.error("Error: Información no disponible");
            return;
        }

        try {
            setIsUploading(true);

            const loadingMessage = message.loading(
                `Subiendo ${editingType === 'avatarImage' ? 'avatar' : 'imagen de portada'}...`,
                0
            );

            const croppedFile = new File(
                [croppedBlob],
                pendingFile?.name || 'edited-image.jpg',
                { type: 'image/jpeg' }
            );

            let imageUrl: string;

            if (editingType === 'avatarImage') {
                imageUrl = await uploadBiositeAvatar(croppedFile, biosite.id);
            } else {
                imageUrl = await uploadBiositeBackground(croppedFile, biosite.id);
            }

            loadingMessage();

            if (!imageUrl) {
                throw new Error("No se pudo obtener la URL de la imagen");
            }

            if (!isValidImageUrl(imageUrl)) {
                throw new Error("La URL de la imagen subida no es válida");
            }

            const previewUpdate = {
                [editingType]: imageUrl
            };

            updatePreview(previewUpdate);

            message.success(`${editingType === 'avatarImage' ? 'Avatar' : 'Imagen de portada'} actualizada correctamente`);

            // Limpiar estados
            setShowEditor(false);
            setPendingFile(null);
            setEditingType(null);
            setImageToEdit("");

        } catch (error: any) {
            let errorMessage = "Error al subir la imagen";

            if (error?.message) {
                errorMessage = error.message;
            } else if (error?.response?.data?.message) {
                errorMessage = error.response.data.message;
            }

            message.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = async (key: "avatarImage" | "backgroundImage") => {
        if (!biosite?.id) {
            message.error("Error: ID del biosite no disponible");
            return;
        }

        try {
            setShowModal(null);

            const loadingMessage = message.loading(
                `Removiendo ${key === 'avatarImage' ? 'avatar' : 'imagen de portada'}...`,
                0
            );

            const ensureColorsAsString = (colors: string | BiositeColors | null | undefined): string => {
                if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                if (typeof colors === "string") {
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
                fonts: biosite.fonts || "",
                backgroundImage: key === 'backgroundImage' ? DEFAULT_BACKGROUND : (biosite.backgroundImage || DEFAULT_BACKGROUND),
                isActive: biosite.isActive ?? true,
            };

            if (key === 'avatarImage') {
                updateData.avatarImage = null;
            }

            const updated = await updateBiosite(updateData);

            loadingMessage();

            if (updated) {
                updatePreview({ [key]: key === 'avatarImage' ? null : DEFAULT_BACKGROUND });
                message.success(`${key === 'avatarImage' ? 'Avatar' : 'Imagen de portada'} removida correctamente`);

                setTimeout(() => {
                    window.location.reload();
                }, 500);
            }

        } catch (error: any) {
            message.error("Error al remover la imagen");
            console.error(error);
        }
    };

    const customUpload = (options: any, key: "avatarImage" | "backgroundImage") => {
        const { file, onSuccess, onError } = options;

        if (!validateFile(file)) {
            onError(new Error('Invalid file'));
            return;
        }

        handleFileSelect(file, key);
        onSuccess({}, file);
    };

    const canEditCover = role === "SUPER_ADMIN" || role === "ADMIN";

    const safeAvatarImage = isValidImageUrl(biosite.avatarImage) ? biosite.avatarImage : placeholderAvatar;
    const safeBackgroundImage = isValidImageUrl(biosite.backgroundImage) ? biosite.backgroundImage : placeholderBackground;

    return (
        <>
            <div ref={containerRef}>
                <div className="flex gap-3">
                    {/* Avatar Section */}
                    <div className="flex-1 flex gap-2 items-start">
                        <div
                            className="relative cursor-pointer"
                            onClick={() => setShowModal(showModal === 'avatar' ? null : 'avatar')}
                        >
                            <div className="w-24 h-24 border-gray-400 rounded-xl border flex items-center justify-center overflow-hidden transition-opacity hover:opacity-80">
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

                            {loading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl pointer-events-none">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                </div>
                            )}
                        </div>

                        {showModal === 'avatar' && (
                            <div className="absolute flex flex-col gap-1 bg-white rounded-lg p-2 z-50">
                                <Upload
                                    showUploadList={false}
                                    customRequest={(options) => customUpload(options, "avatarImage")}
                                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                    disabled={loading}
                                    multiple={false}
                                    maxCount={1}
                                >
                                    <button
                                        disabled={loading}
                                        className="px-3 py-2 text-left text-gray-600 bg-transparent hover:bg-gray-200 rounded transition-colors flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        <span className="font-medium">REMPLAZAR</span>
                                    </button>
                                </Upload>

                                <button
                                    onClick={() => handleRemoveImage('avatarImage')}
                                    disabled={loading}
                                    className="px-3 py-2 text-left text-gray-600 bg-transparent hover:bg-gray-200 rounded transition-colors flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span className="font-medium">REMOVER</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Background Image Section */}
                    {canEditCover && (
                        <div className="flex-1 flex gap-2 items-start">
                            <div
                                className="relative cursor-pointer"
                                onClick={() => setShowModal(showModal === 'background' ? null : 'background')}
                            >
                                <div className="w-59 h-24 bg-gray-100 rounded-lg border-gray-400 border flex items-center justify-center overflow-hidden transition-opacity hover:opacity-80">
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

                                {loading && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg pointer-events-none">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    </div>
                                )}
                            </div>

                            {showModal === 'background' && (
                                <div className="absolute flex flex-col gap-1 bg-white rounded-lg p-2 z-50">
                                    <Upload
                                        showUploadList={false}
                                        customRequest={(options) => customUpload(options, "backgroundImage")}
                                        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                                        disabled={loading}
                                        multiple={false}
                                        maxCount={1}
                                    >
                                        <button
                                            disabled={loading}
                                            className="px-3 py-2 text-left text-gray-600 bg-transparent hover:bg-gray-200 rounded transition-colors flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            <span className="font-medium">REMPLAZAR</span>
                                        </button>
                                    </Upload>

                                    <button
                                        onClick={() => handleRemoveImage('backgroundImage')}
                                        disabled={loading}
                                        className="px-3 py-2 text-left text-gray-600 bg-transparent hover:bg-gray-200 rounded transition-colors flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span className="font-medium">REMOVER</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Image Editor Modal */}
            <ImageEditorModal
                visible={showEditor && !isUploading}
                imageUrl={imageToEdit}
                onCancel={() => {
                    if (!isUploading) {
                        setShowEditor(false);
                        setPendingFile(null);
                        setEditingType(null);
                        setImageToEdit("");
                    }
                }}
                onSave={handleEditorSave}
                aspectRatio={editingType === 'avatarImage' ? 1 : 16 / 9}
            />
        </>
    );
};

export default ImageUploadSection;