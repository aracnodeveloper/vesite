import {type FC, useState } from "react";
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

import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext.ts";

const { Content } = Layout;

export const Login: FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { login } = useAuthContext();
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
                const token = Cookies.get("accessToken"); //localStorage.getItem('accessToken');
                if (token) {
                    navigate("/users", { replace: true });
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
        <>
            <Content className="h-screen flex justify-center items-center " style={{backgroundColor:"#1b1b1b"}}>
                <Card className="w-96 p-6 rounded-2xl text-center " style={{backgroundColor:"#2a2a2a"}}>
                    <Space direction="vertical" align="center" size="large">
                      <img src="/src/assets/img/img.png" className="rounded-full h-24 w-24"/>

                        <Typography.Title level={4} className="m-0">
                            Biosites
                        </Typography.Title>

                        {error && (
                            <Alert
                                message={error}
                                type="error"
                                showIcon
                                className="mb-4"
                            />
                        )}

                        <Form
                            name="login"
                            onFinish={onFinish}
                            className="w-full"
                            layout="vertical"
                        >
                            <Form.Item
                                name="Email"
                                label="Email"
                                rules={[
                                    { required: true, message: "E-mail required" },
                                ]}
                            >
                                <Input />
                            </Form.Item>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[
                                    { required: true, message: "Password required" },
                                ]}
                            >
                                <Input.Password />
                            </Form.Item>
                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    className="w-full"
                                    loading={loading}
                                >
                                    Sign In
                                </Button>
                            </Form.Item>
                        </Form>
                    </Space>
                </Card>
            </Content>
        </>
    );
};