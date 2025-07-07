import { useState, useRef, useEffect } from "react";
import {
    ChevronLeft,
    Plus,
    X,
    Check,
    GripVertical,
    ImagePlus,
    Edit2,
    ExternalLink,
    Link as LinkIcon,
} from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import { useNavigate } from "react-router-dom";
import { uploadLinkImage } from "../../MySite/Profile/lib/uploadImage.ts";

const LinksPage = () => {
    const {
        regularLinks,
        addRegularLink,
        removeRegularLink,
        updateRegularLink,
        reorderRegularLinks,
        loading,
        error
    } = usePreview();

    const [adding, setAdding] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editImage, setEditImage] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const navigate = useNavigate();

    // Filtrar solo los enlaces activos
    const activeLinks = regularLinks.filter(link => link.isActive);

    // Función mejorada para validar si una URL de imagen es válida
    const isValidImageUrl = (url: string | null | undefined): boolean => {
        if (!url || typeof url !== 'string') return false;

        // Verificar data URLs (base64)
        if (url.startsWith('data:')) {
            const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
            return dataUrlRegex.test(url);
        }

        // Verificar URLs HTTP/HTTPS - Mejorar la validación
        try {
            const urlObj = new URL(url);
            const isValidProtocol = ['http:', 'https:'].includes(urlObj.protocol);
            const hasValidExtension = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) ||
                url.includes('/img/') || // Para tu servidor
                url.includes('image-'); // Para archivos con formato image-*

            return isValidProtocol && (hasValidExtension || !urlObj.pathname.includes('.'));
        } catch {
            return false;
        }
    };

    // Componente mejorado para renderizar la imagen del enlace
    const LinkImage = ({ image, title, size = "small" }: {
        image?: string | null;
        title: string;
        size?: "small" | "medium" | "large"
    }) => {
        const sizeClasses = {
            small: "w-8 h-8",
            medium: "w-12 h-12",
            large: "w-16 h-16"
        };

        const iconSizes = {
            small: 16,
            medium: 20,
            large: 24
        };

        const [imageError, setImageError] = useState(false);
        const [isLoading, setIsLoading] = useState(true);

        // Reset error state when image changes
        useEffect(() => {
            if (image) {
                setImageError(false);
                setIsLoading(true);
            }
        }, [image]);

        const handleImageLoad = () => {
            console.log("Image loaded successfully:", image);
            setIsLoading(false);
            setImageError(false);
        };

        const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
            console.error("Error loading image:", image, e);
            setIsLoading(false);
            setImageError(true);
        };

        console.log("LinkImage render:", {
            image,
            imageError,
            isLoading,
            isValid: isValidImageUrl(image)
        });

        if (!image || !isValidImageUrl(image) || imageError) {
            return (
                <div className={`${sizeClasses[size]} rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center flex-shrink-0 border border-blue-200`}>
                    <LinkIcon
                        size={iconSizes[size]}
                        className="text-blue-600"
                    />
                </div>
            );
        }

        return (
            <div className={`${sizeClasses[size]} rounded-lg overflow-hidden flex-shrink-0 relative`}>
                {isLoading && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                        <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
                    </div>
                )}
                <img
                    src={image}
                    alt={title}
                    className={`w-full h-full object-cover rounded-lg transition-opacity duration-200 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    crossOrigin="anonymous" // Agregar para evitar problemas CORS
                />
            </div>
        );
    };

    // Debug: Log changes in active links
    useEffect(() => {
        console.log("Active links changed:", activeLinks);
        activeLinks.forEach((link, index) => {
            console.log(`Link ${index}:`, {
                id: link.id,
                title: link.title,
                image: link.image,
                imageValid: isValidImageUrl(link.image)
            });
        });
    }, [activeLinks]);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleConfirmAdd = async () => {
        if (newUrl.trim()) {
            try {
                setIsSubmitting(true);

                // Calcular el siguiente orderIndex basado en enlaces activos
                const maxOrderIndex = Math.max(...activeLinks.map(link => link.orderIndex), -1);

                const newLink = {
                    title: newUrl,
                    url: newUrl,
                    image: undefined,
                    orderIndex: maxOrderIndex + 1,
                    isActive: true
                };

                await addRegularLink(newLink);
                setNewUrl("");
                setAdding(false);
                console.log("Link added successfully");
            } catch (error) {
                console.error("Error adding link:", error);
                alert('Error al agregar el enlace');
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
            alert('Error al eliminar el enlace');
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
            const linkToUpdate = activeLinks[editingIndex];

            const updateData = {
                title: editTitle,
                url: editUrl,
                image: editImage,
            };

            console.log("Datos que se van a enviar:", updateData);

            await updateRegularLink(linkToUpdate.id, updateData);

            console.log("Link updated successfully");

            // Esperar un poco para que el contexto se actualice
            await new Promise(resolve => setTimeout(resolve, 500));

            // Ahora sí limpiar los estados
            setEditingIndex(null);
            setEditTitle("");
            setEditUrl("");
            setEditImage(undefined);

        } catch (error) {
            console.error("Error updating link:", error);
            alert('Error al actualizar el enlace');
        } finally {
            setIsSubmitting(false);
        }
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

        // Si estamos editando un enlace existente
        if (editingIndex !== null) {
            const linkToUpdate = activeLinks[editingIndex];

            if (linkToUpdate.id) {
                try {
                    setUploadingImage(true);
                    console.log("Uploading image for link ID:", linkToUpdate.id);

                    // Subir imagen usando el endpoint específico
                    const imageUrl = await uploadLinkImage(file, linkToUpdate.id);
                    console.log("Image uploaded successfully:", imageUrl);

                    // Actualizar el estado local para mostrar la imagen inmediatamente
                    setEditImage(imageUrl);

                    console.log("Image URL set in edit state:", imageUrl);

                } catch (error) {
                    console.error("Error uploading link image:", error);
                    alert('Error al subir la imagen al servidor');

                    // Fallback a base64 si falla la subida
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (typeof reader.result === "string") {
                            setEditImage(reader.result);
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
                        setEditImage(reader.result);
                    }
                };
                reader.readAsDataURL(file);
            }
        } else {
            // Para nuevos enlaces, usar base64
            const reader = new FileReader();
            reader.onload = () => {
                if (typeof reader.result === "string") {
                    setEditImage(reader.result);
                }
            };
            reader.readAsDataURL(file);
        }

        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        e.target.value = '';
    };

    // HTML5 Drag and Drop handlers
    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', '');

        // Add a slight delay to show drag feedback
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
            alert('Error al reordenar los enlaces');
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

    // Debug logs
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

    return (
        <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
            {/* Header */}
            {editingIndex === null ? (
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1 text-black hover:text-gray-400"/>
                            <h1 className="text-lg text-black font-semibold hover:text-gray-400" style={{fontSize:"17px"}}>Links</h1>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <button
                        onClick={handleCancelEdit}
                        className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <ChevronLeft className="w-5 h-5 mr-1 text-black"/>
                        <h1 className="text-lg text-black font-semibold">Editar Link</h1>
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className="p-4">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}


                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-2 bg-gray-800 rounded">
                        <p className="text-xs text-gray-400">Debug Info:</p>
                        <p className="text-xs text-white">Active Links: {activeLinks.length}</p>
                        <p className="text-xs text-white">Edit Image: {editImage || 'undefined'}</p>
                    </div>
                )}

                {/* Edit mode */}
                {editingIndex !== null ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm mb-1 text-gray-600">NOMBRE</p>
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-3 rounded-lg bg-[#FAFFF6] text-black focus:outline-none focus:border-blue-500"
                                placeholder="Nombre del enlace"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <p className="text-sm mb-1 text-gray-600">URL</p>
                            <input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
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
                                            onClick={() => setEditImage(undefined)}
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
                                onClick={handleSaveEdit}
                                disabled={isSubmitting || !editTitle.trim() || !editUrl.trim() || uploadingImage}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting ? "Guardando..." : "Guardar cambios"}
                            </button>
                            <button
                                onClick={handleCancelEdit}
                                disabled={isSubmitting || uploadingImage}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                ) : (
                    // Main links view
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
                                            key={link.id}
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

                                                <LinkImage
                                                    image={link.image}
                                                    title={link.title}
                                                    size="small"
                                                />

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
                                                    className="text-gray-400 hover:text-blue-400 transition-colors p-1"
                                                    disabled={isSubmitting}
                                                >
                                                    <Edit2 className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={() => window.open(link.url, '_blank')}
                                                    className="text-gray-400 hover:text-green-400 transition-colors p-1"
                                                >
                                                    <ExternalLink className="w-4 h-4"/>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(index);
                                                    }}
                                                    disabled={isSubmitting}
                                                    className="text-gray-400 hover:text-red-400 transition-colors p-1 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                        placeholder="Ingresa una URL"
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
                                    className="w-full p-4 border-2 border-dashed border-gray-300 bg-white rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center"
                                >
                                    <Plus size={20} className="mb-1" />
                                    <span className="text-sm">Agregar enlace</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LinksPage;