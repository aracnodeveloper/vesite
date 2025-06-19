import { useContext } from "react";
import { Button, Form, Input, Upload, Image } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadImage } from "../lib/uploadImage";
import { AuthContext } from "../contexts/AuthContext";
import type { BiositeFull } from "../../../../interfaces/Biosite.ts";
import apiService from "../../../../service/apiService.ts";
import { updateBiositeApi } from "../../../../constants/EndpointsRoutes.ts";
import {usePreview} from "../../../../context/PreviewContext.tsx";

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const { biosite, setBiosite } = usePreview();
    const [form] = Form.useForm();

    const handleFinish = async (values: any) => {
        if (!biosite?.id) {
            console.error("Error: biositeId is missing");
            return;
        }

        try {
            const updated = await apiService.update<BiositeFull>(updateBiositeApi, biosite.id, {
                ...biosite,
                ...values,
            });

            setBiosite(updated);
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    const handleUpload = async (info: any, key: "avatar" | "coverImage") => {
        if (!biosite || !user) return;

        const file = info.file.originFileObj;
        const imageUrl = await uploadImage(file);

        const updated = await apiService.update<BiositeFull>(updateBiositeApi, biosite.id, {
            ...biosite,
            [key]: imageUrl,
        });

        setBiosite(updated);
    };

    const canEditCover = user?.roleName === "ADMIN" || user?.roleName === "SUPER_ADMIN";

    return (
        <div className="p-6 max-w-xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Perfil</h2>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFinish}
                initialValues={{
                    title: biosite?.title,
                    description: biosite?.description,
                }}
            >
                <Form.Item label="Título" name="title">
                    <Input />
                </Form.Item>

                <Form.Item label="Descripción" name="description">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Actualizar
                    </Button>
                </Form.Item>
            </Form>

            <div className="mt-6">
                <h3 className="font-semibold mb-2">Avatar</h3>
                <Image width={100} src={biosite?.avatar} />
                <Upload
                    showUploadList={false}
                    beforeUpload={() => false}
                    onChange={(info) => handleUpload(info, "avatar")}
                >
                    <Button icon={<UploadOutlined />}>Cambiar Avatar</Button>
                </Upload>
            </div>

            {canEditCover && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Imagen de portada</h3>
                    <Image width={200} src={biosite?.coverImage} />
                    <Upload
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={(info) => handleUpload(info, "coverImage")}
                    >
                        <Button icon={<UploadOutlined />}>Cambiar Portada</Button>
                    </Upload>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
