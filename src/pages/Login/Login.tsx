import { type FC, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { Alert, Button, Form, Input, Layout, Typography } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import { useAuthContext } from "../../hooks/useAuthContext.ts";

const { Content } = Layout;

export const Login: FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const { login } = useAuthContext();

  // Limpia el mensaje de error automáticamente
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  // Login MANUAL (sin auto-login)
  const onFinish = async (values: { email: string; password: string }) => {
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
          window.location.href = "/sections";
        } else {
          setError("Login failed. No token found.");
        }
      } else {
        setError("Login failed. Por favor revisa tu usuario o contraseña.");
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
          className="h-screen flex relative overflow-hidden"
          style={{ backgroundColor: "rgba(224,238,213,0.7)" }}
      >
        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-pulse"></div>
          <div
              className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-400 rounded-full opacity-40 animate-pulse"
              style={{ animationDelay: "1s" }}
          ></div>
          <div
              className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-emerald-300 rounded-full opacity-30 animate-pulse"
              style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Header */}
        <div
            className="absolute top-5 left-4 right-4 lg:left-10 lg:right-10 z-10 flex flex-col sm:flex-row justify-between items-center p-2 gap-4 sm:gap-0 bg-white/50"
            style={{
              backdropFilter: "blur(20px)",
              borderRadius: "20px",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            }}
        >
          <div className="w-30 h-20">
            <img src="./img/veSite.svg" className="w-30 h-20" />
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto">
            <Form
                form={form}
                layout="inline"
                onFinish={onFinish}
                className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 w-full sm:w-auto"
            >
              <Form.Item
                  name="email"
                  rules={[{ required: true, message: "Cedula o Correo requerido" }]}
                  className="mb-0 w-full sm:w-auto"
              >
                <Input
                    placeholder="Correo o Cedula"
                    className="rounded-xl border-0 px-4 py-3"
                    style={{
                      minWidth: "220px",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                      fontSize: "15px",
                    }}
                />
              </Form.Item>

              <Form.Item
                  name="password"
                  rules={[{ required: true, message: "Contraseña requerida" }]}
                  className="mb-0 w-full sm:w-auto"
              >
                <Input.Password
                    placeholder="Contraseña"
                    iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    className="rounded-xl border-0 px-4 py-3"
                    style={{
                      minWidth: "220px",
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
                      fontSize: "15px",
                    }}
                />
              </Form.Item>

              <Form.Item className="mb-0 w-full sm:w-auto">
                <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="rounded-xl px-8 py-3 border-0"
                    style={{
                      background: loading
                          ? undefined
                          : "linear-gradient(135deg, #BAD789 0%, #BAD789 100%)",
                      color: "white",
                      height: "32px",
                      fontSize: "15px",
                    }}
                >
                  {loading ? "Cargando..." : "Iniciar Sesión"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 pt-32 sm:pt-20">
          <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-7xl gap-12 lg:gap-16">
            <div className="flex-1 w-full lg:mr-12 order-2 lg:order-1">
              <img
                  className="w-full h-64 sm:h-80 lg:h-96 rounded-3xl shadow-2xl object-cover"
                  src="./Video/TARJETA_NFC.gif"
                  alt="VESites Demo"
              />
            </div>

            <div className="flex-1 w-full lg:ml-12 order-1 lg:order-2">
              <Typography.Title level={1}>
                Disfruta de
                <span className="block text-[#BAD789]">VisitaEcuador.com</span>
              </Typography.Title>
            </div>
          </div>
        </div>

        {error && (
            <div className="absolute top-44 left-1/2 -translate-x-1/2 z-20 px-4 w-full max-w-md">
              <Alert
                  message={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  className="rounded-2xl"
              />
            </div>
        )}
      </Content>
  );
};