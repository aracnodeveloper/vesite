import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

// Layout principal
import Layout from "./layout/Layout.tsx";

// Páginas públicas
import { Login } from "../features/auth/pages/Login.tsx";
// Páginas privadas
import Sections from "../features/sections/pages/sections.tsx";
import ProfilePage from "../features/biosite/profile/profilePage.tsx";
import Analytics from "../features/analytics/pages/analytics.tsx";
import Styles from "../features/biosite/pages/styles.tsx";
import PrivateRoute from "../features/auth/pages/PrivateRoute.tsx";
import { canAccessAdmin } from "../core/auth/session";
import { PreviewProvider } from "../features/biosite/context/PreviewContext.tsx";
import { SectionsProvider } from "../features/sections/context/SectionsContext.tsx";
import SocialPage from "../features/links/social/socialPage.tsx";
import VideoPage from "../features/links/video/videoPage.tsx";
import MusicPage from "../features/links/music/musicPage.tsx";
import PostPage from "../features/links/social-post/socialPostPage.tsx";
import LinksPage from "../features/links/links/linksPage.tsx";
import { AuthProvider } from "../features/auth/context/AuthContext.tsx";
import AppPage from "../features/links/app/appPage.tsx";
import VCardPage from "../features/vcard/components/V-CardPage.tsx";
import WhatsAppPage from "../features/links/whatsapp/whatsAppPage.tsx";
import AdminPanel from "../features/admin/pages/SuperAdmin.tsx";
import NewBiositePage from "../features/biosite-public/NewBiositePage.tsx";
import GalleryPage from "../features/text-blocks/components/GalleryPage.tsx";
import BlackCardLanding from "../features/blackcard/pages/BlackCardLanding.tsx";
import HistoriesListPage from "../features/history/components/HistoriesListPage.tsx";
import HistoryEditorPage from "../features/history/components/HistoryEditorPage.tsx";
import HistoryPreviewPage from "../features/history/components/HistoryPreviewPage.tsx";

// Componente wrapper para rutas privadas con Layout
const PrivateLayout = () => (
    <PrivateRoute>
        <Layout />
    </PrivateRoute>
);

const App = () => {
    return (
        <AuthProvider>
            <PreviewProvider>
                <SectionsProvider>
                    <BrowserRouter basename="vesite">
                        <Routes>
                            {/* Rutas públicas */}
                            <Route path="/" element={<Navigate to="/sections" />} />
                            <Route path="/login" element={<Login />} />

                            <Route
                                path="/blackcard/:memberId"
                                element={
                                    <div className="min-h-screen">
                                        <BlackCardLanding />
                                    </div>
                                }
                            />
                            {/* Ruta pública para ver biosite por slug */}
                            <Route
                                path="/:slug"
                                element={
                                    <div className="min-h-screen bg-gray-100">
                                        <NewBiositePage />
                                    </div>
                                }
                            />

                            {/* Rutas privadas con Layout usando Outlet */}
                            <Route path="/" element={<PrivateLayout />}>
                                <Route path="sections" element={<Sections />} />
                                <Route path="profile" element={<ProfilePage />} />
                                <Route path="social" element={<SocialPage />} />
                                <Route path="whatsApp" element={<WhatsAppPage />} />
                                <Route path="links" element={<LinksPage />} />
                                <Route path="videos" element={<VideoPage />} />
                                <Route path="music" element={<MusicPage />} />
                                <Route path="post" element={<PostPage />} />
                                <Route path="app" element={<AppPage />} />
                                <Route path="gallery" element={<GalleryPage />} />
                                <Route path="histories" element={<HistoriesListPage />} />
                                <Route path="histories/new" element={<HistoryEditorPage />} />
                                <Route path="histories/:historyId/edit" element={<HistoryEditorPage />} />
                                <Route path="histories/:historyId" element={<HistoryPreviewPage />} />
                                <Route path="droplet" element={<Styles />} />
                                <Route path="styles" element={<Styles />} />
                                <Route path="analytics" element={<Analytics />} />
                                <Route path="VCard" element={<VCardPage />} />
                                <Route
                                    path="admin"
                                    element={
                                        <PrivateRoute allow={canAccessAdmin}>
                                            <AdminPanel />
                                        </PrivateRoute>
                                    }
                                />
                            </Route>

                            {/* Catch-all: redirección a inicio */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </BrowserRouter>
                </SectionsProvider>
            </PreviewProvider>
        </AuthProvider>
    );
};
export default App;
