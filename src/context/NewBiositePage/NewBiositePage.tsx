import { useEffect, useState } from "react";
import apiService from "../../service/apiService";
import type { Section } from "../../interfaces/sections";
import { getSectionsByBiositeApi } from "../../constants/EndpointsRoutes";
import Button from "../../components/shared/Button";
import { useNavigate, useParams } from "react-router-dom";
import type { BiositeFull, BiositeLink, BiositeUpdateDto } from "../../interfaces/Biosite";
import Loading from "../../components/shared/Loading";
import { getThemeConfig, isValidImageUrl } from "../../Utils/biositeUtils";
import {
  AvatarSection,
  BackgroundSection,
  UserInfoSection,
} from "../../components/Preview/LivePreviewComponents";
import { useUser } from "../../hooks/useUser";
import { createOrderedSectionsRecord } from "./recordHelper";
import BiositeSection, { Section_type } from "./BiositeSection";
import ConditionalNavButton from "../../components/ConditionalNavButton";
import VCardModal from "./VCardModal";
import type { VCardData } from "../../types/V-Card";

export default function NewBiositePage({ slug: propSlug }: { slug?: string }) {
  const { slug: paramSlug } = useParams<{ slug: string }>();
  const slug = propSlug || paramSlug;
  const { user } = useUser();
  const [biosite, setBiosite] = useState<BiositeFull>();
  const [parentBiosite, setParentBiosite] = useState<BiositeFull | null>(null);
  const [links, setLinks] = useState<Map<Section_type, BiositeLink[]>>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showVCard, setShowVCard] = useState(false);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const navigate = useNavigate();
  const maxReloadAttempts = 2;
  const storageKey = "biositeReloadAttempts";
  const errorStorageKey = "biositeErrorReloadAttempts";
  const [canStartChecking, setCanStartChecking] = useState(false);

  const [imageLoadStates, setImageLoadStates] = useState<{
    [key: string]: "loading" | "loaded" | "error";
  }>({});

  useEffect(() => {
    if (showVCard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showVCard]);


  const onNavigate = (route: string) => {
    navigate(route);
  };

  // Función para sincronizar el biosite hijo con el padre
  const syncChildWithParent = async (
      childBiosite: BiositeFull,
      parentBiosite: BiositeFull
  ) => {
    if (syncInProgress) return;

    try {
      setSyncInProgress(true);

      // Verificar si necesita sincronización
      const needsSync =
          childBiosite.backgroundImage !== parentBiosite.backgroundImage ||
          JSON.stringify(childBiosite.colors) !== JSON.stringify(parentBiosite.colors);

      if (!needsSync) {
        console.log("Biosite hijo ya está sincronizado con el padre");
        return;
      }

      console.log("Sincronizando biosite hijo con padre...");

      // Preparar los colores del padre
      const parentColors =
          typeof parentBiosite.colors === "string"
              ? parentBiosite.colors
              : JSON.stringify(parentBiosite.colors);

      // Crear el DTO de actualización
      const updateData: BiositeUpdateDto = {
        ownerId: childBiosite.ownerId,
        title: childBiosite.title,
        slug: childBiosite.slug,
        themeId: childBiosite.themeId,
        colors: parentColors,
        fonts: childBiosite.fonts || "Inter",
        backgroundImage: parentBiosite.backgroundImage || "",
        isActive: childBiosite.isActive,
      };

      // Si el hijo tiene avatar, mantenerlo
      if (childBiosite.avatarImage) {
        updateData.avatarImage = childBiosite.avatarImage;
      }

      // Ejecutar actualización
      const updatedBiosite = await apiService.update<BiositeUpdateDto>(
          "/biosites",
          childBiosite.id,
          updateData
      );

      console.log("Sincronización completada exitosamente");

      // Actualizar el estado local con el biosite sincronizado
      if (updatedBiosite) {
        const biositeResult = Array.isArray(updatedBiosite)
            ? updatedBiosite[0]
            : updatedBiosite;

        setBiosite(biositeResult as BiositeFull);
      }
    } catch (error) {
      console.error("Error al sincronizar biosite hijo con padre:", error);
    } finally {
      setSyncInProgress(false);
    }
  };

  useEffect(() => {
    const fetchSections = async () => {
      try {
        setLoading(true);
        if (biosite?.id) {
          const fetchedSections = await apiService.getAll<Section[]>(
              `${getSectionsByBiositeApi}/${biosite.id}`
          );
          let links: Map<Section_type, BiositeLink[]>;

          links = createOrderedSectionsRecord(
              biosite.links,
              fetchedSections,
              propSlug != null,
              onNavigate
          );

          setLinks(links);
        }
      } catch (erro: any) {
        setError("Error al cargar secciones");
      } finally {
        setLoading(false);
      }
    };

    if (biosite?.id) {
      fetchSections();
    }
  }, [biosite, propSlug]);

  useEffect(() => {
    const fetchBiositeBySlug = async () => {
      setLoading(true);
      setError("");

      if (!slug) {
        throw new Error("No se proporcionó un slug válido");
      }

      try {
        const initialBiosite = await apiService.getById<BiositeFull>(
            "/biosites/slug",
            slug
        );

        if (!initialBiosite) {
          throw new Error("Biosite no encontrado");
        }

        const shouldIncludeParent = initialBiosite.owner?.parentId != null;

        if (shouldIncludeParent) {
          const response = await apiService.getAll<BiositeFull[]>(
              `/biosites/slug/${slug}?include_parent=true`
          );

          if (Array.isArray(response) && response.length > 0) {
            const childBiosite = response[0];
            const parentBiosite = response.length > 1 ? response[1] : null;

            setBiosite(childBiosite);
            setParentBiosite(parentBiosite);

            // Sincronizar automáticamente si hay padre
            if (parentBiosite) {
              await syncChildWithParent(childBiosite, parentBiosite);
            }
          } else {
            setBiosite(initialBiosite);
          }
        } else {
          setBiosite(initialBiosite);
          setParentBiosite(null);
        }
      } catch (error: any) {
        const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Error al cargar el biosite";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBiositeBySlug();
  }, [slug]);

  // Efecto adicional para re-sincronizar si el padre cambia
  useEffect(() => {
    if (biosite && parentBiosite && !syncInProgress) {
      const needsSync =
          biosite.backgroundImage !== parentBiosite.backgroundImage ||
          JSON.stringify(biosite.colors) !== JSON.stringify(parentBiosite.colors);

      if (needsSync) {
        syncChildWithParent(biosite, parentBiosite);
      }
    }
  }, [biosite, parentBiosite]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCanStartChecking(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!canStartChecking) return;

    // Lógica para recargar cuando no hay biosite (ya existente)
    if (!loading && !biosite) {
      const currentAttempts = parseInt(
          localStorage.getItem(storageKey) || "0",
          10
      );

      if (currentAttempts >= maxReloadAttempts) {
        console.log("Máximo de recargas alcanzado, navegando a /login");
        localStorage.removeItem(storageKey);
        navigate("/login");
        return;
      }

      const newAttempts = currentAttempts + 1;
      localStorage.setItem(storageKey, newAttempts.toString());
      console.log(`Intento de recarga ${newAttempts} de ${maxReloadAttempts}`);

      const timer = setTimeout(() => {
        window.location.reload();
      }, 100);

      return () => clearTimeout(timer);
    } else if (biosite) {
      localStorage.removeItem(storageKey);
    }

    // Nueva lógica para recargar cuando hay error
    if (!loading && error) {
      const currentErrorAttempts = parseInt(
          localStorage.getItem(errorStorageKey) || "0",
          10
      );

      if (currentErrorAttempts >= maxReloadAttempts) {
        console.log("Máximo de recargas por error alcanzado");
        localStorage.removeItem(errorStorageKey);
        return; // Mostrar el mensaje de error sin más recargas
      }

      const newErrorAttempts = currentErrorAttempts + 1;
      localStorage.setItem(errorStorageKey, newErrorAttempts.toString());
      console.log(`Intento de recarga por error ${newErrorAttempts} de ${maxReloadAttempts}`);

      const timer = setTimeout(() => {
        window.location.reload();
      }, 300); // Espera 1 segundo antes de recargar

      return () => clearTimeout(timer);
    } else if (!error) {
      localStorage.removeItem(errorStorageKey);
    }
  }, [loading, biosite, error, navigate, canStartChecking]);

  const isExposedRoute =
      propSlug != null || window.location.pathname === `/${biosite?.slug}`;

  const handleUserInfoClick = (e: React.MouseEvent) => {
    if (isExposedRoute) {
      e.preventDefault();
      navigate("/profile");
    }
  };

  if (loading || syncInProgress) {
    return <Loading />;
  }

  if (error) {
    return (
        <div className="min-h-screen text-center bg-gray-100 flex items-center justify-center">
          <div>
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Biosite no encontrado
            </h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => (window.location.href = "/")}>
              Ir al inicio
            </Button>
          </div>
        </div>
    );
  }

  // Usar siempre los datos actualizados del biosite (ya sincronizado)
  const themeConfig = getThemeConfig(biosite);

  // Usar la imagen de fondo del biosite actual (ya sincronizada)
  const validBackgroundImage =
      biosite?.backgroundImage && isValidImageUrl(biosite.backgroundImage)
          ? biosite.backgroundImage
          : null;

  const validAvatarImage = isValidImageUrl(biosite?.avatarImage)
      ? biosite?.avatarImage
      : null;

  const defaultAvatar =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

  const description = biosite?.owner?.description;

  const getCardData = (): VCardData => {
    return {
      name: biosite?.owner?.name || "",
      title: biosite?.owner?.description || "",
      company: biosite?.owner?.site || "",
      email: biosite?.owner?.email || "",
      phone: biosite?.owner?.phone || "",
      website: biosite?.owner?.site || "",
    };
  };

  return (
      <>
        <div
            className={`w-full h-full flex items-center justify-center`}
            style={{
              background: themeConfig.colors.background.startsWith("linear-gradient")
                  ? themeConfig.colors.background
                  : themeConfig.colors.background,
              backgroundColor: themeConfig.colors.background.startsWith(
                  "linear-gradient"
              )
                  ? undefined
                  : themeConfig.colors.background,
              fontFamily: themeConfig.fonts.primary,
              color: themeConfig.colors.text,
            }}
        >
          <div className={`w-full max-w-full min-h-screen mx-auto`}>
            <BackgroundSection
                isExposedRoute={isExposedRoute}
                validBackgroundImage={validBackgroundImage}
                imageLoadStates={imageLoadStates}
                handleImageLoad={setImageLoadStates}
                biosite={biosite}
                themeConfig={themeConfig}
                handleImageClick={handleUserInfoClick}
            />

            <AvatarSection
                isExposedRoute={isExposedRoute}
                validAvatarImage={validAvatarImage}
                imageLoadStates={imageLoadStates}
                handleImageLoad={setImageLoadStates}
                biosite={biosite}
                themeConfig={themeConfig}
                defaultAvatar={defaultAvatar}
                handleImageClick={handleUserInfoClick}
            />

            <div className={`w-full max-w-md mx-auto`}>
              <UserInfoSection
                  biosite={biosite}
                  user={user}
                  description={description}
                  themeConfig={themeConfig}
                  handleUserInfoClick={handleUserInfoClick}
              />
            </div>
            <div className="flex flex-col gap-y-2 max-w-[550px] mx-auto justify-center p-4 -mt-2">
              <>
                {links &&
                    Array.from(links.entries()).map(([sectionId, sectionLinks]) => (
                        <BiositeSection
                            isPreview={isExposedRoute}
                            isPublicView={!isExposedRoute}
                            themeConfig={themeConfig}
                            key={sectionId}
                            section={sectionId}
                            links={sectionLinks}
                            vcard={{
                              avatar: validAvatarImage,
                              background: validBackgroundImage,
                              onClick: () => setShowVCard(true),
                            }}
                        />
                    ))}

                <ConditionalNavButton themeConfig={themeConfig} />
              </>
            </div>
          </div>
        </div>
        {showVCard && (
            <VCardModal
                cardData={getCardData()}
                themeConfig={themeConfig}
                onClose={() => setShowVCard(false)}
            />
        )}
      </>
  );
}