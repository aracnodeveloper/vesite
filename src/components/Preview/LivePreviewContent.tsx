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
    } = usePreview();

    return (
        <div
            className="rounded-2xl w-[320px] h-[640px] shadow-xl overflow-y-auto px-4 py-6 mx-auto no-scrollbar"
            style={{ backgroundColor: themeColor }}
        >
            {selectedTemplate === 0 && (
                <>
                    <div className="h-32 relative -top-9 w-full rounded-md overflow-hidden mb-4">
                        <img
                            src={coverImage || defaultCover}
                            alt="cover"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {profileImage && (
                        <div className="w-28 h-28 relative rounded-full overflow-hidden mx-auto -mt-14 border-4 z-50 border-white shadow-md">
                            <img
                                src={profileImage}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <h2
                        className="text-center font-semibold mt-2 text-lg"
                        style={{ fontFamily }}
                    >
                        {name}
                    </h2>
                    <p className="text-center text-sm text-gray-600">{description}</p>
                </>
            )}

            {selectedTemplate === 1 && (
                <>
                    <h2
                        className="text-center font-semibold mb-4 text-lg"
                        style={{ fontFamily }}
                    >
                        {name}
                    </h2>

                    <div className="flex justify-center relative mb-20">
                        <div className="w-36 h-36 rotate-[-8deg] absolute left-5 z-10 rounded-md overflow-hidden">
                            {profileImage && (
                                <img
                                    src={profileImage}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="w-36 h-36 rotate-[15deg] absolute right-5 top-5 z-0 rounded-md overflow-hidden">
                            <img
                                src={coverImage || defaultCover}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-52">
                        {description}
                    </p>
                </>
            )}

            {socialLinks?.length > 0 && (
                <div className="flex justify-center gap-3 mt-4">
                    {socialLinks.map(
                        (
                            link: { name: string; url: string; icon?: string },
                            idx: number
                        ) => (
                            <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-black text-xl"
                            >
                                <i className={`fa-brands fa-${link.icon}`} />
                            </a>
                        )
                    )}
                </div>
            )}

            {links?.length > 0 && (
                <div className="mt-6 space-y-3">
                    {links.map((link, idx) => (
                        <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block p-3 bg-white rounded-lg text-center text-sm font-medium hover:bg-gray-100 transition"
                        >
                            {link.title || link.url}
                        </a>
                    ))}
                </div>
            )}

            {downloads?.length > 0 && (
                <div className="mt-6 space-y-3">
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

            {textBox?.title && (
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm text-sm">
                    <h3 className="font-semibold text-base mb-1">{textBox.title}</h3>
                    <p className="text-gray-600">{textBox.description}</p>
                </div>
            )}

            {musicEmbedUrl && (
                <div className="mt-6">
                    <iframe
                        src={musicEmbedUrl}
                        width="100%"
                        height="80"
                        allow="autoplay"
                        className="rounded"
                    ></iframe>
                </div>
            )}

            {videoUrl && (
                <div className="mt-6 space-y-1">
                    {videoTitle && <p className="font-semibold text-sm">{videoTitle}</p>}
                    <iframe
                        width="100%"
                        height="200"
                        src={videoUrl}
                        frameBorder="0"
                        allowFullScreen
                        className="rounded"
                    ></iframe>
                </div>
            )}

            {socialPost?.url && (
                <div className="mt-6">
                    <iframe
                        src={socialPost.url}
                        className="w-full h-64 rounded"
                        allow="autoplay; encrypted-media"
                    ></iframe>
                    {socialPost.note && (
                        <p className="text-sm text-gray-700 mt-2">{socialPost.note}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default LivePreviewContent;
