import { useState, useEffect } from "react";
import { useBusinessCard } from "../../../../hooks/useVCard.ts";
import { useUser } from "../../../../hooks/useUser.ts";
import { Edit, Save, X } from "lucide-react";
import { useParams } from "react-router-dom";
import Cookies from "js-cookie";
import Loading from "../../../shared/Loading.tsx";
import BackButton from "../../../shared/BackButton.tsx";
import VCardComponent from "../../../../context/NewBiositePage/VCardComponent.tsx";
import type { VCardData } from "../../../../types/V-Card.ts";
import Button from "../../../shared/Button.tsx";

const VCardPage = () => {
  const { slug } = useParams<{ slug?: string }>();
  const [isEditing, setIsEditing] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [vcardData, setVCardData] = useState<VCardData>();
  const [cardData, setCardData] = useState({
    name: "",
    title: "",
    company: "",
    email: "",
    phone: "",
    website: "",
  });

  const {
    businessCard,
    loading,
    error,
    createBusinessCard,
    fetchBusinessCardBySlug,
    fetchBusinessCardByUserId,
    updateBusinessCard,
    regenerateQRCode,
    generarBusinessQR,
  } = useBusinessCard();

  const {
    user,
    loading: userLoading,
    error: userError,
    fetchUser,
    updateUser,
  } = useUser();

  const currentUserId = Cookies.get("userId");

  // Función auxiliar para obtener el email correcto
  const getUserEmail = (user: any): string => {
    if (!user) return "";
    
    // Verificar si el campo email contiene un email válido
    if (user.email && user.email.includes("@")) {
      return user.email;
    }
    
    // Si no, verificar si cedula contiene el email
    if (user.cedula && user.cedula.includes("@")) {
      return user.cedula;
    }
    
    return "";
  };

  useEffect(() => {
    const loadData = async () => {
      if (slug) {
        await fetchBusinessCardBySlug(slug);
      } else if (currentUserId) {
        await fetchBusinessCardByUserId(currentUserId);
        await fetchUser(currentUserId);
      }
      setInitialLoad(false);
    };

    loadData();
  }, [slug, currentUserId]);

  useEffect(() => {
    const syncAndUpdateCard = async () => {
      if (
        user &&
        businessCard &&
        !slug &&
        businessCard.id &&
        !isEditing &&
        !loading
      ) {
        try {
          const parsedData =
            typeof businessCard.data === "string"
              ? JSON.parse(businessCard.data)
              : businessCard.data || {};

          // Obtener el email correcto del usuario
          const userEmail = getUserEmail(user);

          const syncedData = {
            ...parsedData,
            name: parsedData.name || user.name || "",
            phone: user.phone || parsedData.phone || "",
            email: parsedData.email || userEmail,
            website: parsedData.website || user.site || "",
          };

          const hasChanges =
            JSON.stringify(parsedData) !== JSON.stringify(syncedData);

          if (hasChanges) {
            setCardData(syncedData);

            try {
              await updateBusinessCard(businessCard.id, {
                ownerId: currentUserId,
                data: JSON.stringify(syncedData),
                isActive: true,
              });
              console.log(
                "Business card actualizada automáticamente con datos del usuario"
              );
            } catch (updateError) {
              console.error(
                "Error actualizando business card automáticamente:",
                updateError
              );
            }
          } else {
            setCardData(syncedData);
          }
        } catch (error) {
          console.error("Error syncing user data with VCard:", error);
        }
      }
    };

    syncAndUpdateCard();
  }, [
    user?.phone,
    user?.name,
    user?.site,
    user?.email,
    user?.cedula, // Agregado para detectar cambios en cedula
    businessCard?.id,
    slug,
    isEditing,
    currentUserId,
    initialLoad,
  ]);

  useEffect(() => {
    const autoGenerateQR = async () => {
      if (!initialLoad && !slug && currentUserId && businessCard && !loading) {
        if (!businessCard.qrCodeUrl) {
          try {
            console.log("Auto-generando QR code...");
            await regenerateQRCode(currentUserId);
          } catch (error) {
            console.error("Error auto-generando QR:", error);

            try {
              await generarBusinessQR(currentUserId);
            } catch (fallbackError) {
              console.error("Error en fallback QR:", fallbackError);
            }
          }
        }
      }
    };

    autoGenerateQR();
  }, [businessCard, initialLoad, slug, currentUserId, loading]);

  useEffect(() => {
    if (businessCard?.data) {
      const parsedData =
        typeof businessCard.data === "string"
          ? JSON.parse(businessCard.data)
          : businessCard.data;

      setVCardData(parsedData);
    }
  }, [businessCard, user]);

  const handleCreateCard = async () => {
    try {
      await createBusinessCard(currentUserId);

      setTimeout(async () => {
        try {
          await regenerateQRCode(currentUserId);
        } catch (error) {
          console.error("Error generando QR después de crear tarjeta:", error);
          // Fallback
          try {
            await generarBusinessQR(currentUserId);
          } catch (fallbackError) {
            console.error(
              "Error en fallback después de crear tarjeta:",
              fallbackError
            );
          }
        }
      }, 500);
    } catch (error) {
      console.error("Error creating business card:", error);
    }
  };

  const handleSave = async () => {
    if (!businessCard || !currentUserId) return;

    try {
      await updateBusinessCard(businessCard.id, {
        ownerId: currentUserId,
        data: JSON.stringify(cardData),
        isActive: true,
      });

      const userUpdateData: any = {};

      if (cardData.phone && cardData.phone !== user?.phone) {
        userUpdateData.phone = cardData.phone;
      }
      if (cardData.name && cardData.name !== user?.name) {
        userUpdateData.name = cardData.name;
      }
      if (cardData.website && cardData.website !== user?.site) {
        userUpdateData.site = cardData.website;
      }
      
      // Actualizar el email en el campo correcto
      if (cardData.email && cardData.email !== getUserEmail(user)) {
        // Si el usuario tiene email en el campo email, actualizar ahí
        if (user?.email && user.email.includes("@")) {
          userUpdateData.email = cardData.email;
        } 
        // Si el usuario tiene email en cedula, actualizar ahí
        else if (user?.cedula && user.cedula.includes("@")) {
          userUpdateData.cedula = cardData.email;
        }
        // Si no tiene email en ninguno, usar el campo email por defecto
        else {
          userUpdateData.email = cardData.email;
        }
      }

      if (Object.keys(userUpdateData).length > 0 && !slug) {
        await updateUser(currentUserId, userUpdateData);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating business card:", error);
    }
  };

  const handleSaveAndGenerate = async () => {
    try {
      await handleSave();
      await handleGenerate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error en handleSaveAndGenerate:", error);
    }
  };

  const handleGenerate = async () => {
    try {
      await generarBusinessQR(currentUserId);
    } catch (error) {
      console.error("Error de capa 8", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setCardData((prev) => ({ ...prev, [field]: value }));
  };

  const isLoading = loading || userLoading;

  if (isLoading && initialLoad) {
    return <Loading />;
  }

  if (error && !businessCard) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">No tienes una V-Card</h2>
            <p className="text-gray-600 mb-6">
              Crea tu primera tarjeta digital
            </p>
            <button
              onClick={handleCreateCard}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
            >
              Crear V-Card
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
      <div className="w-full h-full mb-10 mt-0 lg:mt-20 p-2 max-w-md mx-auto">
      {/* Header - Solo en desktop */}
      <div className="lg:block p-4 flex items-center justify-between">
        <div className="px-6 py-4 border-b border-gray-700">
          <BackButton text={"VCard"} />
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 w-full max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
          {/* Header móvil - Solo visible en móvil */}
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              title="Editar"
              className="flex flex-wrap items-center gap-1 p-2 hover:bg-gray-100 cursor-pointer"
            >
              <Edit size={20} />
              <span className="text-xs">Editar</span>
            </button>
          )}
          {vcardData && !isEditing && <VCardComponent cardData={vcardData} />}

          {/* Card Info */}
          {isEditing && (
            <div className="space-y-4 p-5">
              <input
                type="text"
                placeholder="Nombre completo"
                value={cardData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Título/Posición"
                value={cardData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Empresa"
                value={cardData.company}
                onChange={(e) => handleInputChange("company", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                placeholder="Email"
                value={cardData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="tel"
                placeholder="Teléfono"
                value={cardData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="url"
                placeholder="Sitio web"
                value={cardData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="flex gap-x-5 justify-start">
                <Button disabled={isLoading} onClick={handleSaveAndGenerate}>
                  <Save size={18} />
                  <span className="text-xs">GUARDAR</span>
                </Button>
                <Button variant="secondary" onClick={handleSaveAndGenerate}>
                  <X size={18} />
                  <span className="text-xs">CERRAR</span>
                </Button>
              </div>
            </div>
          )}

          {/* User sync status */}
          {userError && !slug && (
            <div className="bg-yellow-50 p-4 border-t">
              <p className="text-sm text-yellow-800">
                Advertencia: No se pudo sincronizar con el perfil de usuario
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VCardPage;