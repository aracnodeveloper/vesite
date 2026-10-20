import { ChevronRight, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useDocuments } from "../hooks/useDocuments";

/** Entrada "Documentos" en la lista de secciones del editor (My VeSite). */
const DocumentsSection = () => {
  const navigate = useNavigate();
  const { documents } = useDocuments(Cookies.get("biositeId"));

  return (
    <div
      className="bg-white/25 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/35"
      onClick={() => navigate("/documents")}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-[#E4572E] rounded-lg flex items-center justify-center">
          <FileText size={16} color="#ffffff" />
        </div>
        <span className="text-black font-medium">Documentos</span>
      </div>

      <div className="flex items-center space-x-2">
        {documents.length > 0 && (
          <span className="text-sm text-black" style={{ fontSize: "11px" }}>
            {documents.length}
          </span>
        )}
        <ChevronRight size={16} className="text-black" />
      </div>
    </div>
  );
};

export default DocumentsSection;
