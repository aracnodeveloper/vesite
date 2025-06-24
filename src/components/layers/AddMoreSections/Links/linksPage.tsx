import { useState, useRef } from "react";
import {
    ChevronLeft,
    Plus,
    X,
    Check,
    GripVertical,
    ImagePlus,
} from "lucide-react";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import { useNavigate } from "react-router-dom";

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

    // Drag and drop state
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const navigate = useNavigate();

    // Filtrar solo los enlaces activos
    const activeLinks = regularLinks.filter(link => link.isActive);

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
    };

    const handleSaveEdit = async () => {
        if (editingIndex === null) return;

        try {
            setIsSubmitting(true);
            const linkToUpdate = activeLinks[editingIndex];

            await updateRegularLink(linkToUpdate.id, {
                title: editTitle,
                url: editUrl,
            });

            setEditingIndex(null);
            console.log("Link updated successfully");
        } catch (error) {
            console.error("Error updating link:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setEditImage(reader.result);
            }
        };
        reader.readAsDataURL(file);
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
        } finally {
            setDraggedIndex(null);
            setDragOverIndex(null);
        }
    };

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
        <div className="max-w-xl mx-auto p-4 text-white">
            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-500 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* Header */}
            {editingIndex === null ? (
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <ChevronLeft size={16} className="mr-2" />
                        Links
                    </button>
                </div>
            ) : (
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => setEditingIndex(null)}
                        className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                        disabled={isSubmitting}
                    >
                        <ChevronLeft size={16} className="mr-2" />
                        Link details
                    </button>
                </div>
            )}

            {/* Edit mode */}
            {editingIndex !== null ? (
                <div className="space-y-4">
                    <div>
                        <p className="text-sm mb-1 text-gray-300">NAME</p>
                        <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nombre del enlace"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <p className="text-sm mb-1 text-gray-300">URL</p>
                        <input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://ejemplo.com"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <p className="text-sm mb-1 text-gray-300">IMAGE (opcional)</p>
                        <div className="flex items-center space-x-2">
                            {editImage ? (
                                <div className="relative">
                                    <img
                                        src={editImage}
                                        alt="Preview"
                                        className="w-16 h-16 rounded-lg object-cover"
                                    />
                                    <button
                                        onClick={() => setEditImage(undefined)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                                        disabled={isSubmitting}
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center hover:border-gray-500 transition-colors"
                                    disabled={isSubmitting}
                                >
                                    <ImagePlus size={24} className="text-gray-400" />
                                </button>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button
                            onClick={handleSaveEdit}
                            disabled={isSubmitting || !editTitle.trim() || !editUrl.trim()}
                            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </button>
                        <button
                            onClick={() => setEditingIndex(null)}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 disabled:opacity-50 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                // Main links view
                <div className="space-y-4">
                    {/* Add new link */}
                    {adding ? (
                        <div className="flex items-center space-x-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                            <input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="Ingresa una URL"
                                className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none"
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
                                className="p-2 text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    setAdding(false);
                                    setNewUrl("");
                                }}
                                disabled={isSubmitting}
                                className="p-2 text-red-400 hover:text-red-300 disabled:opacity-50"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAdding(true)}
                            disabled={isSubmitting}
                            className="w-full p-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={20} className="mx-auto mb-1" />
                            <span className="text-sm">Agregar enlace</span>
                        </button>
                    )}

                    {/* Links list */}
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
                                    flex items-center p-3 bg-gray-800 rounded-lg border border-gray-700 
                                    cursor-move hover:bg-gray-750 transition-colors
                                    ${dragOverIndex === index ? 'border-blue-500 bg-blue-900/20' : ''}
                                    ${draggedIndex === index ? 'opacity-50' : ''}
                                `}
                            >
                                <GripVertical size={16} className="text-gray-500 mr-3 flex-shrink-0" />

                                <div className="flex-1 min-w-0" onClick={() => handleOpenEdit(index)}>
                                    <div className="flex items-center space-x-3">
                                        {link.image ? (
                                            <img
                                                src={link.image}
                                                alt=""
                                                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <span className="text-xs text-gray-400">🔗</span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-medium truncate">{link.title}</p>
                                            <p className="text-gray-400 text-sm truncate">{link.url}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(index);
                                    }}
                                    disabled={isSubmitting}
                                    className="p-2 text-red-400 hover:text-red-300 ml-2 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ))}
                    </div>


                </div>
            )}
        </div>
    );
};

export default LinksPage;