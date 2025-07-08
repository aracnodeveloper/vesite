import React, { useState, useEffect } from "react";
import { Dialog } from "@headlessui/react";
import { AlertCircle, Loader2 } from "lucide-react";
import { usePreview } from "../../../context/PreviewContext.tsx";
import { useUser } from "../../../hooks/useUser.ts";
import { useFetchBiosite } from "../../../hooks/useFetchBiosite.ts";
import type { BiositeFull } from "../../../interfaces/Biosite";
import Cookies from "js-cookie";
import CreateBiositeForm from "./Settings/createBiositeForm.tsx";
import BiositesList from "./Settings/biositeList.tsx";
import SettingsFooter from "./Settings/settingsFooter";

interface Profile {
    id: string;
    userId: string;
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
    password: string;
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
        createBiosite,
        switchToAnotherBiosite,
        clearError
    } = usePreview();

    const { user, fetchUser } = useUser();
    const role = Cookies.get("roleName");

    const {
        fetchCompleteBiositeStructure,
        fetchAdminBiosites,
        loading: biositeLoading,
        error: biositeError
    } = useFetchBiosite();

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
        password: '',
    });

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
                title: createForm.title.trim(),
                slug: createForm.slug.trim(),
                password: createForm.password.trim(),
            };
            const newBiosite = await createBiosite(createData);

            if (newBiosite) {
                console.log('Biosite and user created successfully:', newBiosite);
                await fetchBiositeStructure(currentUserId);
                setCreateForm({ title: '', slug: '', password:'' });
                setShowCreateForm(false);

                if (onCreateNewSite) {
                    onCreateNewSite();
                }

                await handleProfileSwitch(newBiosite);
            }
        } catch (err: any) {
            console.error('Error creating biosite and user:', err);
            setError(err?.message || 'Error al crear el biosite y usuario');
        } finally {
            setIsCreating(false);
        }
    };

    const handleProfileSwitch = async (biositeData: BiositeFull) => {
        try {
            setLoading(true);
            setError(null);
            clearError();

            const switchedBiosite = await switchToAnotherBiosite(biositeData.id);

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
    const handlePasswordChange = (password: string) => {
        setCreateForm(prev => ({
            ...prev,
            password
        }));
    };
    const isLoadingState = loading || contextLoading || biositeLoading || isCreating;

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            className="fixed inset-0 min-h-screen overflow-y-auto z-50 flex p-2 items-center justify-start bg-black/50"
        >
            <div className="h-5"></div>
            <Dialog.Panel className="bg-[#FAFFF6] h-full rounded-lg w-[320px] text-gray-600 shadow-xl">
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
                            <AlertCircle className="h-4 w-4 text-red-400 mr-2"/>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* Create Form */}
                {showCreateForm && (
                    <CreateBiositeForm
                        createForm={createForm}
                        isLoadingState={isLoadingState}
                        isCreating={isCreating}
                        onTitleChange={handleTitleChange}
                        onSlugChange={handleSlugChange}
                        onPasswordChange={handlePasswordChange}
                        onCreateBiosite={handleCreateNewBiosite}
                        onCancel={() => {
                            setShowCreateForm(false);
                            setCreateForm({title: '', slug: '',password:''});
                            setError(null);
                            clearError();
                        }}
                    />
                )}

                {/* Biosites Section */}
                <div className="p-4 space-y-3">
                    {isLoadingState ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400"/>
                            <span className="ml-2 text-sm text-gray-500">Cargando biosites...</span>
                        </div>
                    ) : (
                        <BiositesList
                            biositeStructure={biositeStructure}
                            currentBiosite={biosite}
                            canSeeChildBiosites={canSeeChildBiosites()}
                            canCreateBiosites={canCreateBiosites()}
                            isLoadingState={isLoadingState}
                            onProfileSwitch={handleProfileSwitch}
                            onCreateNewSite={handleCreateNewSite}
                            onRefreshStructure={() => {
                                const currentUserId = getCurrentUserId();
                                if (currentUserId) {
                                    fetchBiositeStructure(currentUserId);
                                }
                            }}
                            onError={setError}
                            clearError={clearError}
                        />
                    )}
                </div>

                {/* Settings Footer */}
                <SettingsFooter onLogout={onLogout} />
            </Dialog.Panel>
            <div className="h-5"></div>
        </Dialog>
    );
};

export default SettingsModal;
