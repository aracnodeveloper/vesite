import {type FC, useState} from "react";
import Cookies from "js-cookie";
import {
    Alert,
    Button,
    Form,
    Input,
    Layout,
    Typography,
} from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';

import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext.ts";
import imgP6 from "../../../public/img/img_8.png";
const { Content } = Layout;

export const Login: FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login} = useAuthContext();
    const navigate = useNavigate();

    const onFinish = async (values: {
        email: string;
        password: string;
    }) => {
        setLoading(true);
        setError(null);

        if (!login) {
            setError("Login functionality is not available.");
            setLoading(false);
            return;
        }

        try {
            const response = await login(values.email, values.password);

            if (response.success) {
                const token = Cookies.get("accessToken");
                if (token) {
                    // Recargar la página antes de navegar
                    window.location.href = "/sections";
                } else {
                    setError("Login failed. No token found.");
                }
            } else {
                setError("Login failed. Please check your email and password.");
            }
        } catch (err) {
            console.error("Login error:", err);
            setError("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Content
            className="h-screen flex relative"
            style={{
                background: `url(${imgP6}) no-repeat center center`,
                backgroundSize: 'cover',
                backgroundColor: 'white',
            }}
        >
            {/* Header */}
            <div className="absolute top-5 left-4 right-4 lg:left-10 lg:right-10 bg-[#FAFFF6] rounded-lg shadow-lg z-10 flex flex-col sm:flex-row justify-between items-center p-3 gap-3 sm:gap-0">
                <Typography.Title
                    level={3}
                    className="text-gray-600 m-0 font-light border-b-5 border-[#E0EED5]"
                    style={{ fontSize: '25px' }}
                >
                    VeSites
                </Typography.Title>

                <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <Form
                        layout="inline"
                        onFinish={onFinish}
                        className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: "Cedula o Correo requerido" }]}
                            className="mb-0 w-full sm:w-auto"
                        >
                            <Input
                                placeholder="Correo o Cedula"
                                className="rounded-lg border-gray-300 px-4 py-2"
                                style={{
                                    width: '100%',
                                    minWidth: '200px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Contraseña requerida" }]}
                            className="mb-0 w-full sm:w-auto"
                        >
                            <Input.Password
                                placeholder="Password"
                                className="rounded-lg border-gray-300 px-4 py-2"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                style={{
                                    width: '100%',
                                    minWidth: '200px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Form.Item>

                        <Form.Item className="mb-0 w-full sm:w-auto">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="rounded-lg px-6 py-2 bg-gray-400 hover:bg-gray-500 border-0 w-full sm:w-auto"
                                style={{
                                    backgroundColor: loading ? undefined : '#9ca3af',
                                    color: 'white'
                                }}
                            >
                                {loading ? "..." : "Iniciar Sesión"}
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-32 sm:pt-16">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-6xl gap-8 lg:gap-0">
                    {/* Left Side - Video/Image placeholder */}
                    <div className="flex-1 w-full lg:mr-12 order-2 lg:order-1">
                        <img
                            className="w-full h-60 sm:h-80 bg-gray-900 rounded-lg shadow-lg"
                            src='../../../public/Video/video_1.GIF'
                            style={{
                                borderRadius: '20px'
                            }}
                        />
                            {/* Placeholder for video/image content */}

                    </div>

                    {/* Right Side - Text Content */}
                    <div className="flex-1 w-full lg:ml-12 order-1 lg:order-2">
                        <div className="text-center lg:text-left">
                            <Typography.Title
                                level={1}
                                className="text-gray-600 mb-6 font-light"
                                style={{
                                    fontSize: 'clamp(28px, 5vw, 48px)',
                                    lineHeight: '1.2',
                                    color: '#6b7280'
                                }}
                            >
                                Disfruta de VisitaEcuador
                            </Typography.Title>

                            <Typography.Text
                                className="text-gray-500"
                                style={{
                                    fontSize: 'clamp(16px, 3vw, 24px)',
                                    color: '#9ca3af',
                                    fontWeight: '300'
                                }}
                            >
                                Crea tu marca con nuestros VeSites
                            </Typography.Text>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="absolute top-40 sm:top-32 lg:top-24 left-1/2 transform -translate-x-1/2 z-20 px-4 w-full max-w-md">
                    <Alert
                        message={error}
                        type="error"
                        showIcon
                        className="rounded-lg shadow-lg"
                        style={{
                            backgroundColor: '#fee2e2',
                            border: '1px solid #fecaca'
                        }}
                    />
                </div>
            )}
        </Content>
    );
};