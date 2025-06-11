import { ChevronLeft, Image, Upload, X } from "lucide-react";
import { useState, useRef } from "react";
import {useNavigate} from "react-router-dom";



const ProfilePage = () => {
    const [name, setName] = useState("Anthonyr");
    const [description, setDescription] = useState("");
    const [url, setUrl] = useState("bio.site/anthonyrmch");
    const [selectedDesign, setSelectedDesign] = useState("Minimal");
    const [minimalClicked, setMinimalClicked] = useState(false);
    const [creativeClicked, setCreativeClicked] = useState(false);


    const [profileImage, setProfileImage] = useState(null);
    const [coverImage, setCoverImage] = useState(null);


    const profileInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const designs = [
        { name: "Minimalista", preview: "minimal-preview.png" },
    ];


    const handleProfileImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };


    const handleCoverImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setCoverImage(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProfileImage = () => {
        setProfileImage(null);
        if (profileInputRef.current) {
            profileInputRef.current.value = '';
        }
    };

    const removeCoverImage = () => {
        setCoverImage(null);
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    };
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1); // Regresa a la página anterior
        // si quieres ir específicamente al dashboard: navigate('/sections');
    };


    return (
        <div className="max-w-2xl mx-auto p-4">
            {/* Header */}
            <div className="flex items-center mb-8">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors"
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Profile
                </button>
            </div>

            {/* Images Section */}
            <div className="mb-8">
                <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                    IMAGES
                </h3>
                <div className="flex space-x-4">
                    {/* Profile Image */}
                    <div className="relative w-24 h-24">
                        <div
                            className="w-full h-full bg-[#2a2a2a] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#323232] transition-colors overflow-hidden"
                            onClick={() => profileInputRef.current?.click()}
                        >
                            {profileImage ? (
                                <img
                                    src={profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Image size={20} className="text-gray-500 mb-1" />
                                    <Upload size={12} className="text-gray-500" />
                                </div>
                            )}
                        </div>
                        {/* Botón para eliminar imagen de perfil */}
                        {profileImage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeProfileImage();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                        <input
                            ref={profileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                        />
                    </div>

                    {/* Cover Image */}
                    <div className="relative flex-1">
                        <div
                            className="w-full h-24 bg-[#2a2a2a] rounded-lg flex items-center justify-center cursor-pointer hover:bg-[#323232] transition-colors overflow-hidden"
                            onClick={() => coverInputRef.current?.click()}
                        >
                            {coverImage ? (
                                <img
                                    src={coverImage}
                                    alt="Cover"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Image size={20} className="text-gray-500 mb-1" />
                                    <Upload size={12} className="text-gray-500" />
                                    <span className="text-xs text-gray-500 mt-1">Cover Image</span>
                                </div>
                            )}
                        </div>
                        {/* Botón para eliminar imagen de portada */}
                        {coverImage && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeCoverImage();
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        )}
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                        />
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Haz clic en las áreas para cargar imágenes (JPG, PNG, GIF)
                </p>
            </div>

            {/* About Section */}
            <div className="mb-8">
                <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                    ABOUT
                </h3>
                <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                            NAME
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-white px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-600"
                            placeholder="Enter your name"
                        />
                    </div>
                    {/* Description Field */}
                    <div>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#2a2a2a] text-gray-400 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-600 h-24 resize-none"
                            placeholder="Add Description"
                        />
                    </div>
                </div>
            </div>

            {/* Site Section */}
            <div className="mb-8">
                <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                    SITE
                </h3>
                <div className="bg-[#2a2a2a] rounded-lg p-4 flex items-center justify-between">
                    <div className="flex-1">
                        <label className="block text-gray-400 text-xs uppercase tracking-wider mb-2">
                            URL
                        </label>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full bg-transparent text-white focus:outline-none"
                            placeholder="Enter URL"
                        />
                    </div>
                    <span className="text-gray-400 text-sm ml-4">Public</span>
                </div>
            </div>

            {/* Design Section */}
            <div className="mb-8">
                <h3 className="text-gray-300 text-sm font-medium mb-4 uppercase tracking-wider">
                    DESIGN
                </h3>
                <div className="flex space-x-4 mb-4">
                    {designs.map((design) => (
                        <button
                            key={design.name}
                            onClick={() => setSelectedDesign(design.name)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                selectedDesign === design.name
                                    ? "bg-white text-black"
                                    : "bg-[#2a2a2a] text-gray-300 hover:bg-[#323232]"
                            }`}
                        >
                            {design.name}
                        </button>
                    ))}
                </div>

                {/* Design Previews */}
                <div className="flex space-x-4">
                    {/* Minimal Preview */}
                    <div
                        className="w-24 h-48 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors"
                        onClick={() => setMinimalClicked(!minimalClicked)}
                    >
                        {!minimalClicked ? (
                            <img src='/src/assets/img/img_2.png' alt="Minimal design 1" className="w-full h-full object-contain "/>
                        ) : (
                            <img src='/src/assets/img/img_1.png' alt="Minimal design 2" className="w-full h-full object-contain  "/>
                        )}
                    </div>

                    {/* Creative Preview */}
                    <div
                        className="w-24 h-48 bg-[#1a1a1a] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors"
                        onClick={() => setCreativeClicked(!creativeClicked)}
                    >
                        {!creativeClicked ? (
                            <img src='/src/assets/img/img_4.png' alt="Creative design 1" className="w-full h-full object-contain"/>
                        ) : (
                            <img src='/src/assets/img/img_3.png' alt="Creative design 2" className="w-full h-full object-contain"/>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;