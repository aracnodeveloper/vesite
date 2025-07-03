import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import {
    HelpCircle,
    FileText,
    Shield,
    Plus,
    Check,
    Loader2,
    AlertCircle,
    LogOut
} from "lucide-react";
import imgP from "../../../assets/img/img.png";
import { usePreview } from "../../../context/PreviewContext.tsx";
import type { BiositeFull } from "../../../interfaces/Biosite";

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
    const {
        biosite,
        loading: contextLoading,
        error: contextError,
        createNewBiosite,
        getUserBiosites,
        switchToAnotherBiosite,
        clearError
    } = usePreview();

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

    // Fetch user biosites using the context method
    const fetchUserBiosites = async () => {
        try {
            setLoading(true);
            setError(null);
            clearError(); // Clear any previous context errors

            const userBiosites = await getUserBiosites();
            setBiosites(userBiosites);
        } catch (err: any) {
            console.error('Error fetching biosites:', err);
            setError(err?.message || 'Error al cargar los biosites');
        } finally {
            setLoading(false);
        }
    };

    // Create new biosite using context method
    const handleCreateNewBiosite = async () => {
        if (!createForm.title.trim() || !createForm.slug.trim()) {
            setError('Todos los campos son obligatorios');
            return;
        }

        try {
            setIsCreating(true);
            setError(null);
            clearError();

            // Get userId from cookies
            const userId = document.cookie
                .split('; ')
                .find(row => row.startsWith('userId='))
                ?.split('=')[1];

            if (!userId) {
                setError('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
                return;
            }

            const createData = {
                ownerId: userId,
                title: createForm.title.trim(),
                slug: createForm.slug.trim(),
                themeId: 'default',
                colors: JSON.stringify({
                    primary: '#3B82F6',
                    secondary: '#1E40AF',
                    background: '#FFFFFF',
                    text: '#000000',
                    accent: '#3B82F6',
                    profileBackground: '#F3F4F6'
                }),
                fonts: 'Inter',
                isActive: true
            };

            const newBiosite = await createNewBiosite(createData);

            if (newBiosite) {
                // Add to local state
                setBiosites(prev => [...prev, newBiosite]);

                // Reset form
                setCreateForm({ title: '', slug: '' });
                setShowCreateForm(false);

                // Call external callback if provided
                if (onCreateNewSite) {
                    onCreateNewSite();
                }

                // Auto-select the new biosite
                await handleProfileSwitch(newBiosite);
            }

        } catch (err: any) {
            console.error('Error creating biosite:', err);
            setError(err?.message || 'Error al crear el biosite');
        } finally {
            setIsCreating(false);
        }
    };

    // Handle profile switching using context method
    const handleProfileSwitch = async (biositeData: BiositeFull) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            const switchedBiosite = await switchToAnotherBiosite(biositeData.id);

            if (switchedBiosite && onProfileSelect) {
                const profile: Profile = {
                    id: switchedBiosite.id,
                    name: switchedBiosite.title,
                    slug: `bio.site/${switchedBiosite.slug}`,
                    isActive: true
                };
                onProfileSelect(profile);
            }

            onClose();
        } catch (err: any) {
            console.error('Error switching biosite:', err);
            setError(err?.message || 'Error al cambiar de biosite');
        } finally {
            setLoading(false);
        }
    };

    // Load biosites when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchUserBiosites();
        }
    }, [isOpen]);

    // Update error state from context
    useEffect(() => {
        if (contextError) {
            setError(contextError);
        }
    }, [contextError]);

    // Handle create new site button
    const handleCreateNewSite = () => {
        setShowCreateForm(true);
        setError(null);
        clearError();
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

    const getAvatarImage = (biositeData?: BiositeFull) => {

        const targetBiosite = biositeData || biosite;

        if (avatarError || !targetBiosite?.avatarImage) {
            return imgP;
        }

        if (typeof targetBiosite.avatarImage === 'string' && targetBiosite.avatarImage.trim()) {
            if (targetBiosite.avatarImage.startsWith('data:')) {
                const dataUrlRegex = /^data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/]+=*$/;
                return dataUrlRegex.test(targetBiosite.avatarImage) ? targetBiosite.avatarImage : imgP;
            }

            try {
                new URL(targetBiosite.avatarImage);
                return targetBiosite.avatarImage;
            } catch {
                return imgP;
            }
        }

        return imgP;
    };

    const isLoadingState = loading || contextLoading || isCreating;

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
                                    disabled={isLoadingState}
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
                                    disabled={isLoadingState}
                                />
                                <p className="text-xs text-gray-400 mt-1">bio.site/{createForm.slug}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCreateNewBiosite}
                                    disabled={isLoadingState || !createForm.title.trim() || !createForm.slug.trim()}
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
                                        clearError();
                                    }}
                                    disabled={isLoadingState}
                                    className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
                                    onClick={() => !isLoadingState && handleProfileSwitch(biositeData)}
                                    className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-200 cursor-pointer group ${
                                        isLoadingState ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    <div className="relative">
                                        <img
                                            src={getAvatarImage(biositeData)}
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
                                onClick={() => !isLoadingState && handleCreateNewSite()}
                                className={`flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-700 hover:text-white cursor-pointer group ${
                                    isLoadingState ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
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