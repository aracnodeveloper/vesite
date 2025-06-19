import { Button, Form, Input, Upload, Image, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadImage } from "./lib/uploadImage";
import { usePreview } from "../../../../context/PreviewContext";
import { useFetchBiosite } from "../../../../hooks/useFetchBiosite";
import Cookies from "js-cookie";
import { useEffect } from "react";

const ProfilePage = () => {
    // CORRECCIÓN: era 'rolName' en vez de 'roleName'
    const role = Cookies.get('roleName');
    const { biosite, updatePreview } = usePreview();
    const userId = Cookies.get('userId');
    const { updateBiosite, loading } = useFetchBiosite(userId);

    const [form] = Form.useForm();

    // Valid placeholder images
    const placeholderAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23e5e7eb'/%3E%3Cpath d='M40 20c-6 0-10 4-10 10s4 10 10 10 10-4 10-10-4-10-10-10zM20 60c0-10 9-15 20-15s20 5 20 15v5H20v-5z' fill='%239ca3af'/%3E%3C/svg%3E";

    const placeholderBackground = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f3f4f6'/%3E%3Cpath d='M40 40h120v40H40z' fill='%23d1d5db'/%3E%3Ccircle cx='60' cy='50' r='8' fill='%239ca3af'/%3E%3Cpath d='M80 65l20-15 40 25H80z' fill='%239ca3af'/%3E%3C/svg%3E";

    // Actualizar el formulario cuando cambie biosite
    useEffect(() => {
        if (biosite) {
            form.setFieldsValue({
                title: biosite.title,
                slug: biosite.slug,
            });
        }
    }, [biosite, form]);

    const handleFinish = async (values: any) => {
        if (!biosite?.id) {
            message.error("Error: biositeId is missing");
            return;
        }

        try {
            const updated = await updateBiosite({
                title: values.title,
                slug: values.slug,
            });

            if (updated) {
                updatePreview(updated);
                message.success("Perfil actualizado correctamente");
            } else {
                message.error("Error al actualizar el perfil");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            message.error("Error al actualizar el perfil");
        }
    };

    const handleUpload = async (info: any, key: "avatarImage" | "backgroundImage") => {
        if (!biosite) return;

        try {
            const file = info.file.originFileObj;
            const imageUrl = await uploadImage(file);

            const updated = await updateBiosite({
                [key]: imageUrl,
            });

            if (updated) {
                updatePreview(updated);
                message.success(`${key === 'avatarImage' ? 'Avatar' : 'Portada'} actualizada correctamente`);
            } else {
                message.error("Error al actualizar la imagen");
            }
        } catch (error) {
            console.error("Error updating image:", error);
            message.error("Error al subir la imagen");
        }
    };

    const canEditCover = role === "ADMIN" || role === "SUPER_ADMIN";

    if (!biosite) {
        return (
            <div className="p-6 max-w-xl mx-auto">
                <div className="text-center text-gray-500">Cargando perfil...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-white">Perfil</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                className="mb-6"
            >
                <Form.Item
                    label={<span className="text-white">Título</span>}
                    name="title"
                    rules={[{ required: true, message: 'El título es requerido' }]}
                >
                    <Input placeholder="Nombre de tu biosite" />
                </Form.Item>

                <Form.Item
                    label={<span className="text-white">Slug (URL personalizada)</span>}
                    name="slug"
                    rules={[{ required: true, message: 'El slug es requerido' }]}
                >
                    <Input
                        placeholder="tu-nombre-personalizado"
                        addonBefore="bio.site/"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        className="w-full"
                        loading={loading}
                    >
                        Actualizar Perfil
                    </Button>
                </Form.Item>
            </Form>

            <div className="space-y-6">
                {/* Avatar Section */}
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <h3 className="font-semibold mb-3 text-white">Avatar</h3>
                    <div className="flex items-center space-x-4">
                        <Image
                            width={80}
                            height={80}
                            src={biosite.avatarImage || placeholderAvatar}
                            className="rounded-full object-cover"
                            fallback={placeholderAvatar}
                            preview={false}
                            onError={(e) => {
                                console.warn('Avatar image failed to load:', biosite.avatarImage);
                                // The fallback will handle this automatically
                            }}
                        />
                        <Upload
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={(info) => handleUpload(info, "avatarImage")}
                            accept="image/*"
                        >
                            <Button
                                icon={<UploadOutlined />}
                                loading={loading}
                            >
                                Cambiar Avatar
                            </Button>
                        </Upload>
                    </div>
                </div>

                {/* Background Image Section - Solo para ADMIN/SUPER_ADMIN */}
                {canEditCover && (
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                        <h3 className="font-semibold mb-3 text-white">Imagen de portada</h3>
                        <div className="space-y-3">
                            <Image
                                width={200}
                                height={120}
                                src={biosite.backgroundImage || placeholderBackground}
                                className="rounded-lg object-cover"
                                fallback={placeholderBackground}
                                preview={false}
                                onError={(e) => {
                                    console.warn('Background image failed to load:', biosite.backgroundImage);
                                    // The fallback will handle this automatically
                                }}
                            />
                            <Upload
                                showUploadList={false}
                                beforeUpload={() => false}
                                onChange={(info) => handleUpload(info, "backgroundImage")}
                                accept="image/*"
                            >
                                <Button
                                    icon={<UploadOutlined />}
                                    loading={loading}
                                >
                                    Cambiar Portada
                                </Button>
                            </Upload>
                        </div>
                    </div>
                )}

                {/* Preview URL */}
                <div className="bg-[#2a2a2a] p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-white">URL de tu biosite</h3>
                    <div className="flex items-center space-x-2">
                        <code className="bg-gray-700 px-3 py-2 rounded text-green-400 flex-1">
                            bio.site/{biosite.slug}
                        </code>
                        <Button
                            onClick={() => {
                                navigator.clipboard.writeText(`https://bio.site/${biosite.slug}`);
                                message.success('URL copiada al portapapeles');
                            }}
                            size="small"
                        >
                            Copiar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;