import type {FC} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Main/Layout.tsx";
import Dashboard from "./pages/dashboard.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import {Login} from "./pages/Login.tsx";
import ProfilePage from "./components/layers/MySite/Profile/profilePage.tsx";
import SocialPage from "./components/layers/MySite/Social/socialPage.tsx";
import DigitalDownloadFlow from "./components/layers/AddMoreSections/Download/donwloadPage.tsx";

const App: FC = () => {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/sections" />}   />
                    <Route
                        path="/sections"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />

                    <Route
                        path="/droplet"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />
                    <Route
                        path="/sales"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />
                    <Route
                        path="/audience"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />
                    <Route
                        path="/mail"
                        element={
                            <Layout>
                                <Dashboard />
                            </Layout>
                        }
                    />

                    {/* Rutas para Profile y Social */}
                    <Route
                        path="/profile"
                        element={
                            <Layout>
                                <ProfilePage />
                            </Layout>
                        }
                    />
                    <Route
                        path="/social"
                        element={
                            <Layout>
                                <SocialPage />
                            </Layout>
                        }
                    />

                    {/* Nueva ruta para Digital Download */}
                    <Route
                        path="/digital-download"
                        element={
                        <Layout>
                            <DigitalDownloadFlow />
                        </Layout>}
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App