import React, { useRef, useState } from "react";

interface ImageInputProps {
  value?: File | null;
  initialSrc?: string;
  onChange: (file: File | null) => void;
  placeholder?: string;
  name?: string;
  maxHeight?: number;
  square?: boolean;
}

const ImageInput: React.FC<ImageInputProps> = ({
                                                 value,
                                                 initialSrc,
                                                 onChange,
                                                 placeholder = "Haz clic para subir una imagen",
                                                 name,
                                                 maxHeight,
                                                 square,
                                               }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialSrc || null);

  React.useEffect(() => {
    if (value && value instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(value);
    } else if (initialSrc) {
      setPreview(initialSrc);
    } else {
      setPreview(null);
    }
  }, [value, initialSrc]);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
      <div className="w-full">
        <input
            type="file"
            name={name}
            accept="image/*"
            ref={inputRef}
            style={{ display: "none" }}
            onChange={handleChange}
        />
        {preview ? (
            <div
                style={{
                  maxHeight: maxHeight
                      ? `${maxHeight}px`
                      : undefined
                }}
                className={`relative group cursor-pointer overflow-hidden bg-white rounded-xl ${
                    square ? "aspect-square" : ""
                } touch-manipulation`}
                onClick={handleClick}
            >
              <img
                  src={preview}
                  alt="Preview"
                  className="preview-image rounded-xl w-full h-full object-cover transition-all duration-300 group-hover:brightness-75 group-hover:scale-105 group-active:scale-95"
              />
              {/* Overlay de hover/touch */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 group-active:bg-black/50 transition-all duration-300 rounded-xl flex items-center justify-center">
            <span className="text-white opacity-0 text-2xl sm:text-3xl font-medium group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300">
              +
            </span>
              </div>
            </div>
        ) : (
            <div
                className="upload-area border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-300 touch-manipulation min-h-[120px] sm:min-h-[150px] flex items-center justify-center"
                onClick={handleClick}
            >
              <div className="flex flex-col items-center space-y-2">
                <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                  <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors duration-300 px-2">
              {placeholder}
            </span>
              </div>
            </div>
        )}
      </div>
  );
};

export default ImageInput;