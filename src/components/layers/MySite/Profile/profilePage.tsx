import { ChevronLeft, ImagePlus } from "lucide-react";
import { useRef, useState } from "react";

import img_1 from "../../../../assets/img/img_1.png";
import img_2 from "../../../../assets/img/img_2.png";
import img_3 from "../../../../assets/img/img_3.png";
import img_4 from "../../../../assets/img/img_4.png";
import { usePreview } from "../../../../context/PreviewContext.tsx";
import {useNavigate} from "react-router-dom";

const ProfilePage = () => {
    const {
        name,
        setName,
        description,
        setDescription,
        profileImage,
        setProfileImage,
        coverImage,
        setCoverImage,
        selectedTemplate,
        setSelectedTemplate,
    } = usePreview();

    const [minimalClicked, setMinimalClicked] = useState(false);
    const [creativeClicked, setCreativeClicked] = useState(false);
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(-1);
    };

    const profileInputRef = useRef<HTMLInputElement>(null);
    const coverInputRef = useRef<HTMLInputElement>(null);

    const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    setProfileImage(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result;
                if (typeof result === "string") {
                    setCoverImage(result);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4 text-white">
            {/* Header */}
            <div className="flex items-center mb-6">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer" >
                    <ChevronLeft size={16} className="mr-2" />
                    Profile
                </button>
            </div>

            {/* IMAGES */}
            <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">IMAGES</p>
                <div className="flex gap-4">
                    {/* Profile Image */}
                    <div
                        className="w-24 h-24 bg-[#1a1a1a] rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => profileInputRef.current?.click()}
                    >
                        {profileImage ? (
                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <ImagePlus size={20} className="text-gray-400" />
                        )}
                        <input
                            ref={profileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            hidden
                        />
                    </div>

                    {/* Cover Image */}
                    <div
                        className="flex-1 h-24 bg-[#1a1a1a] rounded-md flex items-center justify-center cursor-pointer"
                        onClick={() => coverInputRef.current?.click()}
                    >
                        {coverImage ? (
                            <img src={coverImage} alt="Cover" className="w-full h-full object-cover rounded-md" />
                        ) : (
                            <ImagePlus size={20} className="text-gray-400" />
                        )}
                        <input
                            ref={coverInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            hidden
                        />
                    </div>
                </div>
            </div>

            {/* ABOUT */}
            <div className="space-y-4 mb-6">
                <p className="text-xs text-gray-400">ABOUT</p>
                <input
                    className="bg-[#1a1a1a] w-full p-3 rounded-md text-white placeholder-gray-400"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <textarea
                    className="bg-[#1a1a1a] w-full p-3 rounded-md text-white placeholder-gray-400"
                    placeholder="Add a description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            {/* SITE */}
            <div className="mb-6">
                <p className="text-xs text-gray-400 mb-2">SITE</p>
                <div className="bg-[#1a1a1a] flex items-center justify-between p-3 rounded-md text-sm">
                    <span>bio.site/anthonyrmch</span>
                    <span className="text-gray-400 text-xs">Public</span>
                </div>
            </div>

            {/* DESIGN */}
            <div className="mb-2">
                <p className="text-xs text-gray-400 mb-2">DESIGN</p>

                {/* Buttons row */}
                <div className="flex gap-2 mb-4">
                    <button className="bg-white text-black text-xs font-medium px-4 py-1 rounded-full">Minimal</button>
                    <button className="bg-[#1a1a1a] text-white text-xs font-medium px-4 py-1 rounded-full">Creative</button>
                    <button className="bg-[#1a1a1a] text-white text-xs font-medium px-4 py-1 rounded-full">Bold</button>
                </div>

                {/* Template selector */}
                <div className="flex gap-4">
                    {/* Minimal Template */}
                    <div
                        onClick={() => {
                            setMinimalClicked(!minimalClicked);
                            setSelectedTemplate(0);
                        }}
                        className={`w-24 h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors ${
                            selectedTemplate === 0 ? "border-2 border-white" : "border-2 border-transparent"
                        }`}
                    >
                        <img
                            src={minimalClicked ? img_2 : img_1}
                            alt="Minimal Template"
                            className="w-full h-full object-cover rounded-md"
                        />
                    </div>

                    {/* Creative Template */}
                    <div
                        onClick={() => {
                            setCreativeClicked(!creativeClicked);
                            setSelectedTemplate(1);
                        }}
                        className={`w-24 h-48 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors ${
                            selectedTemplate === 1 ? "border-2 border-white" : "border-2 border-transparent"
                        }`}
                    >
                        <img
                            src={creativeClicked ? img_4 : img_3}
                            alt="Creative Template"
                            className="w-full h-full object-cover rounded-md"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
