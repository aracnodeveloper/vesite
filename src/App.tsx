import type {FC} from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Main/Layout.tsx";
import Sections from "./pages/sections.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import {Login} from "./pages/Login.tsx";
import ProfilePage from "./components/layers/MySite/Profile/profilePage.tsx";
import SocialPage from "./components/layers/MySite/Social/socialPage.tsx";
import DigitalDownloadFlow from "./components/layers/AddMoreSections/Download/donwloadPage.tsx";
import { PreviewProvider } from "./context/PreviewContext";
import LinksPage from "./components/layers/AddMoreSections/Links/linksPage.tsx";

const App: FC = () => {
    return (
        <AuthProvider>
            <PreviewProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Navigate to="/sections" />}   />
                    <Route
                        path="/sections"
                        element={
                            <Layout>
                                <Sections />
                            </Layout>
                        }
                    />

                    <Route
                        path="/droplet"
                        element={
                            <Layout>
                                <Sections />
                            </Layout>
                        }
                    />
                    <Route
                        path="/analytics"
                        element={
                            <Layout>
                                <Sections />
                            </Layout>
                        }
                    />
                    <Route
                        path="/sales"
                        element={
                            <Layout>
                                <Sections />
                            </Layout>
                        }
                    />
                    <Route
                        path="/audience"
                        element={
                            <Layout>
                                <Sections />
                            </Layout>
                        }
                    />
                    <Route
                        path="/mail"
                        element={
                            <Layout>
                                <Sections />
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

                    <Route path="/links" element={
                        <Layout>
                        <LinksPage onBack={() => {}}/>
                        </Layout>
                    }
                    />

                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
            </PreviewProvider>
        </AuthProvider>
    )
}

export default App