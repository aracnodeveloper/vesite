import { useState, useRef } from "react";
import {
    ChevronLeft,
    Plus,
    X,
    Check,
    GripVertical,
    ImagePlus,
} from "lucide-react";
import {usePreview} from "../../../../context/PreviewContext.tsx";
import {useNavigate} from "react-router-dom";

{/*
    interface Link {
        title: string;
        url: string;
        image?: string;
    }
*/}

const LinksPage = () => {
    const { links, setLinks } = usePreview();

    const [adding, setAdding] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editImage, setEditImage] = useState<string | undefined>(undefined);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleConfirmAdd = () => {
        if (newUrl.trim()) {
            setLinks((prev) => [
                ...prev,
                { title: newUrl, url: newUrl, image: undefined },
            ]);
            setNewUrl("");
            setAdding(false);
        }
    };

    const handleDelete = (index: number) => {
        setLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const handleOpenEdit = (index: number) => {
        const link = links[index];
        setEditingIndex(index);
        setEditTitle(link.title);
        setEditUrl(link.url);
        setEditImage(link.image);
    };

    const handleSaveEdit = () => {
        if (editingIndex === null) return;
        const updated = [...links];
        updated[editingIndex] = {
            title: editTitle,
            url: editUrl,
            image: editImage,
        };
        setLinks(updated);
        setEditingIndex(null);
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
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // Regresa a la página anterior
        // si quieres ir específicamente al dashboard: navigate('/sections');
    };


    return (
        <div className="max-w-xl mx-auto p-4 text-white">
            {/* Header */}
            {editingIndex === null ? (
                <div className="flex items-center mb-6">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer">
                        <ChevronLeft size={16} className="mr-2" />
                        Links
                    </button>
                </div>
            ) : (
                <div className="flex items-center mb-6">
                    <button
                        onClick={() => setEditingIndex(null)}
                        className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
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
                        <p className="text-sm mb-1">NAME</p>
                        <input
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="bg-[#1a1a1a] w-full p-3 rounded-md text-white placeholder-gray-400"
                            placeholder="Title"
                        />
                    </div>
                    <div>
                        <p className="text-sm mb-1">URL</p>
                        <input
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="bg-[#1a1a1a] w-full p-3 rounded-md text-white placeholder-gray-400"
                            placeholder="URL"
                        />
                    </div>
                    <div>
                        <p className="text-sm mb-2">IMAGE OR THUMBNAIL</p>
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#1a1a1a] rounded-md h-32 flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                        >
                            {editImage ? (
                                <img
                                    src={editImage}
                                    alt="thumb"
                                    className="w-full h-full object-cover rounded-md"
                                />
                            ) : (
                                <>
                                    <ImagePlus className="mb-1" />
                                    <span>ADD IMAGE</span>
                                    <span className="text-xs">10 MB MAX</span>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageUpload}
                                hidden
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleSaveEdit}
                        className="w-full bg-green-600 p-3 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            ) : (
                <>
                    {/* List of existing links */}
                    <div className="space-y-4 mb-6">
                        {links.map((link, index) => (
                            <div
                                key={index}
                                className="relative group bg-[#2a2a2a] rounded-lg px-4 py-3 flex justify-between items-center cursor-pointer"
                                onClick={() => handleOpenEdit(index)}
                            >
                                <div className="flex items-center space-x-3">
                                    {link.image ? (
                                        <img
                                            src={link.image}
                                            alt="thumb"
                                            className="w-10 h-10 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-10 h-10 bg-[#444] flex items-center justify-center rounded-md">
                                            🔗
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-medium text-white text-sm">
                                            {link.title}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">
                                            {link.url}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover actions */}
                                <div className="absolute left-[-12px] top-[50%] -translate-y-1/2 hidden group-hover:flex">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(index);
                                        }}
                                        className="bg-gray-700 hover:bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>

                                <div className="hidden group-hover:flex text-gray-400">
                                    <GripVertical size={16} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add new link flow */}
                    {adding ? (
                        <div className="bg-[#2a2a2a] rounded-lg p-2 flex items-center justify-between">
                            <input
                                type="url"
                                placeholder="Add Link URL"
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                className="bg-transparent outline-none text-white placeholder-gray-400 px-2 w-full"
                            />
                            <div className="flex items-center gap-2 pr-2">
                                <button onClick={handleConfirmAdd} className="text-green-500">
                                    <Check size={18} />
                                </button>
                                <button onClick={() => setAdding(false)} className="text-white">
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setAdding(true)}
                            className="bg-[#2a2a2a] rounded-lg p-4 w-full flex justify-between items-center text-white  hover:bg-[#3a3a3a]"
                        >
                            <span className="font-medium">ADD LINKS</span>
                            <Plus size={16} />
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default LinksPage;
