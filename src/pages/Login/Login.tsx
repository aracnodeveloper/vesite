import {type FC, useState} from "react";
import Cookies from "js-cookie";
import {
    Alert,
    Button,
    Card,
    Form,
    Input,
    Layout,
    Space,
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
                    navigate("/sections", { replace: true });

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
            <div className="absolute top-5 left-10 right-10 bg-[#FAFFF6] rounded-lg  shadow-lg z-10 flex justify-between items-center p-3">
                <Typography.Title
                    level={3}
                    className="text-gray-600 m-0 font-light  border-b-5 border-[#E0EED5]"
                    style={{ fontSize: '20px' }}
                >
                    VeSites
                </Typography.Title>

                <div className="flex items-center space-x-4">
                    <Form
                        layout="inline"
                        onFinish={onFinish}
                        className="flex items-center space-x-3"
                    >
                        <Form.Item
                            name="email"
                            rules={[{ required: true, message: "E-mail required" }]}
                            className="mb-0"
                        >
                            <Input
                                placeholder="Correo"
                                className="rounded-lg border-gray-300 px-4 py-2"
                                style={{
                                    width: '200px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: "Password required" }]}
                            className="mb-0"
                        >
                            <Input.Password
                                placeholder="Password"
                                className="rounded-lg border-gray-300 px-4 py-2"
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                style={{
                                    width: '200px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                    border: '1px solid #d1d5db'
                                }}
                            />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                className="rounded-lg px-6 py-2 bg-gray-400 hover:bg-gray-500 border-0"
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
            <div className="flex-1 flex items-center justify-center pl-16 pr-16">
                <div className="flex items-center justify-between w-full max-w-6xl">
                    {/* Left Side - Video/Image placeholder */}
                    <div className="flex-1 mr-12">
                        <div
                            className="w-full h-80 bg-gray-900 rounded-lg shadow-lg"
                            style={{
                                backgroundColor: '#1a1a1a',
                                borderRadius: '8px'
                            }}
                        >
                            {/* Placeholder for video/image content */}
                        </div>
                    </div>

                    {/* Right Side - Text Content */}
                    <div className="flex-1 ml-12">
                        <div className="text-left">
                            <Typography.Title
                                level={1}
                                className="text-gray-600 mb-6 font-light"
                                style={{
                                    fontSize: '48px',
                                    lineHeight: '1.2',
                                    color: '#6b7280'
                                }}
                            >
                                Disfruta de VisitaEcuador
                            </Typography.Title>

                            <Typography.Text
                                className="text-gray-500 text-xl"
                                style={{
                                    fontSize: '24px',
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
                <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
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
