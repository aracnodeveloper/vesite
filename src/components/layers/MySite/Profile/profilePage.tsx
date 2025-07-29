// profilePage.tsx - Fixed version with template validation
import { Button, Form, Input, message } from "antd";
import { usePreview } from "../../../../context/PreviewContext";
import { useFetchBiosite } from "../../../../hooks/useFetchBiosite";
import { useUser } from "../../../../hooks/useUser";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BiositeColors, BiositeUpdateDto } from "../../../../interfaces/Biosite";
import ImageUploadSection from "./ImageUploadSection";
//import TemplateSelector from "./TemplateSelector.tsx";
//import { useTemplates } from "../../../../hooks/useTemplates.ts";
//import imgP from "../../../../../public/img/Banner.jpg"
const { TextArea } = Input;

const ProfilePage = () => {
    const role = Cookies.get('roleName');
    const { biosite, updatePreview, loading: previewLoading } = usePreview();
    const userId = Cookies.get('userId');
    const { updateBiosite, fetchBiosite, loading: updateLoading } = useFetchBiosite(userId);
    const { user, fetchUser, updateUser, loading: userLoading } = useUser();
    //const { templates, loading: templatesLoading } = useTemplates();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    // Estado para controlar la visibilidad de la advertencia
    const [showWarning, setShowWarning] = useState(true);

    const isAdmin = role === 'admin' || role === 'ADMIN';
    const DEFAULT_BACKGROUND = 'https://visitaecuador.com/bio-api/img/image-1753208386348-229952436.jpeg';
    const loading = previewLoading || updateLoading || userLoading;

    // Función para alternar la visibilidad de la advertencia
    const toggleWarning = () => {
        setShowWarning(!showWarning);
    };

    useEffect(() => {
        if (biosite && !loading) {
            fetchBiosite();
        }
    }, [biosite, fetchBiosite, loading]);

    useEffect(() => {
        if (userId) {
            fetchUser(userId);
        }
    }, [userId, fetchUser]);

    useEffect(() => {
        if (biosite && user) {
            form.setFieldsValue({
                title: biosite.title,
                slug: biosite.slug,
                description: user.description || ''
            });
        }
    }, [biosite, user, form]);
    {/*
    const validateTemplateExists = (templateId: string): boolean => {
        if (!templates.length) {
            console.warn('Templates not loaded yet');
            return false;
        }

        const templateExists = templates.some(template => template.id === templateId);
        if (!templateExists) {
            console.error('Template not found:', templateId);
            console.log('Available templates:', templates.map(t => ({ id: t.id, name: t.name })));
        }

        return templateExists;
    };

    const getValidTemplateId = (templateId: string): string => {
        // First, check if the provided template ID is valid
        if (validateTemplateExists(templateId)) {
            return templateId;
        }

        if (templates.length > 0) {
            const firstTemplate = templates[0];
            console.log('Using fallback template:', firstTemplate.id);
            return firstTemplate.id;
        }

        throw new Error('No valid templates available');
    };


    const handleTemplateChange = async (templateId: string) => {
        if (!biosite?.id || !userId || typeof updateBiosite !== 'function') {
            message.error('Error: Información del perfil no disponible');
            return;
        }

        if (!validateTemplateExists(templateId)) {
            message.error('La plantilla seleccionada no es válida');
            return;
        }

        try {
            const loadingMessage = message.loading('Actualizando plantilla...', 0);

            const ensureColorsAsString = (colors: string | BiositeColors | null | undefined): string => {
                if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                if (typeof colors === 'string') {
                    try {
                        JSON.parse(colors);
                        return colors;
                    } catch {
                        return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                    }
                }
                return JSON.stringify(colors);
            };

            const updateData: BiositeUpdateDto = {
                themeId: templateId, // Use the validated template ID
                ownerId: biosite.ownerId || userId,
                title: biosite.title,
                slug: biosite.slug,
                colors: ensureColorsAsString(biosite.colors),
                fonts: biosite.fonts || '',
                avatarImage: biosite.avatarImage || '',
                backgroundImage: biosite.backgroundImage || DEFAULT_BACKGROUND,
                isActive: biosite.isActive ?? true
            };

            console.log('Template change request:', {
                templateId,
                templateExists: validateTemplateExists(templateId),
                updateData
            });

            const updated = await updateBiosite(updateData);
            if (updated) {
                console.log('Successfully updated biosite template:', {
                    oldThemeId: biosite.themeId,
                    newThemeId: updated.themeId,
                    requestedThemeId: templateId
                });

                updatePreview({
                    ...updated,
                    themeId: templateId
                });

                // Refresh biosite data
                setTimeout(() => {
                    fetchBiosite();
                }, 100);

                loadingMessage();
                message.success('Plantilla actualizada exitosamente');
            } else {
                throw new Error('No se recibió respuesta del servidor');
            }
        } catch (error: any) {
            console.error("Error al actualizar plantilla:", error);

            // Handle specific database constraint error
            if (error.response?.data?.details?.code === 'P2003') {
                message.error('Error: La plantilla seleccionada no existe en la base de datos');
            } else if (error.response?.data?.message?.includes('referencia')) {
                message.error('Error: Referencia de plantilla inválida');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
                message.error(`Error al actualizar la plantilla: ${errorMessage}`);
            }
        }
    };
*/}

    const handleFinish = async (values: any) => {
        if (!biosite?.id || !userId || typeof updateBiosite !== 'function') {
            message.error('Error: Información del perfil no disponible');
            return;
        }

        try {
            const ensureColorsAsString = (colors: string | BiositeColors | null | undefined): string => {
                if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                if (typeof colors === 'string') {
                    try {
                        JSON.parse(colors);
                        return colors;
                    } catch {
                        return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                    }
                }
                return JSON.stringify(colors);
            };

            const getBackgroundImage = (): string => biosite.backgroundImage || DEFAULT_BACKGROUND;

            const loadingMessage = message.loading('Actualizando perfil...', 0);
            {/*
                // Validate current theme ID before using it
                let validThemeId = biosite.themeId;
                try {
                    validThemeId = getValidTemplateId(biosite.themeId || '');
                } catch (error) {
                    console.error('Template validation error:', error);
                    message.error('Error: No se puede validar la plantilla actual');
                    loadingMessage();
                    return;
                }
           */ }
            const updateData: BiositeUpdateDto = {
                ownerId: biosite.ownerId || userId,
                title: values.title || biosite.title,
                slug: values.slug || biosite.slug,
                themeId: biosite.themeId,
                colors: ensureColorsAsString(biosite.colors),
                fonts: biosite.fonts || '',
                avatarImage: biosite.avatarImage || '',
                backgroundImage: getBackgroundImage(),
                isActive: biosite.isActive ?? true
            };

            // Update user description if changed
            if (values.description !== user?.description) {
                const updatedUser = await updateUser(userId, {
                    description: values.description || ''
                });
                if (updatedUser) {
                    form.setFieldsValue({ description: updatedUser.description });
                }
            }

            const updated = await updateBiosite(updateData);
            if (updated) {
                updatePreview(updated);
                console.log("Profile updated successfully:", {
                    themeId: updated.themeId,
                    backgroundImage: updated.backgroundImage
                });
            }

            loadingMessage();
            message.success('Perfil actualizado exitosamente');
        } catch (error: any) {
            console.error("Error al actualizar perfil:", error);

            // Handle specific database constraint errors
            if (error.response?.data?.details?.code === 'P2003') {
                message.error('Error: Referencia de base de datos inválida');
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
                message.error(`Error al actualizar el perfil: ${errorMessage}`);
            }
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    if (loading && !biosite) {
        return (
            <div className="p-6 max-w-xl mx-auto">
                <div className="text-center text-gray-500 py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p>Cargando perfil...</p>
                </div>
            </div>
        );
    }

    if (!biosite) {
        return (
            <div className="p-6 max-w-xl mx-auto">
                <div className="text-center text-red-500 py-8">
                    <div className="mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold mb-2">No se pudo cargar el perfil</p>
                    <p className="text-sm text-gray-600 mb-4">
                        Verifica tu conexión e inténtalo de nuevo
                    </p>
                    <Button onClick={() => window.location.reload()}>
                        Recargar página
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full mb-10 mt-10 p-2 max-w-md mx-auto">
            <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 mt-1" />
                        <h1 className="text-lg font-semibold" style={{ fontSize: "17px" }}>Perfil</h1>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>IMÁGENES</h3>
                    <ImageUploadSection
                        biosite={biosite}
                        loading={loading}
                        userId={userId}
                        updateBiosite={updateBiosite}
                        updatePreview={updatePreview}
                        role={role}
                    />
                </div>

                {!isAdmin && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 cursor-pointer">
                                <svg
                                    className="w-5 h-5 text-blue-500 mt-0.5 cursor-pointer hover:text-blue-600 transition-colors"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    onClick={toggleWarning}
                                >
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {showWarning && (
                                <div className="h-20 lg:h-10">
                                    <h4 className="text-sm font-medium text-blue-800 mb-1" style={{fontSize:"11px"}}>Imagen de fondo</h4>
                                    <p className="text-sm text-blue-700" style={{fontSize:"11px"}}>
                                        {biosite.backgroundImage
                                            ? 'Tienes una imagen de fondo personalizada ya previa configurada             Al configurar debes llenar todos los campos y añadir una imagen '
                                            : 'Se aplicará una imagen de fondo por defecto a el perfil VeSite...  Al configurar debes llenar todos los campos y añadir una imagen'
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* About Section */}
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-800 mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>ACERCA DE</h3>
                    <Form form={form} layout="vertical" onFinish={handleFinish}>
                        <div className="mb-0">
                            <Form.Item
                                name="title"
                                rules={[
                                    { required: true, message: 'El título es requerido' },
                                    { min: 2, message: 'El título debe tener al menos 2 caracteres' },
                                    { max: 50, message: 'El título no puede tener más de 50 caracteres' }
                                ]}
                                className="mb-0"
                            >
                                <Input
                                    placeholder="Añade tu nombre"
                                    disabled={loading}
                                    maxLength={50}
                                    className="rounded-lg border-gray-600 bg-[#2A2A2A] text-white h-16 placeholder-gray-500"
                                    style={{ fontSize: "12px" }}
                                />
                            </Form.Item>
                        </div>

                        <div className="mb-0">
                            <Form.Item
                                name="description"
                                rules={[
                                    { max: 250, message: 'La descripción no puede tener más de 250 caracteres' }
                                ]}
                                className="mb-0"
                            >
                                <TextArea
                                    placeholder="Cuéntanos acerca de ti..."
                                    disabled={loading}
                                    maxLength={250}
                                    rows={4}
                                    className="rounded-lg border-gray-600 bg-[#2A2A2A] text-white resize-none placeholder-gray-500"
                                    style={{ fontSize: "12px" }}
                                    showCount
                                />
                            </Form.Item>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-800 mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>
                                SITIO
                            </h3>
                            <div className="mb-4">
                                <div className="flex">
                                    <Form.Item
                                        name="slug"
                                        rules={[
                                            { required: true, message: 'El slug es requerido' },
                                            { min: 3, message: 'El slug debe tener al menos 3 caracteres' },
                                            { max: 30, message: 'El slug no puede tener más de 30 caracteres' },
                                            { pattern: /^[a-z0-9-]+$/, message: 'Solo se permiten letras minúsculas, números y guiones' }
                                        ]}
                                        className="flex-1 mb-0"
                                    >
                                        <Input
                                            placeholder="Ve.site/"
                                            disabled={loading}
                                            maxLength={30}
                                            className="rounded-l-lg border-r-0 border-gray-600 bg-[#2A2A2A] text-white h-16 placeholder-gray-500"
                                            style={{ fontSize: "11px" }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>
                        {/*
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-800 mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>
                                DISEÑO
                            </h3>
                            <div className="rounded-lg p-4">
                                <TemplateSelector
                                    currentThemeId={biosite.themeId || ''}
                                    onTemplateChange={handleTemplateChange}
                                    loading={loading}
                                />
                            </div>
                        </div>
                        */}
                        <Form.Item className="mb-0">
                            <Button
                                type="default"
                                htmlType="submit"
                                className="w-full bg-blue-600 text-white hover:bg-blue-700 border-none rounded-lg py-2 h-auto"
                                loading={loading}
                                disabled={!biosite.id}
                            >
                                {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;