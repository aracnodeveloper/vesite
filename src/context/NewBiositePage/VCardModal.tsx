import { QRCodeSVG } from "qrcode.react";
import type { VCardData } from "../../types/V-Card";
import { Globe, Mail, Phone, X, Contact2 } from "lucide-react";

export default function VCardModal({
  cardData,
  themeConfig,
  onClose,
}: {
  cardData: VCardData;
  themeConfig: any;
  onClose: () => void;
}) {
  const generateVCardString = () => {
    const vcard = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${cardData.name || "Sin nombre"}`,
      `N:${
        cardData.name
          ? cardData.name.split(" ").reverse().join(";")
          : "Sin;nombre"
      }`,
      `TITLE:${cardData.title || ""}`,
      `ORG:${cardData.company || ""}`,
      `EMAIL;TYPE=INTERNET:${cardData.email || ""}`,
      `TEL;TYPE=CELL:${cardData.phone || ""}`,
      `URL:${cardData.website || ""}`,
      "END:VCARD",
    ].join("\r\n");

    return vcard;
  };

  const downloadVCard = () => {
    const vcard = generateVCardString();
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(cardData.name || "contacto").replace(/\s+/g, "_")}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed py-2 inset-0 bg-black/50 flex items-start justify-center p-0 z-50 h-screen min-h-screen">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full max-h-[90vh] mx-2 flex flex-col min-h-0 justify-between">
        <div className="flex items-center justify-between p-3 border-b">
          <h2
            className="text-xl font-bold text-black"
            style={{ fontFamily: themeConfig.fonts.primary }}
          >
            Mi Tarjeta Digital
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X size={25} className="text-gray-600" />
          </button>
        </div>

        <div className="p-4 sm:p-6 text-center bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
          <div className="bg-white h-[120px] sm:h-[160px] w-full max-w-[120px] sm:max-w-[160px] p-2 sm:p-4 rounded-xl shadow-md mx-auto flex items-center justify-center">
            <QRCodeSVG
              value={generateVCardString()}
              size={120}
              className="w-full h-auto"
              level="M"
              aria-label={`Código QR para descargar la tarjeta de contacto de ${
                cardData.name || "contacto"
              }`}
              title="Escanea este código QR para agregar el contacto a tu teléfono"
            />
          </div>

          <div className="flex w-full justify-center py-4">
            <button
              onClick={downloadVCard}
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-white border border-gray-200 shadow hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              aria-label={`Descargar archivo vCard de ${
                cardData.name || "contacto"
              }`}
              title="Descarga el archivo .vcf para agregar a tus contactos"
            >
              <Contact2
                size={20}
                className="text-[#96C121]"
                aria-hidden="true"
              />
              <span className="text-md font-semibold ">Agregar contacto</span>
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2 mb-4">
            Escanea el código QR o usa el botón para agregar contacto
          </p>
        </div>
        <div className="p-4 gap-y-2 min-h-0 flex-1 overflow-y-auto flex flex-col justify-center">
          {cardData.name && (
            <div className="text-center grid gap-y-1 sm:gap-y-2 my-2 sm:my-3 px-2 [@media(max-height:700px)]:mt-20 md:mt-2">
              <h3
                className="text-lg sm:text-2xl  font-bold text-gray-800"
                style={{ fontFamily: themeConfig.fonts.primary }}
              >
                {cardData.name}
              </h3>
              {cardData.title && (
                <p className="text-sm sm:text-base text-gray-600">
                  {cardData.title}
                </p>
              )}
              {cardData.company && (
                <p
                  className="text-xs sm:text-sm font-semibold"
                  style={{ color: themeConfig.colors.primary }}
                >
                  {cardData.company}
                </p>
              )}
            </div>
          )}
          {cardData.email && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <a
                  href={`mailto:${cardData.email}`}
                  className="text-sm font-medium text-gray-800 hover:text-blue-600 transition-colors break-all"
                >
                  {cardData.email}
                </a>
              </div>
            </div>
          )}

          {cardData.phone && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Phone className="w-5 h-5 text-green-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Teléfono</p>
                <a
                  href={`tel:${cardData.phone}`}
                  className="text-sm font-medium text-gray-800 hover:text-green-600 transition-colors"
                >
                  {cardData.phone}
                </a>
              </div>
            </div>
          )}

          {cardData.website && (
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
              <Globe className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">Website</p>
                <a
                  href={
                    cardData.website.startsWith("http")
                      ? cardData.website
                      : `https://${cardData.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-gray-800 hover:text-purple-600 transition-colors break-all"
                >
                  {cardData.website}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
