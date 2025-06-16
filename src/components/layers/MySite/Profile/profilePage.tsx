import React, { useEffect } from "react";
import { usePreview } from "../../../../context/PreviewContext";
import defaultCover from "../../../../assets/defaultCover.jpg";
import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUpdateProfile } from "../../../../hooks/useUpdateProfile";
import {useGetBiosite} from "../../../../hooks/useFetchBiosite.ts";
import Cookies from "js-cookie";

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

    const role = Cookies.get('roleName');
    const isAdmin = role === "admin";
    const navigate = useNavigate();
    const { updateProfile } = useUpdateProfile();
    const { fetchBiosite } = useGetBiosite();

    useEffect(() => {
        fetchBiosite().then(data => {
            if (!data) return;
            setName(data.title || "");
            setDescription(data.slug || "");
            setProfileImage(data.avatarImage || "");
            setSelectedTemplate(Number(data.themeId ?? 0));

        });
    }, [ ]);

    const handleImageUpload = (
        e: React.ChangeEvent<HTMLInputElement>,
        callback: (url: string) => void
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => callback(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleBackClick = () => navigate(-1);

    const handleSave = () => {
        updateProfile({
            title: name,
            slug: description,
            avatarImage: profileImage,
            themeId: String(selectedTemplate),
        });
    };

    return (
        <div className="space-y-8 text-white px-4 pb-10">
            <div className="flex items-center mb-4 mt-3">
                <button
                    onClick={handleBackClick}
                    className="flex items-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ChevronLeft size={16} className="mr-2" />
                    Profile
                </button>
            </div>

            {/* Images */}
            <div className="space-y-2">
                <h3 className="text-xs text-gray-400">IMAGES</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-[#2a2a2a] h-28 flex items-center justify-center cursor-pointer relative">
                        {profileImage ? (
                            <img src={profileImage} className="object-cover h-full w-full rounded-xl" alt="profile" />
                        ) : (
                            <i className="fa-regular fa-image text-xl text-gray-500" />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute opacity-0 w-full h-full cursor-pointer"
                            onChange={(e) => handleImageUpload(e, setProfileImage)}
                        />
                    </div>

                    <div className="rounded-xl bg-[#2a2a2a] h-28 flex items-center justify-center relative">
                        <img
                            src={coverImage || defaultCover}
                            className="object-cover h-full w-full rounded-xl"
                            alt="cover"
                        />
                        {isAdmin && (
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute opacity-0 w-full h-full cursor-pointer"
                                onChange={(e) => handleImageUpload(e, setCoverImage)}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* About */}
            <div className="space-y-2">
                <h3 className="text-xs text-gray-400">ABOUT</h3>
                <div className="bg-[#2a2a2a] rounded-xl px-4 py-3">
                    <label className="text-xs text-gray-500 block mb-1">NAME</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full bg-transparent text-white text-sm outline-none"
                    />
                </div>

                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add Description"
                    className="w-full bg-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none"
                />
            </div>

            {/* Site */}
            <div className="space-y-2">
                <h3 className="text-xs text-gray-400">SITE</h3>
                <div className="flex items-center justify-between bg-[#2a2a2a] rounded-xl px-4 py-3">
          <span className="text-white text-sm font-medium">
            bio.site/{name.toLowerCase()}
          </span>
                    <span className="text-xs text-gray-400">Public</span>
                </div>
            </div>

            {/* Design */}
            <div className="space-y-2">
                <h3 className="text-xs text-gray-400">DESIGN</h3>
                <div className="bg-white text-black rounded-xl px-4 py-2 text-center font-medium text-sm">
                    Minimal
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    {[0, 1].map((template) => (
                        <button
                            key={template}
                            onClick={() => setSelectedTemplate(template)}
                            className={clsx(
                                "rounded-xl overflow-hidden border",
                                selectedTemplate === template
                                    ? "border-white ring-2 ring-white"
                                    : "border-transparent"
                            )}
                        >
                            <img
                                src={
                                    template === 0
                                        ? "/assets/img/69489b9c-a460-4c68-8001-f6ce35f1c3cb.png"
                                        : "/assets/img/02fd1de7-cb7f-403e-b538-abc10d6774c1.png"
                                }
                                alt={`template-${template}`}
                                className="h-48 w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                <button
                    onClick={handleSave}
                    className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium w-full"
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default ProfilePage;
