import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {usePreview} from "../../../../context/PreviewContext.tsx";

const TextBoxPage = () => {
    const navigate = useNavigate();
    const { textBox, setTextBox } = usePreview();

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className="max-w-2xl mt-20 text-white min-h-screen p-6">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Text Box
                </button>
            </div>

            {/* Inputs */}
            <div className=" w-full space-y-10">
                <div>
                    <label className="text-xs text-gray-400 block mb-1">
                        TITLE & DESCRIPTION
                    </label>
                    <input
                        type="text"
                        placeholder="Add Title"
                        value={textBox.title}
                        onChange={(e) =>
                            setTextBox((prev) => ({ ...prev, title: e.target.value }))
                        }
                        className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md placeholder:text-gray-500 focus:outline-none"
                    />
                </div>
                <div>
          <textarea
              placeholder="Write a detailed description"
              value={textBox.description}
              onChange={(e) =>
                  setTextBox((prev) => ({ ...prev, description: e.target.value }))
              }
              className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-md h-40 placeholder:text-gray-500 focus:outline-none"
          />
                </div>
            </div>
        </div>
    );
};

export default TextBoxPage;
