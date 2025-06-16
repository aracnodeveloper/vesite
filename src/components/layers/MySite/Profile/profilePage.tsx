import React from "react";
import { usePreview } from "../../../../context/PreviewContext";
import { useUpdateBiosite } from "../../../../hooks/useUpdateProfile.ts";
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
        fontFamily,
        themeColor,
        selectedTemplate,
    } = usePreview();

    const { updateBiosite } = useUpdateBiosite();
    const biositeId = Cookies.get("biositeId");
    const role = Cookies.get("role");

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUpdate = async(biositeId: string) => {
        if (!biositeId) return;
try {
  await  updateBiosite({
        title: name,
        slug: name.toLowerCase().replace(/\s+/g, "-"),
        avatarImage: profileImage,
        fonts: fontFamily,
        colors: { primary: themeColor, secondary: "#000000" },
        themeId: null,
        ...(role === "admin" && { backgroundImage: coverImage }),
    });
}catch (error) {
    console.error("Error actualizando biosite", error);
}

    };

    return (
        <div className="p-4 space-y-4">
            <h1 className="text-2xl font-bold">Profile Page</h1>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Name</label>
                <input
                    type="text"
                    className="w-full border rounded p-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    className="w-full border rounded p-2"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium">Profile Image</label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {profileImage && (
                    <img src={profileImage} alt="Preview" className="w-32 h-32 rounded-full object-cover mt-2" />
                )}
            </div>

            <button
                onClick={handleUpdate}
                className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
            >
                Update
            </button>
        </div>
    );
};

export default ProfilePage;
