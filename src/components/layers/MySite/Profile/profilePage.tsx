import {usePreview} from "../../../../context/PreviewContext.tsx";
import Cookies from "js-cookie";


const ProfilePage = () => {
    const { data, setData } = usePreview();
    const  role  = Cookies.get('roleName');
    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        key: "avatarImage" | "backgroundImage"
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            if (key === "backgroundImage" && !(role === "ADMIN" || role === "SUPER_ADMIN" || role === "user")) return;

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
                        <img
                            src={data.avatarImage}
                            alt="profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm text-white">
                            No avatar
                        </div>
                    )}

                </label>

                <label
                    className={`flex-1 h-24 bg-gray-800 rounded cursor-pointer `}
                >
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        disabled={!(role === "ADMIN" || role === "SUPER_ADMIN" || role === "user")}
                        onChange={(e) => handleImageChange(e, "backgroundImage")}
                    />

                    {data.backgroundImage ? (
                        <img
                            src={data.backgroundImage}
                            alt="cover"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center text-sm text-white">
                            No cover
                        </div>
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