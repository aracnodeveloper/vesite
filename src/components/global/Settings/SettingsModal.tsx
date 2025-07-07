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
    LogOut,
    Users,
    ChevronDown,
    ChevronRight
} from "lucide-react";
import imgP from "../../../assets/img/img.png";
import { usePreview } from "../../../context/PreviewContext.tsx";
import { useUser } from "../../../hooks/useUser.ts";
import { useFetchBiosite } from "../../../hooks/useFetchBiosite.ts";
import type { BiositeFull } from "../../../interfaces/Biosite";
import Cookies from "js-cookie";

interface Profile {
    id: string;
    userId:string;
    name: string;
    slug: string;
    avatar?: string;
    isActive?: boolean;
    isOwn?: boolean;
    isChild?: boolean;
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

interface BiositeStructure {
    ownBiosites: BiositeFull[];
    childBiosites: BiositeFull[];
    allBiosites: BiositeFull[];
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
      //  getChildBiosites,
        createBiosite,
        switchToAnotherBiosite,
        clearError
    } = usePreview();

    const { user, fetchUser } = useUser();
const role = Cookies.get("roleName")
    const {
        fetchCompleteBiositeStructure,
       // fetchChildBiosites,
        fetchAdminBiosites,
        loading: biositeLoading,
        error: biositeError
    } = useFetchBiosite();

    const [avatarError, setAvatarError] = useState(false);
    const [biositeStructure, setBiositeStructure] = useState<BiositeStructure>({
        ownBiosites: [],
        childBiosites: [],
        allBiosites: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [createForm, setCreateForm] = useState<CreateBiositeData>({
        title: '',
        slug: '',
    });
    const [showChildBiosites, setShowChildBiosites] = useState(true);

    const getCurrentUserId = () => {
        const userId = document.cookie
            .split('; ')
            .find(row => row.startsWith('userId='))
            ?.split('=')[1];
        return userId;
    };

    const canCreateBiosites = () => {
        if (!user) return false;
        return role === 'ADMIN' || role === 'SUPER_ADMIN';
    };

    const canSeeChildBiosites = () => {
        if (!user) return false;
        return role === 'ADMIN' || role === 'SUPER_ADMIN';
    };

    useEffect(() => {
        if (isOpen) {
            const userId = getCurrentUserId();
            if (userId) {
                fetchUser(userId);
                fetchBiositeStructure(userId);
            }
        }
    }, [isOpen]);

    const fetchBiositeStructure = async (userId: string) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            if (canSeeChildBiosites()) {

                const structure = await fetchCompleteBiositeStructure(userId);
                setBiositeStructure(structure);
            } else {

                const ownBiosites = await fetchAdminBiosites(userId);
                setBiositeStructure({
                    ownBiosites,
                    childBiosites: [],
                    allBiosites: ownBiosites
                });
            }
        } catch (err: any) {
            console.error('Error fetching biosite structure:', err);
            setError(err?.message || 'Error al cargar la estructura de biosites');
        } finally {
            setLoading(false);
        }
    };

    // Create new biosite using the updated hook
    const handleCreateNewBiosite = async () => {
        if (!canCreateBiosites()) {
            setError('No tienes permisos para crear nuevos biosites. Solo usuarios ADMIN y SUPER_ADMIN pueden crear biosites.');
            return;
        }




        const currentUserId = getCurrentUserId();
        if (!currentUserId) {
            setError('Usuario no autenticado. Por favor, inicie sesión nuevamente.');
            return;
        }

        try {
            setIsCreating(true);
            setError(null);
            clearError();

            const createData = {
                ownerId: biosite?.ownerId,
                title: createForm.title.trim() ,
                slug: createForm.slug.trim(),


            };
            const newBiosite = await createBiosite(createData);


            if (newBiosite) {
                console.log('Biosite and user created successfully:', newBiosite);

                // Refresh the biosite structure
                await fetchBiositeStructure(currentUserId);

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
            console.error('Error creating biosite and user:', err);
            setError(err?.message || 'Error al crear el biosite y usuario');
        } finally {
            setIsCreating(false);
        }
    };

    // Handle profile switching
    const handleProfileSwitch = async (biositeData: BiositeFull) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            const switchedBiosite = await switchToAnotherBiosite(biositeData.id, );

            if (switchedBiosite && onProfileSelect) {
                const profile: Profile = {
                    id: switchedBiosite.id,
                    userId: switchedBiosite.ownerId,
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

    // Update error state from context
    useEffect(() => {
        if (contextError) {
            setError(contextError);
        }
        if (biositeError) {
            setError(biositeError);
        }
    }, [contextError, biositeError]);


    const handleCreateNewSite = () => {
        if (!canCreateBiosites()) {
            setError('No tienes permisos para crear nuevos biosites. Solo usuarios ADMIN y SUPER_ADMIN pueden crear biosites.');
            return;
        }
        setShowCreateForm(true);
        setError(null);
        clearError();
    };

    // Generate slug from title
    const handleTitleChange = (title: string) => {
        const generatedSlug = title.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .trim();

        setCreateForm(prev => ({
            ...prev,
            title,
            slug: generatedSlug
        }));
    };

    // Handle manual slug change
    const handleSlugChange = (slug: string) => {
        const cleanSlug = slug.toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        setCreateForm(prev => ({
            ...prev,
            slug: cleanSlug
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

    const isMainBiosite = (biositeData: BiositeFull): boolean => {
        const currentUserId = getCurrentUserId();
        return biositeData.ownerId === currentUserId;
    };

    const isChildBiosite = (biositeData: BiositeFull): boolean => {
        return biositeStructure.childBiosites.includes(biositeData);
    };

    const isLoadingState = loading || contextLoading || biositeLoading || isCreating;

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
                                    onChange={(e) => handleSlugChange(e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="mi-biosite"
                                    disabled={isLoadingState}
                                />
                                <p className="text-xs text-gray-400 mt-1">bio.site/{createForm.slug}</p>

                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCreateNewBiosite}
                                    disabled={isLoadingState || !createForm.title.trim() || !createForm.slug.trim() }
                                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                            Creando...
                                        </>
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
                    {isLoadingState ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                            <span className="ml-2 text-sm text-gray-500">Cargando biosites...</span>
                        </div>
                    ) : (
                        <>
                            {/* Own Biosites */}
                            {biositeStructure.ownBiosites.length > 0 && (
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-gray-600">Mis Biosites</h3>
                                    {biositeStructure.ownBiosites.map((biositeData) => (
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
                                                <div className="font-medium text-gray-600 text-sm flex items-center">
                                                    {biositeData.title}
                                                    {isMainBiosite(biositeData) && (
                                                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            Principal
                                                        </span>
                                                    )}
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
                                </div>
                            )}

                            {/* Child Biosites */}
                            {canSeeChildBiosites() && biositeStructure.childBiosites.length > 0 && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-medium text-gray-600 flex items-center">
                                            <Users className="h-4 w-4 mr-2" />
                                            Biosites Hijos
                                        </h3>
                                        <button
                                            onClick={() => setShowChildBiosites(!showChildBiosites)}
                                            className="p-1 hover:bg-gray-200 rounded"
                                        >
                                            {showChildBiosites ?
                                                <ChevronDown className="h-4 w-4" /> :
                                                <ChevronRight className="h-4 w-4" />
                                            }
                                        </button>
                                    </div>
                                    {showChildBiosites && biositeStructure.childBiosites.map((biositeData) => (
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
                                                <div className="font-medium text-gray-600 text-sm flex items-center">
                                                    {biositeData.title}
                                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                        Hijo
                                                    </span>
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
                                </div>
                            )}

                            {/* Empty State */}
                            {biositeStructure.allBiosites.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">No hay biosites disponibles</p>
                                    {canCreateBiosites() && (
                                        <p className="text-xs mt-2">Crea tu primer biosite para comenzar</p>
                                    )}
                                </div>
                            )}

                            {/* Create New Site Button - only show for ADMIN and SUPER_ADMIN */}
                            {canCreateBiosites() && (
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
                            )}
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