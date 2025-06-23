import { Button, Form, Input, message } from "antd";
import { usePreview } from "../../../../context/PreviewContext";
import { useFetchBiosite } from "../../../../hooks/useFetchBiosite";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BiositeUpdateDto } from "../../../../interfaces/Biosite";
import ImageUploadSection from "./ImageUploadSection";

const ProfilePage = () => {
    const role = Cookies.get('roleName');
    const { biosite, updatePreview, loading: previewLoading } = usePreview();
    const userId = Cookies.get('userId');
    const { updateBiosite, fetchBiosite, loading: updateLoading } = useFetchBiosite(userId);
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const loading = previewLoading || updateLoading;
    useEffect(() => {
        if (biosite && !loading) {
            fetchBiosite();
        }
    }, [biosite, fetchBiosite, loading]);

    useEffect(() => {
        if (biosite) {
            form.setFieldsValue({
                title: biosite.title,
                slug: biosite.slug,
            });
        }
    }, [biosite, form]);

    const handleFinish = async (values: any) => {

        if (!biosite) {
            return;
        }
        if (!biosite.id) {
            return;
        }
        if (!userId) {
            return;
        }
        if (typeof updateBiosite !== 'function') {
            return;
        }
        try {
            const updateData: BiositeUpdateDto = {
                ownerId: biosite.ownerId || userId,
                title: values.title || biosite.title,
                slug: values.slug || biosite.slug,
                themeId: biosite.themeId,
                colors: biosite.colors || '{"primary":"#3B82F6","secondary":"#1F2937"}',
                fonts: biosite.fonts || '',
                avatarImage: biosite.avatarImage || '',
                backgroundImage: biosite.backgroundImage || '',
                isActive: biosite.isActive ?? true
            };

            console.log("=== UPDATE DATA ===");
            console.log("Update data being sent:", updateData);


            const loadingMessage = message.loading('Actualizando perfil...', 0);

            console.log("=== CALLING UPDATE FUNCTION ===");


            console.log("=== ENSURING HOOK HAS BIOSITE DATA ===");
            await fetchBiosite();

            const updated = await updateBiosite(updateData);

            loadingMessage();

            console.log("=== UPDATE RESULT ===");
            console.log("Update function returned:", updated);
            console.log("Type of result:", typeof updated);
            console.log("Is null:", updated === null);
            console.log("Is undefined:", updated === undefined);

            if (updated) {
                console.log("=== SUCCESS PATH ===");
                console.log("Updated biosite data:", updated);

                // Update the preview context
                updatePreview(updated);
                message.success("Perfil actualizado correctamente");
                console.log("Profile updated successfully, preview updated");
            } else {
                console.error("=== ERROR PATH ===");
                console.error("Update returned null/undefined");
                console.error("This indicates the API call failed or returned invalid data");

                // Check if it's specifically null or undefined
                if (updated === null) {
                    console.error("Result is explicitly null");
                    message.error("Error: La actualización falló. El servidor retornó un valor nulo.");
                } else if (updated === undefined) {
                    console.error("Result is undefined");
                    message.error("Error: La actualización falló. No se recibió respuesta del servidor.");
                } else {
                    console.error("Result is falsy but not null/undefined:", updated);
                    message.error("Error: La actualización falló. Respuesta inválida del servidor.");
                }
            }
        } catch (error: unknown) {
            console.error("=== EXCEPTION CAUGHT ===");
            console.error("Error updating profile:", error);
            console.error("Error type:", typeof error);

            // Type-safe error handling
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            const errorStack = error instanceof Error ? error.stack : undefined;

            console.error("Error message:", errorMessage);
            console.error("Error stack:", errorStack);

            // More specific error messages based on error type
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                message.error("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
            } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
                message.error("Sesión expirada. Por favor, inicia sesión nuevamente.");
            } else if (errorMessage.includes('403') || errorMessage.includes('forbidden')) {
                message.error("No tienes permisos para realizar esta acción.");
            } else if (errorMessage.includes('400') || errorMessage.includes('bad request')) {
                message.error("Datos inválidos. Verifica la información e inténtalo de nuevo.");
            } else {
                message.error(`Error al actualizar el perfil: ${errorMessage}`);
            }
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    // Loading state
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

    // Error state when no biosite is available
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

    // Check if we're in development mode (browser-safe way)
    const isDevelopment = typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('dev'));

    return (
        <div className="p-6 max-w-xl mx-auto">
            {/* Header */}
            <div className="shadow-sm border-b mb-6">
                <div className="max-w-md mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleBackClick}
                            className="flex items-center cursor-pointer text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            <h1 className="text-lg font-semibold text-white">Perfil</h1>
                        </button>
                    </div>
                </div>
            </div>

            {/* Image Upload Section */}
            <ImageUploadSection
                biosite={biosite}
                loading={loading}
                userId={userId}
                updateBiosite={updateBiosite}
                updatePreview={updatePreview}
                role={role}
            />

            {/* Form Section */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="mb-6"
            >
                <Form.Item
                    label={<span className="text-white">Título</span>}
                    name="title"
                    rules={[
                        { required: true, message: 'El título es requerido' },
                        { min: 2, message: 'El título debe tener al menos 2 caracteres' },
                        { max: 50, message: 'El título no puede tener más de 50 caracteres' }
                    ]}
                >
                    <Input
                        placeholder="Nombre de tu biosite"
                        disabled={loading}
                        maxLength={50}
                    />
                </Form.Item>

                <Form.Item
                    label={<span className="text-white">Slug (URL personalizada)</span>}
                    name="slug"
                    rules={[
                        { required: true, message: 'El slug es requerido' },
                        { min: 3, message: 'El slug debe tener al menos 3 caracteres' },
                        { max: 30, message: 'El slug no puede tener más de 30 caracteres' },
                        { pattern: /^[a-z0-9-]+$/, message: 'Solo se permiten letras minúsculas, números y guiones' }
                    ]}
                >
                    <Input
                        placeholder="tu-nombre-personalizado"
                        addonBefore="bio.site/"
                        disabled={loading}
                        maxLength={30}
                    />
                </Form.Item>

                {/* URL Preview */}
                <div className="p-4 rounded-lg bg-gray-800 mb-4">
                    <h3 className="font-semibold mb-2 text-white">URL de tu biosite</h3>
                    <div className="flex items-center space-x-2">
                        <code className="bg-gray-700 px-3 py-2 rounded text-green-400 flex-1 text-sm">
                            bio.site/{biosite.slug || 'tu-slug'}
                        </code>
                        <Button
                            onClick={() => {
                                const url = `https://bio.site/${biosite.slug}`;
                                navigator.clipboard.writeText(url).then(() => {
                                    message.success('URL copiada al portapapeles');
                                }).catch(() => {
                                    message.error('Error al copiar URL');
                                });
                            }}
                            size="small"
                            disabled={!biosite.slug}
                        >
                            Copiar
                        </Button>
                    </div>
                </div>

                {/* Submit Button */}
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        loading={loading}
                        disabled={!biosite.id}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Perfil'}
                    </Button>
                </Form.Item>
            </Form>

            {/* Enhanced Debug Information */}
            {isDevelopment && (
                <div className="mt-8 p-4 bg-gray-900 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">Debug Info</h4>
                    <div className="text-xs text-gray-400 space-y-1">
                        <p>Biosite ID: {biosite.id || 'N/A'}</p>
                        <p>User ID: {userId || 'N/A'}</p>
                        <p>Role: {role || 'N/A'}</p>
                        <p>Loading: {loading ? 'Yes' : 'No'}</p>
                        <p>Preview Loading: {previewLoading ? 'Yes' : 'No'}</p>
                        <p>Update Loading: {updateLoading ? 'Yes' : 'No'}</p>
                        <p>Update Function Type: {typeof updateBiosite}</p>
                        <p>Biosite Keys: {biosite ? Object.keys(biosite).join(', ') : 'N/A'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;