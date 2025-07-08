import { Button, Form, Input, message } from "antd";
import { usePreview } from "../../../../context/PreviewContext";
import { useFetchBiosite } from "../../../../hooks/useFetchBiosite";
import { useUser } from "../../../../hooks/useUser";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { BiositeColors, BiositeUpdateDto } from "../../../../interfaces/Biosite";
import ImageUploadSection from "./ImageUploadSection";

const { TextArea } = Input;

const ProfilePage = () => {
    const role = Cookies.get('roleName');
    const { biosite, updatePreview, loading: previewLoading } = usePreview();
    const userId = Cookies.get('userId');
    const { updateBiosite, fetchBiosite, loading: updateLoading } = useFetchBiosite(userId);
    const { user, fetchUser, updateUser, loading: userLoading } = useUser();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const isAdmin = role === 'admin' || role === 'ADMIN';
    const DEFAULT_BACKGROUND = 'https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
    const loading = previewLoading || updateLoading || userLoading;

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

    const handleFinish = async (values: any) => {
        if (!biosite?.id || !userId || typeof updateBiosite !== 'function') return;

        try {
            const ensureColorsAsString = (colors: string | BiositeColors | null | undefined): string => {
                if (!colors) return '{"primary":"#3B82F6","secondary":"#1F2937"}';
                if (typeof colors === 'string') {
                    try { JSON.parse(colors); return colors; } catch { return '{"primary":"#3B82F6","secondary":"#1F2937"}'; }
                }
                return JSON.stringify(colors);
            };

            const getBackgroundImage = (): string => biosite.backgroundImage || DEFAULT_BACKGROUND;

            const loadingMessage = message.loading('Actualizando perfil...', 0);

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
                console.log("Background image after update:", updated.backgroundImage);
            }

            loadingMessage();
            message.success('Perfil actualizado exitosamente');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            console.error("Error al actualizar:", errorMessage);
            message.error(`Error al actualizar el perfil: ${errorMessage}`);
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
        <div className="w-full max-h-screen mb-10 max-w-md mx-auto rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <button onClick={handleBackClick} className="flex items-center cursor-pointer text-gray-800 hover:text-gray-600 transition-colors">
                        <ChevronLeft className="w-5 h-5 mr-1 hover:text-gray-400" />
                        <h1 className="text-lg font-semibold text-gray-800 hover:text-gray-400" style={{ fontSize: "17px" }}>Perfil</h1>
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>IMÁGENES</h3>
                        <ImageUploadSection biosite={biosite} loading={loading} userId={userId} updateBiosite={updateBiosite} updatePreview={updatePreview} role={role} />
                </div>

                {!isAdmin && (
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="h-10">
                                <p className="text-sm text-blue-700" style={{ fontSize: "11px" }}>
                                    {biosite.backgroundImage ? 'Primero debes configurar tu imagen de Avatar para comenzar ☝️' +
                                        'Tienes una imagen de fondo personalizada configurada.' : 'Primero debes configurar tu imagen de Avatar para comenzar ☝️' +
                                        'Se aplicará una imagen de fondo por defecto a tu perfil.'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className="text-sm font-medium text-black mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>ACERCA DE</h3>
                    <Form form={form} layout="vertical" onFinish={handleFinish}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-2" style={{ fontSize: "11px" }}>NOMBRE</label>
                            <Form.Item name="title" rules={[{ required: true, message: 'El título es requerido' }, { min: 2, message: 'El título debe tener al menos 2 caracteres' }, { max: 50, message: 'El título no puede tener más de 50 caracteres' }]} className="mb-0">
                                <Input placeholder="diseño" disabled={loading} maxLength={50} className="rounded-lg border-gray-300 h-16 " style={{ fontSize: "12px" }} />
                            </Form.Item>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-400 mb-2 ml-2" style={{ fontSize: "11px" }}>DESCRIPCIÓN</label>
                            <Form.Item name="description" rules={[{ max: 250, message: 'La descripción no puede tener más de 250 caracteres' }]} className="mb-0">
                                <TextArea placeholder="Cuéntanos acerca de ti..." disabled={loading} maxLength={250} rows={4} className="rounded-lg border-gray-300 resize-none" style={{ fontSize: "12px" }} showCount />
                            </Form.Item>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-black mb-4 uppercase tracking-wide" style={{ fontSize: "11px" }}>SITIO</h3>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-400 mb-2 ml-2" style={{ fontSize: "11px" }}>Bio.site/</label>
                                <div className="flex">
                                    <Form.Item name="slug" rules={[{ required: true, message: 'El slug es requerido' }, { min: 3, message: 'El slug debe tener al menos 3 caracteres' }, { max: 30, message: 'El slug no puede tener más de 30 caracteres' }, { pattern: /^[a-z0-9-]+$/, message: 'Solo se permiten letras minúsculas, números y guiones' }]} className="flex-1 mb-0">
                                        <Input placeholder="sitioReynaldomartinez31" disabled={loading} maxLength={30} className="rounded-l-lg border-r-0 h-16 " style={{ fontSize: "11px" }} />
                                    </Form.Item>
                                </div>
                            </div>
                        </div>

                        <Form.Item className="mb-0">
                            <Button type="default" htmlType="submit" className="w-full bg-blue-600 text-black hover:text-green700 hover:bg-blue-700 border-green-600 hover:border-green-700 rounded-lg py-2 h-auto" loading={loading} disabled={!biosite.id}>
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
