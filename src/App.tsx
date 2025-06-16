// src/App.tsx

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Layout principal
import Layout  from "./components/Main/Layout.tsx";

// Páginas públicas
import { Login } from "./pages/Login/Login.tsx";

// Páginas privadas
import Sections  from "./pages/sections.tsx";
import ProfilePage from "./components/layers/MySite/Profile/profilePage.tsx";
import Analytics from "./pages/analytics.tsx";
import Styles from "./pages/styles.tsx";
import PrivateRoute from "./pages/Login/PrivateRoute.tsx";
import AdminRoute from "./pages/Login/AdminRoute.tsx";
import {AuthProvider} from "./context/AuthContext.tsx";
import {PreviewProvider} from "./context/PreviewContext.tsx";
import SocialPage from "./components/layers/MySite/Social/socialPage.tsx";
import VideoPage from "./components/layers/AddMoreSections/Video/videoPage.tsx";
import MusicPage from "./components/layers/AddMoreSections/Music-Posdcast/musicPage.tsx";
import PostPage from "./components/layers/AddMoreSections/Socialpost/socialPostPage.tsx";
import TextBoxPage from "./components/layers/AddMoreSections/TextBox/textBoxPage.tsx";
import LinksPage from "./components/layers/AddMoreSections/Links/linksPage.tsx";

// Rutas protegidas

const App = () => {


    return (
        <AuthProvider>
            <PreviewProvider>
                <BrowserRouter>
        <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Navigate to="/sections" />} />
            <Route path="/login" element={<Login />} />

            {/* Rutas privadas (autenticado) */}
            <Route
                path="/sections"
                element={
                    <PrivateRoute>
                        <Layout>
                            <Sections />
                        </Layout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/profile"
                element={
                    <PrivateRoute>
                        <Layout>
                            <ProfilePage />
                        </Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/social"
                element={
                    <PrivateRoute>
                        <Layout>
                            <SocialPage />
                        </Layout>
                    </PrivateRoute>
                }
            />
            <Route path="/links" element={
                <PrivateRoute>
                    <Layout>
                        <LinksPage />
                    </Layout>
                </PrivateRoute>
            }
            />

            <Route path="/textBox" element={
                <PrivateRoute>
                    <Layout>
                        <TextBoxPage />
                    </Layout>
                </PrivateRoute>
            }
            />


            <Route path="/videos" element={
                <PrivateRoute>
                    <Layout>
                        <VideoPage />
                    </Layout>
                </PrivateRoute>
            }
            />

            <Route path="/music" element={
                <PrivateRoute>
                    <Layout>
                        <MusicPage />
                    </Layout>
                </PrivateRoute>
            }
            />

            <Route path="/post" element={
                <PrivateRoute>
                    <Layout>
                        <PostPage />
                    </Layout>
                </PrivateRoute>
            }
            />
            <Route
                path="/droplet"
                element={
                    <PrivateRoute>
                        <Layout>
                            <Styles />
                        </Layout>
                    </PrivateRoute>
                }
            />
            <Route
                path="/analytics"
                element={
                    <PrivateRoute>
                        <Layout>
                            <Analytics />
                        </Layout>
                    </PrivateRoute>
                }
            />

            {/* Rutas solo para admins */}
            <Route
                path="/analytics"
                element={
                    <PrivateRoute>
                        <AdminRoute>
                            <Layout>
                                <Analytics />
                            </Layout>
                        </AdminRoute>
                    </PrivateRoute>
                }
            />

            <Route
                path="/styles"
                element={
                    <PrivateRoute>
                        <AdminRoute>
                            <Layout>
                                <Styles />
                            </Layout>
                        </AdminRoute>
                    </PrivateRoute>
                }
            />

            {/* Catch-all: redirección a inicio */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
                </BrowserRouter>
            </PreviewProvider>
        </AuthProvider>
    );
};
export default App
