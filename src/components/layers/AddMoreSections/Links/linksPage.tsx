import { useState, useRef } from "react";
import {
    ChevronLeft,
    Plus,
    X,
    Check,
    GripVertical,
    ImagePlus,
    Edit2,
    ExternalLink,
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
        <div className="w-full max-w-md mx-auto rounded-lg overflow-hidden">
            {/* Header */}
            {editingIndex === null ? (
                <div className="p-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1 text-black"/>
                            <h1 className="text-lg text-black font-semibold">Links</h1>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-4">
                    <button
                        onClick={() => setEditingIndex(null)}
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

                {/* Edit mode */}
                {editingIndex !== null ? (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm mb-1 text-gray-300">NOMBRE</p>
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Nombre del enlace"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <p className="text-sm mb-1 text-gray-300">URL</p>
                            <input
                                value={editUrl}
                                onChange={(e) => setEditUrl(e.target.value)}
                                className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-600 text-white focus:outline-none focus:border-blue-500"
                                placeholder="https://ejemplo.com"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <p className="text-sm mb-1 text-gray-300">IMAGEN (opcional)</p>
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
                                <h3 className="text-sm text-black font-semibold mb-3">
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

                                                {link.image ? (
                                                    <img
                                                        src={link.image}
                                                        alt=""
                                                        className="w-8 h-8 rounded-lg object-cover flex-shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-xs text-gray-500">🔗</span>
                                                    </div>
                                                )}

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
                            <h3 className="text-sm font-semibold text-black mb-3">
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
                                        className="p-2 text-green-500 hover:text-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Check size={20} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAdding(false);
                                            setNewUrl("");
                                        }}
                                        disabled={isSubmitting}
                                        className="p-2 text-red-500 hover:text-red-600 disabled:opacity-50"
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
