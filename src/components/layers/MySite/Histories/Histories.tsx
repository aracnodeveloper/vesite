import { ChevronRight, CirclePlay } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Histories = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/histories")}
      className="w-full bg-white/25 rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-white/35"
    >
      <span className="flex items-center space-x-3">
        <span className="w-8 h-8 bg-[#F2647C] rounded-lg flex items-center justify-center">
          <CirclePlay size={18} className="text-white" />
        </span>
        <span className="text-black font-medium">Historias</span>
      </span>
      <ChevronRight size={16} className="text-black" />
    </button>
  );
};

export default Histories;
