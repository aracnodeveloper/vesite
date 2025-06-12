import {usePreview} from "../../context/PreviewContext.tsx";


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
    } = usePreview();

    return (
        <div className="bg-white rounded-2xl w-[320px] h-[640px] shadow-xl overflow-y-auto px-4 py-6 mx-auto">
            {/* URL Display */}
            <div className="text-xs text-gray-600 mb-4 text-center">
                URL: bio.site/anthonyrmch
            </div>

            {/* Plantilla 0: Portada arriba + avatar circular */}
            {selectedTemplate === 0 && (
                <>
                    {coverImage && (
                        <div className="h-24 w-full bg-gray-200 rounded-md overflow-hidden mb-4">
                            <img
                                src={coverImage}
                                alt="cover"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {profileImage && (
                        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto -mt-10 border-4 border-white shadow-md">
                            <img
                                src={profileImage}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    <h2 className="text-center font-semibold mt-2">{name}</h2>
                    <p className="text-center text-sm text-gray-500">{description}</p>
                </>
            )}

            {/* Plantilla 1: Dos imágenes superpuestas */}
            {selectedTemplate === 1 && (
                <>
                    <h2 className="text-center font-semibold mb-2">{name}</h2>

                    <div className="flex justify-center relative mb-2">
                        <div className="w-16 h-16 bg-gray-300 rotate-[-8deg] absolute left-12 z-0 rounded-md overflow-hidden">
                            {coverImage && (
                                <img
                                    src={coverImage}
                                    alt="cover"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                        <div className="w-16 h-16 bg-gray-300 rotate-[8deg] absolute left-20 z-10 rounded-md overflow-hidden">
                            {profileImage && (
                                <img
                                    src={profileImage}
                                    alt="profile"
                                    className="w-full h-full object-cover"
                                />
                            )}
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-14">
                        {description}
                    </p>
                </>
            )}

            {/* Social icons */}
            {socialLinks.length > 0 && (
                <div className="flex justify-center gap-3 mt-4">
                    {socialLinks.map((link, index) => (
                        <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-black text-xl"
                        >
                            <i className={`fa-brands fa-${link.icon}`}></i>
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
                            {link.name || link.url}
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

            {/* CTA Button */}
            <div className="mt-6 text-center">
                <button className="bg-black text-white text-sm px-4 py-2 rounded-full flex items-center gap-2 mx-auto">
                    <span className="w-2 h-2 rounded-full bg-white" />
                    CREATE A FREE BIO SITE
                    <span>→</span>
                </button>
            </div>
        </div>
    );
};

export default LivePreviewContent;
