import { usePreview } from "../../context/PreviewContext.tsx";

const LivePreviewContent = () => {
    const {
        name,
        description,
        profileImage,
        coverImage,
        socialLinks,
        downloads,
        links,
        selectedTemplate,
        themeColor,
        textBox,
        fontFamily,
        videoUrl,
        videoTitle,
        musicEmbedUrl,
        musicNote,
        socialPost
    } = usePreview();

    const convertToEmbed = (url: string) => {
        if (url.includes('youtube.com/watch?v=')) {
            const videoId = url.split('v=')[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // Puedes agregar más formatos (Vimeo, Twitch) si deseas.
        return url;
    };
    function convertToEmbedUrl(inputUrl: string): string {
        try {
            const url = new URL(inputUrl);

            if (url.hostname.includes("spotify.com")) {
                return url.href.replace("/track/", "/embed/track/");
            }

            if (url.hostname.includes("soundcloud.com")) {
                return `https://w.soundcloud.com/player/?url=${encodeURIComponent(inputUrl)}`;
            }

            if (url.hostname.includes("music.apple.com")) {
                return `https://embed.music.apple.com${url.pathname}`;
            }

            return inputUrl;
        } catch {
            return inputUrl;
        }
    }

    function extractInstagramId(url: string): string {
        const match = url.match(/(?:instagram\.com\/(?:p|reel|tv)\/)([a-zA-Z0-9_-]+)/);
        return match?.[1] || "";
    }


    return (
        <div
            className="rounded-2xl w-[360px] h-[640px] shadow-xl   mx-auto"
            style={{ backgroundColor: themeColor }}
        >
            {/* Plantilla 0: Portada arriba + avatar circular */}
            {selectedTemplate === 0 && (
                <>
                    <div className="relative">
                        {/* Cover */}
                        {coverImage && (
                            <div className="w-full h-36 rounded-t-2xl overflow-hidden shadow-sm">
                                <img
                                    src={coverImage}
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        {/* Profile Image */}
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

                    {/* User Info */}
                    <div className="pt-16 text-center">
                        <h2 className="font-semibold">{name}</h2>
                        <p className="text-sm text-gray-500">{description}</p>
                        <div className="text-xs text-gray-600 mt-1">
                            URL: bio.site/anthonyrmch
                        </div>
                    </div>
                </>
            )}



            {/* Plantilla 1: Dos imágenes superpuestas */}
            {selectedTemplate === 1 && (
                <>
                    <h2
                        className="text-center font-semibold mb-5"
                        style={{ fontFamily }}
                    >
                        {name}
                    </h2>

                    <div className="flex justify-center relative mb-20">
                        <div className="w-36 h-36 bg-gray-300 rotate-[-8deg] absolute left-10 z-10 rounded-md overflow-hidden">
                            {profileImage && (
                                <img
                                    src={profileImage}
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="w-36 h-36 bg-gray-300 rotate-[15deg] absolute right-10 top-5 z-0 rounded-md overflow-hidden">
                            {coverImage && (
                                <img
                                    src={coverImage}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-52">
                        {description}
                    </p>
                    <div className="text-xs text-gray-600 mb-4 text-center">
                        URL: bio.site/anthonyrmch
                    </div>
                </>
            )}

            <div className="flex justify-center gap-3 mt-4 flex-wrap">
                {socialLinks.map((link, index) => (
                    <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
                    >
                        <img
                            src={link.icon}
                            alt={link.name}
                            className="w-5 h-5 object-contain"
                        />
                    </a>
                ))}
            </div>



            <div className="mt-6 text-center">
                <button className="bg-black text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 mx-auto">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    CREATE A FREE BIO SITE
                    <span>→</span>
                </button>
            </div>
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

            {textBox.title && (
                <div className="mt-6 px-4 py-3 bg-gray-100 rounded-md text-center">
                    <h3 className="text-base font-semibold">{textBox.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                        {textBox.description}
                    </p>
                </div>
            )}


            {/* CTA Button */}
            {videoUrl && (
                <div className="mt-6">
                    <div className="text-center text-black font-semibold mb-2">
                        {videoTitle}
                    </div>
                    <div className="aspect-w-16 aspect-h-9 rounded overflow-hidden">
                        <iframe
                            src={convertToEmbed(videoUrl)}
                            frameBorder="0"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            className="w-full h-48 rounded-md"
                            title="Embedded Video"
                        />
                    </div>
                </div>
            )}
            {musicEmbedUrl && (
                <div className="mt-6">
                    <iframe
                        src={convertToEmbedUrl(musicEmbedUrl)}
                        width="100%"
                        height="80"
                        allow="encrypted-media"
                        className="rounded-md"
                    />
                    {musicNote && (
                        <p className="text-xs text-center text-gray-500 mt-1">{musicNote}</p>
                    )}
                </div>
            )}
            {socialPost && socialPost.url && (
                <div className="mt-6 flex justify-center">
                    <iframe
                        src={`https://www.instagram.com/p/${extractInstagramId(socialPost.url)}/embed`}
                        className="w-full rounded-lg"
                        height="500"
                        allowTransparency={true}
                        frameBorder="0"
                    />
                </div>
            )}

        </div>
    );
};

export default LivePreviewContent;
