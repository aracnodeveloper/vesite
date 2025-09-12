import { QRCodeSVG } from "qrcode.react";
import type { BusinessCard, VCardData } from "../../types/V-Card";
import { Building, Globe, Mail, Phone, X } from "lucide-react";

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
    <div className="fixed py-2 inset-0 bg-black/50 flex items-center justify-center p-0 z-50 h-screen min-h-screen">
      <div className="bg-white shadow-2xl rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col justify-between">
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
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <>
          <div className="p-6  text-center bg-gradient-to-br from-gray-50 to-gray-100 flex-1 flex flex-col justify-center">
            <div className="bg-white h-[160px] w-full max-w-[160px] p-4 rounded-xl shadow-md mx-auto flex items-center justify-center">
              <QRCodeSVG
                value={generateVCardString()}
                size={120}
                className="w-full h-auto"
                level="M"
              />
            </div>
            <p className="text-sm mt-3 text-gray-600">
              Escanea para guardar mi contacto
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Presiona agregar para guardar el contacto{" "}
            </p>
          </div>

          <div className="p-6 space-y-4 flex-1 flex flex-col justify-center">
            {cardData.name && (
              <div className="text-center mb-6">
                <h3
                  className="text-2xl font-bold text-gray-800"
                  style={{ fontFamily: themeConfig.fonts.primary }}
                >
                  {cardData.name}
                </h3>
                {cardData.title && (
                  <p className="text-gray-600 mt-1">{cardData.title}</p>
                )}
                {cardData.company && (
                  <p
                    className="text-sm mt-1 font-semibold"
                    style={{ color: themeConfig.colors.primary }}
                  >
                    {cardData.company}
                  </p>
                )}
              </div>
            )}

            <div className="border-t flex w-full justify-center bg-[#96C121]/80">
              <button
                onClick={downloadVCard}
                className="flex items-center justify-center py-4 px-4 gap-2  transition-colors  cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 14 14"
                >
                  <g
                    fill="none"
                    stroke="black"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.5 13.5h-1a1 1 0 0 1-1-1v-8h13v8a1 1 0 0 1-1 1h-1" />
                    <path d="M4.5 11L7 13.5L9.5 11M7 13.5v-6M11.29 1a1 1 0 0 0-.84-.5h-6.9a1 1 0 0 0-.84.5L.5 4.5h13zM7 .5v4" />
                  </g>
                </svg>

                <span className="text-md font-medium text-gray-700">
                  Agregar a contactos
                </span>
              </button>
            </div>

            <div className="space-y-3">
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

              {cardData.company && (
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  <Building className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-1">Empresa</p>
                    <p className="text-sm font-medium text-gray-800">
                      {cardData.company}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}
