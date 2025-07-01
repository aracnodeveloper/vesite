import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
    // Globe,
    HelpCircle,
    FileText,
    Shield,
    Plus,
    Check,
    Loader2,
    AlertCircle, LogOut
} from "lucide-react";
import imgP from "../../../assets/img/img.png";
import { usePreview } from "../../../context/PreviewContext.tsx";
import apiService from "../../../service/apiService";
import {getBiositeApi, updateBiositeApi} from "../../../constants/EndpointsRoutes";
import type { BiositeFull, BiositeColors } from "../../../interfaces/Biosite";
import Cookies from "js-cookie";

interface Profile {
    id: string;
    name: string;
    slug: string;
    avatar?: string;
    isActive?: boolean;
}

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    profiles?: Profile[];
    currentProfile?: Profile;
    onProfileSelect?: (profile: Profile) => void;
    onCreateNewSite?: () => void;
}

interface CreateBiositeData {
    title: string;
    slug: string;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
                                                         isOpen,
                                                         onClose,
                                                         onLogout,
                                                         onProfileSelect,
                                                         onCreateNewSite
                                                     }) => {
    const { biosite } = usePreview();
    const [avatarError, setAvatarError] = useState(false);
    const [biosites, setBiosites] = useState<BiositeFull[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState<CreateBiositeData>({
        title: '',
        slug: ''
    });

    const userId = Cookies.get('userId');


    const fetchUserBiosites = async () => {
        if (!userId) return;

        try {
            setLoading(true);
            setError(null);

            // Using the findAllByAdminId endpoint
            const response = await apiService.getById<BiositeFull[]>(`${getBiositeApi}`, userId);
            setBiosites(Array.isArray(response) ? response : [response]);
        } catch (err: any) {
            console.error('Error fetching biosites:', err);
            setError(err?.response?.data?.message || 'Error al cargar los biosites');
        } finally {
            setLoading(false);
        }
    };

    const isValidUUID = (uuid: string): boolean => {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

// Updated createNewBiosite function with UUID validation and debugging
    const createNewBiosite = async () => {
        if (!userId || !createForm.title.trim() || !createForm.slug.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            setIsCreating(true);
            setError(null);

            // ✅ Debug: Log the userId and validate it
            console.log("=== UUID DEBUGGING ===");
            console.log("Raw userId from cookie:", userId);
            console.log("UserId type:", typeof userId);
            console.log("UserId length:", userId?.length);
            console.log("Is valid UUID:", isValidUUID(userId));

            // ✅ Validate UUID format before proceeding
            if (!isValidUUID(userId)) {
                console.error("Invalid UUID format detected:", userId);
                setError('ID de usuario no válido. Por favor, inicie sesión nuevamente.');
                return;
            }

            const defaultColors: BiositeColors = {
                primary: '#3B82F6',
                secondary: '#1E40AF',
                background: '#FFFFFF',
                text: '#000000',
                accent: '#3B82F6',
                profileBackground: '#F3F4F6'
            };

            const createData = {
                ownerId: userId,
                title: createForm.title.trim(),
                slug: createForm.slug.trim(),
                themeId: null,
                colors: JSON.stringify(defaultColors),
                fonts: 'Inter',
                isActive: true
            };

            console.log("=== CREATE DATA ===");
            console.log("Full create data:", createData);
            console.log("OwnerId specifically:", createData.ownerId);

            const newBiosite = await apiService.create<typeof createData, BiositeFull>(
                updateBiositeApi,
                createData
            );

            // Add to local state
            setBiosites(prev => [...prev, newBiosite]);

            // Reset form
            setCreateForm({ title: '', slug: '' });
            setShowCreateForm(false);

            // Call the external callback if provided
            if (onCreateNewSite) {
                onCreateNewSite();
            }

            // Auto-select the new biosite if callback provided
            if (onProfileSelect) {
                const profile: Profile = {
                    id: newBiosite.id,
                    name: newBiosite.title,
                    slug: `bio.site/${newBiosite.slug}`,
                    isActive: true
                };
                onProfileSelect(profile);
            }

        } catch (err: any) {
            console.error('=== CREATE BIOSITE ERROR ===');
            console.error('Full error object:', err);
            console.error('Error response:', err?.response?.data);

            let errorMessage = 'Error al crear el biosite';

            // Handle specific UUID errors
            if (err?.response?.data?.details?.code === 'P2023') {
                errorMessage = 'Error de formato de ID. Por favor, inicie sesión nuevamente.';
            } else if (err?.response?.data?.details) {
                errorMessage = `Error de validación: ${err.response.data.details.join(', ')}`;
            } else if (err?.response?.data?.message) {
                errorMessage = err.response.data.message;
            }

            setError(errorMessage);
        } finally {
            setIsCreating(false);
        }
    };

    // Load biosites when modal opens
    useEffect(() => {
        if (isOpen && userId) {
            fetchUserBiosites();
        }
    }, [isOpen, userId]);

    // Handle profile selection
    const handleProfileClick = (biositeData: BiositeFull) => {
        if (onProfileSelect) {
            const profile: Profile = {
                id: biositeData.id,
                name: biositeData.title,
                slug: `bio.site/${biositeData.slug}`,
                isActive: biositeData.id === biosite?.id
            };
            onProfileSelect(profile);
        }
        onClose();
    };

    // Handle create new site button
    const handleCreateNewSite = () => {
        setShowCreateForm(true);
        setError(null);
    };

    // Generate slug from title
    const handleTitleChange = (title: string) => {
        setCreateForm(prev => ({
            ...prev,
            title,
            slug: title.toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .trim()
        }));
    };

    const getAvatarImage = () => {
        if (avatarError || !biosite?.avatarImage) {
            return imgP;
        }

        if (typeof biosite.avatarImage === 'string' && biosite.avatarImage.trim()) {
            if (biosite.avatarImage.startsWith('data:')) {
                const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
                return dataUrlRegex.test(biosite.avatarImage) ? biosite.avatarImage : imgP;
            }

            try {
                new URL(biosite.avatarImage);
                return biosite.avatarImage;
            } catch {
                return imgP;
            }
        }

        return imgP;
    };

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 min-h-screen z-50 flex p-2 items-center justify-start bg-black/50"
        >
            <Dialog.Panel className="bg-[#FAFFF6] min-h-screen rounded-lg w-[320px] text-gray-600 shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#E0EED5]">
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                    >
                        CANCEL
                    </button>
                    <Dialog.Title className="text-black font-medium">
                        Settings
                    </Dialog.Title>
                    <div className="w-16"></div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400">
                        <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <div className="p-4 bg-gray-50 border-b border-[#E0EED5]">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Crear Nuevo Biosite</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Título</label>
                                <input
                                    type="text"
                                    value={createForm.title}
                                    onChange={(e) => handleTitleChange(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Mi Biosite"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Slug (URL)</label>
                                <input
                                    type="text"
                                    value={createForm.slug}
                                    onChange={(e) => setCreateForm(prev => ({ ...prev, slug: e.target.value }))}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="mi-biosite"
                                />
                                <p className="text-xs text-gray-400 mt-1">bio.site/{createForm.slug}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={createNewBiosite}
                                    disabled={isCreating || !createForm.title.trim() || !createForm.slug.trim()}
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isCreating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        'Crear'
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        setCreateForm({ title: '', slug: '' });
                                        setError(null);
                                    }}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Biosites Section */}
                <div className="p-4 space-y-3">
                    {loading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Cargando biosites...</span>
                        </div>
                    ) : (
                        <>
                            {biosites.map((biositeData) => (
                                <div
                                    key={biositeData.id}
                                    onClick={() => handleProfileClick(biositeData)}
                                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer group"
                                >
                                    <div className="relative">
                                        <img
                                            src={getAvatarImage()}
                                            alt={biositeData.title}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-600 text-sm">
                                            {biositeData.title}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            bio.site/{biositeData.slug}
                                        </div>
                                    </div>
                                    {biositeData.id === biosite?.id && (
                                        <Check size={16} className="text-green-500" />
                                    )}
                                </div>
                            ))}

                            {/* Create New Site Button */}
                            <div
                                onClick={handleCreateNewSite}
                                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 hover:text-white cursor-pointer group"
                            >
                                <div className="w-10 h-10 border border-gray-600 rounded-full flex items-center justify-center group-hover:border-white">
                                    <Plus size={16} className="text-black group-hover:text-white" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-medium text-black group-hover:text-white text-sm">
                                        Create New Site
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Settings Options */}
                <div className="border-t border-[#E0EED5]">
                    <div className="p-4 space-y-4">


                        {/* Support */}
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                            <HelpCircle size={20} className="text-gray-400" />
                            <span className="text-gray-600 text-sm">Support</span>
                        </div>

                        {/* Terms of Use */}
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                            <FileText size={20} className="text-gray-400" />
                            <span className="text-gray-600 text-sm">Terms of Use</span>
                        </div>

                        {/* Privacy Policy */}
                        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer">
                            <Shield size={20} className="text-gray-400" />
                            <span className="text-gray-600 text-sm">Privacy Policy</span>
                        </div>

                        {/* Log Out */}
                        <div
                            onClick={onLogout}
                            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                            <LogOut size={20} className="text-gray-400 hover:text-red-500" />
                            <span className="text-red-600 text-sm font-medium">Log Out</span>
                        </div>
                    </div>
                </div>
            </Dialog.Panel>
        </Dialog>
    );
};

export default SettingsModal;