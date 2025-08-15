import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    Plus,
    X,
    Check,
    GripVertical,
    Edit2,
} from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import { useNavigate } from "react-router-dom";
import { uploadLinkImage } from "../../MySite/Profile/lib/uploadImage.ts";
import { message } from "antd";
import LinkEditForm from "./Components/LinksEditForm.tsx";

const LinksPage = () => {
    const {
        regularLinks,
        addRegularLink,
        removeRegularLink,
        updateRegularLink,
        reorderRegularLinks,
        loading,
        error,
        refreshBiosite  // Add this to refresh the biosite data
    } = usePreview();

    const [adding, setAdding] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editImage, setEditImage] = useState<string | undefined>(undefined);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const navigate = useNavigate();

    const activeLinks = regularLinks.filter(link => link.isActive);

    // Placeholders similares a ImageUploadSection
    const placeholderLinkImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6' rx='6'/%3E%3Cpath d='M10 10h20v20H10z' fill='%23d1d5db'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%239ca3af'/%3E%3Cpath d='M12 28l8-6 8 6H12z' fill='%239ca3af'/%3E%3C/svg%3E";

    // ============== FUNCIONES DE VALIDACIÓN DE URL ==============
    // Función para normalizar URLs añadiendo https:// cuando sea necesario
    const normalizeUrl = (url: string): string => {
        if (!url || typeof url !== 'string') return '';

        // Limpiar espacios en blanco
        const cleanUrl = url.trim();

        if (!cleanUrl) return '';

        // Si ya tiene protocolo, devolverla tal como está
        if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
            return cleanUrl;
        }

        // Si es una URL de localhost o IP local, usar http
        if (cleanUrl.startsWith('localhost') ||
            cleanUrl.startsWith('127.0.0.1') ||
            cleanUrl.match(/^192\.168\.\d+\.\d+/) ||
            cleanUrl.match(/^10\.\d+\.\d+\.\d+/)) {
            return `http://${cleanUrl}`;
        }

        // Para todas las demás URLs, usar https por defecto
        return `https://${cleanUrl}`;
    };

    // Función para validar que una URL es válida
    const isValidUrl = (url: string): boolean => {
        try {
            const normalizedUrl = normalizeUrl(url);
            new URL(normalizedUrl);
            return true;
        } catch {
            return false;
        }
    };
    // ============================================================

    // Función de validación mejorada (igual que ImageUploadSection)
    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        // Verificar data URLs (base64)
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

    // Función de validación de archivos (igual que ImageUploadSection)
    const validateFile = (file: File): boolean => {
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

    // Función de manejo de upload mejorada
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log("=== HANDLE IMAGE UPLOAD DEBUG ===");
        const file = e.target.files?.[0];

        if (!file) {
            console.log("No file selected");
            return;
        }

        console.log("File selected:", {
            name: file.name,
            type: file.type,
            size: file.size,
            lastModified: file.lastModified
        });

        // Validar archivo
        if (!validateFile(file)) {
            e.target.value = ''; // Limpiar input
            return;
        }

        // Si estamos editando un enlace existente
        if (editingIndex !== null) {
            const linkToUpdate = activeLinks[editingIndex];
            console.log("Updating existing link:", linkToUpdate);

            if (linkToUpdate.id) {
                try {
                    setUploadingImage(true);
                    console.log("Uploading image for link ID:", linkToUpdate.id);

                    const loadingMessage = message.loading('Subiendo imagen del enlace...', 0);

                    // Subir imagen usando el endpoint específico
                    const imageUrl = await uploadLinkImage(file, linkToUpdate.id);
                    console.log("Image uploaded successfully:", imageUrl);

                    loadingMessage();

                    // Validar la URL de la imagen subida
                    if (!isValidImageUrl(imageUrl)) {
                        console.error("Uploaded image URL is invalid:", imageUrl);
                        throw new Error("La URL de la imagen subida no es válida");
                    }

                    // Actualizar el estado local para mostrar la imagen inmediatamente
                    setEditImage(imageUrl);

                    message.success('Imagen del enlace actualizada correctamente');
                    console.log("Image URL set in edit state:", imageUrl);

                } catch (error) {
                    console.error("Error uploading link image:", error);

                    // Mensaje de error más específico
                    let errorMessage = 'Error al subir la imagen del enlace';
                    if (error instanceof Error) {
                        errorMessage = error.message;
                    }
                    message.error(errorMessage);

                    // Fallback a base64 si falla la subida
                    console.log("Falling back to base64...");
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === "string") {
                            setEditImage(reader.result);
                            message.info('Imagen cargada localmente (se guardará al confirmar)');
                        }
                    };
                    reader.onerror = () => {
                        message.error('Error al procesar la imagen');
                    };
                    reader.readAsDataURL(file);
                } finally {
                    setUploadingImage(false);
                }
            } else {
                // Si no hay ID del enlace, usar base64 como fallback
                console.log("No link ID, using base64 fallback");
                const reader = new FileReader();
                reader.onload = () => {
                    if (typeof reader.result === "string") {
                        setEditImage(reader.result);
                        message.info('Imagen cargada localmente');
                    }
                };
                reader.onerror = () => {
                    message.error('Error al procesar la imagen');
                };
                reader.readAsDataURL(file);
            }
        } else {
            // Para nuevos enlaces, usar base64
            console.log("New link, using base64");
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setEditImage(reader.result);
                    message.info('Imagen cargada localmente');
                }
            };
            reader.onerror = () => {
                message.error('Error al procesar la imagen');
            };
            reader.readAsDataURL(file);
        }

        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = '';
    };

    useEffect(() => {
        console.log("Active links changed:", activeLinks);
        activeLinks.forEach((link, index) => {
            console.log(`Link ${index}:`, {
                id: link.id,
                title: link.title,
                image: editImage,
                imageValid: isValidImageUrl(link.image)
            });
        });
    }, [activeLinks]);

    const handleBackClick = () => {
        navigate('/sections');
    };

    const handleConfirmAdd = async () => {
        if (newUrl.trim()) {
            try {
                setIsSubmitting(true);

                // Normalizar la URL antes de guardar
                const normalizedUrl = normalizeUrl(newUrl);

                // Validar que la URL es correcta
                if (!isValidUrl(normalizedUrl)) {
                    message.error('Por favor ingresa una URL válida');
                    return;
                }

                const maxOrderIndex = Math.max(...activeLinks.map(link => link.orderIndex), -1);

                const newLink = {
                    title: newUrl,
                    url: normalizedUrl,
                    icon: undefined,
                    image: undefined,
                    orderIndex: maxOrderIndex + 1,
                    isActive: true
                };

                await addRegularLink(newLink);
                setNewUrl("");
                setAdding(false);
                console.log("Link added successfully with normalized URL:", normalizedUrl);
            } catch (error) {
                console.error("Error adding link:", error);
                message.error('Error al agregar el enlace');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleDelete = async (index: number) => {
        try {
            setIsSubmitting(true);
            const linkToDelete = activeLinks[index];
            await removeRegularLink(linkToDelete.id);
            console.log("Link deleted successfully");
        } catch (error) {
            console.error("Error deleting link:", error);
            message.error('Error al eliminar el enlace');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenEdit = (index: number) => {
        const link = activeLinks[index];
        setEditingIndex(index);
        setEditTitle(link.title);
        setEditUrl(link.url);
        setEditImage(link.image);
        console.log("Opening edit for link:", link);
    };

    const handleSaveEdit = async () => {
        if (editingIndex === null) return;

        try {
            setIsSubmitting(true);

            // Normalizar la URL antes de guardar
            const normalizedUrl = normalizeUrl(editUrl);

            // Validar que la URL es correcta
            if (!isValidUrl(normalizedUrl)) {
                message.error('Por favor ingresa una URL válida');
                return;
            }

            const linkToUpdate = activeLinks[editingIndex];

            const updateData = {
                title: editTitle,
                url: normalizedUrl, // Usar la URL normalizada
                image: editImage,
            };

            console.log("Datos que se van a enviar:", updateData);

            await updateRegularLink(linkToUpdate.id, updateData);

            console.log("Link updated successfully with normalized URL:", normalizedUrl);

            // IMPORTANT: Refresh the biosite data to get the updated links
            await refreshBiosite();

            // Clear edit state
            setEditingIndex(null);
            setEditTitle("");
            setEditUrl("");
            setEditImage(editImage);

            message.success('Enlace actualizado correctamente');

        } catch (error) {
            console.error("Error updating link:", error);
            message.error('Error al actualizar el enlace');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');

        setTimeout(() => {
            const target = e.target as HTMLElement;
            target.style.opacity = '0.5';
        }, 0);
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDragEnter = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;

        // Only clear drag over if we're actually leaving the element
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDragOverIndex(null);
        }
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        try {
            const items = Array.from(activeLinks);
            const [draggedItem] = items.splice(draggedIndex, 1);
            items.splice(dropIndex, 0, draggedItem);

            // Update order indexes
            const reorderedLinks = items.map((link, index) => ({
                ...link,
                orderIndex: index
            }));

            await reorderRegularLinks(reorderedLinks);
            console.log("Links reordered successfully");
        } catch (error) {
            console.error("Error reordering links:", error);
            message.error('Error al reordenar los enlaces');
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
        setEditTitle("");
        setEditUrl("");
        setEditImage(undefined);
    };

    const handleCancelAdd = () => {
        setAdding(false);
        setNewUrl("");
    };

    // Función para obtener imagen segura con fallback
    const getSafeImageUrl = (imageUrl: string | null | undefined): string => {
        return isValidImageUrl(imageUrl) ? imageUrl! : placeholderLinkImage;
    };

    console.log("Active links:", activeLinks);
    console.log("Current edit image:", editImage);

    if (loading && activeLinks.length === 0) {
        return (
            <div className="max-w-xl mx-auto p-4 text-white flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Cargando enlaces...</p>
                </div>
            </div>
        );
    }

    if (editingIndex !== null) {
        const linkToEdit = activeLinks[editingIndex];
        return (
            <LinkEditForm
                link={linkToEdit}
                editTitle={editTitle}
                editUrl={editUrl}
                editImage={editImage}
                isSubmitting={isSubmitting}
                onTitleChange={setEditTitle}
                onUrlChange={setEditUrl}
                onImageChange={setEditImage}
                onSave={handleSaveEdit}
                onCancel={handleCancelEdit}
            />
        );
    }

    return (
        <div className="w-full h-full mt-0  lg:mt-14 mb-10 max-w-md mx-auto rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 sr-only sm:not-sr-only">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-md font-bold text-gray-800  uppercase tracking-wide text-start hover:text-white">Links</h1>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Active Links Section */}
                    {activeLinks.length > 0 && (
                        <div>
                            <h3 className="text-sm text-gray-600 font-semibold mb-3">
                                Enlaces activos ({activeLinks.length})
                            </h3>
                            <div className="space-y-2">
                                {activeLinks.map((link, index) => (
                                    <div
                                        key={`${link.id}-${link.image}`} // Force re-render when image changes
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={handleDragOver}
                                        onDragEnter={(e) => handleDragEnter(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, index)}
                                        className={`
                                            flex items-center justify-between p-3 bg-[#FAFFF6] rounded-lg border border-gray-200
                                            cursor-move hover:bg-[#F0F9E8] transition-colors
                                            ${dragOverIndex === index ? 'border-blue-500 bg-blue-50' : ''}
                                            ${draggedIndex === index ? 'opacity-50' : ''}
                                        `}
                                    >
                                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                                            <GripVertical size={16} className="text-gray-400 flex-shrink-0" />

                                            {/* Imagen mejorada con manejo de errores */}
                                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                                <img
                                                    src={getSafeImageUrl(link.image)}
                                                    alt={link.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        console.warn('Link image failed to load:', link.image);
                                                        const img = e.target as HTMLImageElement;
                                                        if (img.src !== placeholderLinkImage) {
                                                            img.src = placeholderLinkImage;
                                                        }
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span className="text-sm font-medium text-black block truncate">
                                                    {link.title}
                                                </span>
                                                <p className="text-xs text-gray-400 truncate max-w-48">
                                                    {link.url}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleOpenEdit(index)}
                                                className="text-gray-400 cursor-pointer hover:text-blue-400 transition-colors p-1"
                                                disabled={isSubmitting}
                                            >
                                                <Edit2 className="w-4 h-4"/>
                                            </button>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(index);
                                                }}
                                                disabled={isSubmitting}
                                                className="text-gray-400 cursor-pointer hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="w-4 h-4"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Add New Link Section */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-3">
                            Agregar enlace
                        </h3>

                        {adding ? (
                            <div className="flex items-center space-x-2 p-3 bg-white rounded-lg border border-gray-300">
                                <input
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    placeholder="Ingresa una URL (ej: visitaecuador.com)"
                                    className="flex-1 bg-transparent text-black placeholder-gray-400 focus:outline-none"
                                    autoFocus
                                    disabled={isSubmitting}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleConfirmAdd();
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleConfirmAdd}
                                    disabled={!newUrl.trim() || isSubmitting}
                                    className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Check size={20} />
                                </button>
                                <button
                                    onClick={handleCancelAdd}
                                    disabled={isSubmitting}
                                    className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setAdding(true)}
                                disabled={isSubmitting}
                                className="w-full cursor-pointer p-4 border-2 border-dashed border-gray-300 bg-white rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                            >
                                <Plus size={20} className="mb-1" />
                                <span className="text-sm">Agregar enlace</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Hidden file input for image upload */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
                multiple={false}
            />
        </div>
    );
};

export default LinksPage;