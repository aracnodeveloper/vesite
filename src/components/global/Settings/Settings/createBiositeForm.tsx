import React from "react";
import { Loader2 } from "lucide-react";

interface CreateBiositeData {
    title: string;
    slug: string;
}

interface CreateBiositeFormProps {
    createForm: CreateBiositeData;
    isLoadingState: boolean;
    isCreating: boolean;
    onTitleChange: (title: string) => void;
    onPasswordChange: (password: string) => void;
    onSlugChange: (slug: string) => void;
    onCreateBiosite: () => void;
    onCancel: () => void;
}

const CreateBiositeForm: React.FC<CreateBiositeFormProps> = ({
                                                                 createForm,
                                                                 isLoadingState,
                                                                 isCreating,
                                                                 onTitleChange,
                                                                 onSlugChange,
                                                                 onPasswordChange,
                                                                 onCreateBiosite,
                                                                 onCancel
                                                             }) => {
    return (
        <div className="p-4 bg-gray-50 border-b border-[#E0EED5]">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Crear Nuevo Biosite</h3>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Título</label>
                    <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) => onTitleChange(e.target.value)}
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
                        onChange={(e) => onSlugChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="mi-biosite"
                        disabled={isLoadingState}
                    />
                    <p className="text-xs text-gray-400 mt-1">bio.site/{createForm.slug}</p>
                </div>
                <div>
                    <label className="block text-xs text-gray-500 mb-1">Contraseña</label>
                    <input
                        type="password"
                        value={createForm.password}
                        onChange={(e) => onPasswordChange(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Contraseña del usuario"
                        disabled={isLoadingState}
                    />
                    <p className="text-xs text-gray-400 mt-1">Contraseña para el usuario del biosite</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={onCreateBiosite}
                        disabled={isLoadingState || !createForm.title.trim() || !createForm.slug.trim()}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                Creando...
                            </>
                        ) : (
                            'Crear'
                        )}
                    </button>
                    <button
                        onClick={onCancel}
                        disabled={isLoadingState}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBiositeForm;
