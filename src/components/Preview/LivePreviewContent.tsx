import { usePreview } from "../../context/PreviewContext";
import defaultCover from "../../assets/defaultCover.jpg";

const LivePreviewContent = () => {
    const {
        name,
        description,
        profileImage,
        coverImage,
        socialLinks,
        downloads,
        links,
        textBox,
        musicEmbedUrl,
        videoUrl,
        videoTitle,
        socialPost,
        selectedTemplate,
        fontFamily,
        themeColor,
        views,
        clicks,
    } = usePreview();

    return (
        <div
            className="bg-white rounded-2xl w-[320px] h-[640px] shadow-xl overflow-y-auto px-4 py-6 mx-auto"
            style={{ backgroundColor: themeColor, fontFamily }}
        >
            {/* Template 0: Cover + Circular Profile */}
            {selectedTemplate === 0 && (
                <>
                    <div className="relative">
                        <div className="w-full h-36 rounded-t-2xl overflow-hidden shadow-sm">
                            <img
                                src={coverImage || defaultCover}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {profileImage && (
                            <div className="absolute left-1/2 top-24 transform -translate-x-1/2 w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden z-20 bg-white">
                                <img
                                    src={profileImage}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                    </div>

                    <div className="pt-16 text-center">
                        <h2 className="font-semibold">{name}</h2>
                        <p className="text-sm text-gray-600">{description}</p>
                        <div className="text-xs text-gray-500">URL: bio.site/anthonyrmch</div>
                    </div>
                </>
            )}

            {/* Template 1: Side-rotated images */}
            {selectedTemplate === 1 && (
                <>
                    <h2 className="text-center font-semibold mb-5">{name}</h2>
                    <div className="flex justify-center relative mb-20">
                        <div className="w-36 h-36 bg-gray-300 rotate-[-8deg] absolute left-5 z-10 rounded-md overflow-hidden">
                            {profileImage && <img src={profileImage} className="w-full h-full object-cover" />}
                        </div>
                        <div className="w-36 h-36 bg-gray-300 rotate-[15deg] absolute right-0 top-5 z-0 rounded-md overflow-hidden">
                            <img src={coverImage || defaultCover} className="w-full h-full object-cover" />
                        </div>
                    </div>
                    <p className="text-center text-sm text-gray-600 mt-52">{description}</p>
                </>
            )}

            {/* Social icons */}
            {socialLinks.length > 0 && (
                <div className="flex justify-center gap-3 mt-4 flex-wrap">
                    {socialLinks.map((link, i) => (
                        <a key={i} href={link.url} target="_blank" rel="noreferrer">
                            <img src={link.icon} alt={link.name} className="w-5 h-5 object-contain" />
                        </a>
                    ))}
                </div>
            )}

            {/* Links */}
            {links.length > 0 && (
                <div className="mt-6 space-y-3">
                    {links.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-3 bg-gray-100 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition"
                        >
                            {link.title || link.url}
                        </a>
                    ))}
                </div>
            )}

            {/* Downloads */}
            {downloads.length > 0 && (
                <div className="mt-6">
                    {downloads.map((item, idx) => (
                        <div
                            key={idx}
                            className="bg-orange-100 text-orange-800 text-sm p-3 rounded-md text-center"
                        >
                            {item.title} – ${item.price}
                            <div className="text-xs mt-1">
                                Connect Stripe or PayPal to accept payments
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Text box */}
            {textBox.title && (
                <div className="mt-6 p-4 rounded-md bg-white shadow border border-gray-200 text-center">
                    <h3 className="font-semibold">{textBox.title}</h3>
                    <p className="text-sm text-gray-600">{textBox.description}</p>
                </div>
            )}

            {/* Music embed */}
            {musicEmbedUrl && (
                <div className="mt-6">
                    <iframe
                        src={musicEmbedUrl}
                        className="w-full h-20 rounded-md"
                        allow="autoplay *; encrypted-media *;"
                        loading="lazy"
                    ></iframe>
                </div>
            )}

            {/* Video embed */}
            {videoUrl && (
                <div className="mt-6">
                    <iframe
                        src={videoUrl}
                        className="w-full h-44 rounded-md"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}

            {/* Social post */}
            {socialPost.url && (
                <div className="mt-6">
                    <iframe
                        src={socialPost.url}
                        className="w-full h-64 rounded-md"
                        loading="lazy"
                    ></iframe>
                    {socialPost.note && (
                        <p className="text-sm text-center text-gray-600 mt-2">{socialPost.note}</p>
                    )}
                </div>
            )}

            {/* Views + Clicks */}
            <div className="mt-6 flex justify-center gap-6 text-xs text-gray-500">
                <div>👁 Views: {views}</div>
                <div>🖱 Clicks: {clicks}</div>
            </div>
        </div>
    );
};

export default LivePreviewContent;
