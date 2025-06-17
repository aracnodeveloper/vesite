
import defaultCover from "../../assets/defaultCover.jpg";
import {usePreview} from "../../context/PreviewContext.tsx";

const LivePreviewContent = () => {
    const { data } = usePreview();

    if (!data) return <p className="text-white text-sm text-center">Cargando preview...</p>;

    const colors =
        typeof data.colors === "string"
            ? JSON.parse(data.colors || "{}")
            : data.colors || { primary: "#000", secondary: "#333" };

    return (
        <div
            className="w-[320px] h-[640px] rounded-2xl overflow-y-auto shadow-xl no-scrollbar py-6"
            style={{
                backgroundColor: colors.primary,
                fontFamily: data.fonts,
                color: "white",
            }}
        >
            {/* Cover image */}
            <div className="h-36 relative -top-9 w-full overflow-hidden mb-4">
                <img
                    src={data.backgroundImage || defaultCover}
                    alt="cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Avatar */}
            <div className="w-28 h-28 relative rounded-full overflow-hidden mx-auto -mt-28 border-4 z-50 border-white shadow-md">
                <img
                    src={data.avatarImage}
                    alt="profile"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Title and Slug */}
            <h2 className="text-center font-semibold mt-2 text-lg">{data.title}</h2>
            <p className="text-center text-sm text-gray-300">{data.slug}</p>

            {/* Links */}
            {data.links?.length > 0 && (
                <div className="mt-6 space-y-3 px-4">
                    {data.links.map((link, idx) => (
                        <a
                            key={link.id || idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full p-3 bg-white rounded-lg text-center text-sm font-medium text-black hover:bg-gray-100 transition"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            )}

            {/* Video */}
            {data.videoUrl && (
                <div className="mt-6 px-4">
                    <iframe
                        width="100%"
                        height="200"
                        src={data.videoUrl}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default LivePreviewContent;
