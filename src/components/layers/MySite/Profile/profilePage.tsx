import {usePreview} from "../../../../context/PreviewContext.tsx";
import {useAuthContext} from "../../../../hooks/useAuthContext.ts";


const ProfilePage = () => {
    const { data, setData } = usePreview();
    const { role } = useAuthContext();
    const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: "avatarImage" | "backgroundImage"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (key === "backgroundImage" && !isAdmin) return;
            setData(key, reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6 p-4 text-white max-w-md">
            <h2 className="text-xl font-semibold">Profile</h2>

            <div className="flex gap-4">
                <label className="w-24 h-24 bg-gray-800 flex items-center justify-center rounded cursor-pointer">
                    <input type="file" accept="image/*" hidden onChange={(e) => handleImageChange(e, "avatarImage")} />
                    {data.avatarImage ? (
                        <img src={data.avatarImage} className="w-full h-full object-cover rounded" />
                    ) : (
                        <span className="text-sm text-gray-400">Avatar</span>
                    )}
                </label>

                <label
                    className={`flex-1 h-24 bg-gray-800 rounded cursor-pointer ${!isAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={!isAdmin}
                        onChange={(e) => handleImageChange(e, "backgroundImage")}
                    />
                    {data.backgroundImage ? (
                        <img src={data.backgroundImage} className="w-full h-full object-cover rounded" />
                    ) : (
                        <span className="text-sm text-gray-400 flex justify-center items-center h-full">Cover</span>
                    )}
                </label>
            </div>

            <div>
                <label className="block text-sm">Name</label>
                <input
                    className="w-full bg-gray-900 text-white p-2 rounded"
                    value={data.title}
                    onChange={(e) => setData("title", e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm">Slug</label>
                <input
                    className="w-full bg-gray-900 text-white p-2 rounded"
                    value={data.slug}
                    onChange={(e) => setData("slug", e.target.value)}
                />
            </div>
        </div>
    );
};

export default ProfilePage;