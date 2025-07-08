import type {SocialLink} from "../../../interfaces/PreviewContext.ts";

interface ProfileSectionProps {
    isExposedRoute: boolean;
    themeConfig: any;
    validBackgroundImage: string | null;
    validAvatarImage: string | null;
    imageLoadStates: any;
    handleImageLoadStart: (type: string) => void;
    handleImageLoad: (type: string) => void;
    handleImageError: (type: string, originalUrl: string) => void;
    biosite: any;
    title: string;
    description: string;
    user: any;
    realSocialLinks: SocialLink[];
    findPlatformForLink: (link: SocialLink) => any;
    handleSocialClick: (e: React.MouseEvent) => void;
    regularLinksData: any[];
    handleLinksClick: (e: React.MouseEvent) => void;
}

export const ProfileSection = ({
                                   isExposedRoute,
                                   themeConfig,
                                   validBackgroundImage,
                                   validAvatarImage,
                                   imageLoadStates,
                                   handleImageLoadStart,
                                   handleImageLoad,
                                   handleImageError,
                                   biosite,
                                   title,
                                   description,
                                   user,
                                   realSocialLinks,
                                   findPlatformForLink,
                                   handleSocialClick,
                                   regularLinksData,
                                   handleLinksClick
                               }: ProfileSectionProps) => {
    const defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23e5e7eb'/%3E%3Cpath d='M48 20c-8 0-14 6-14 14s6 14 14 14 14-6 14-14-6-14-14-14zM24 72c0-13 11-20 24-20s24 7 24 20v4H24v-4z' fill='%239ca3af'/%3E%3C/svg%3E";

    return (
        <>
            {/* Background Image Section */}
            {isExposedRoute && (
                <div className="relative w-full h-48 flex-shrink-0">
                    {validBackgroundImage ? (
                        <>
                            {imageLoadStates.background === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center"
                                     style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                                         style={{ borderColor: themeConfig.colors.primary }}></div>
                                </div>
                            )}
                            <img
                                src={validBackgroundImage}
                                alt="Background"
                                className="w-full h-72 object-cover"
                                onLoadStart={() => handleImageLoadStart('background')}
                                onLoad={() => handleImageLoad('background')}
                                onError={() => handleImageError('background', biosite.backgroundImage)}
                                style={{
                                    display: imageLoadStates.background === 'error' ? 'none' : 'block'
                                }}
                            />
                            {imageLoadStates.background === 'error' && (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: themeConfig.colors.primary }}
                                >
                                    <div className="text-white text-center p-4">
                                        <div className="mb-2">
                                            <svg className="w-6 h-6 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                            {title || "Tu Biosite"}
                                        </h2>
                                        <p className="text-xs opacity-80">Imagen no disponible</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: themeConfig.colors.primary }}
                        >
                            <div className="text-white text-center p-4">
                                <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                    {title || "Tu Biosite"}
                                </h2>
                                <p className="text-xs opacity-80">Imagen de portada</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!isExposedRoute && (
                <div className="relative w-full h-48 flex-shrink-0">
                    {validBackgroundImage ? (
                        <>
                            {imageLoadStates.background === 'loading' && (
                                <div className="absolute inset-0 flex items-center justify-center"
                                     style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2"
                                         style={{ borderColor: themeConfig.colors.primary }}></div>
                                </div>
                            )}
                            <img
                                src={validBackgroundImage}
                                alt="Background"
                                className="w-full h-full object-cover"
                                onLoadStart={() => handleImageLoadStart('background')}
                                onLoad={() => handleImageLoad('background')}
                                onError={() => handleImageError('background', biosite.backgroundImage)}
                                style={{
                                    display: imageLoadStates.background === 'error' ? 'none' : 'block'
                                }}
                            />
                            {imageLoadStates.background === 'error' && (
                                <div
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ backgroundColor: themeConfig.colors.primary }}
                                >
                                    <div className="text-white text-center p-4">
                                        <div className="mb-2">
                                            <svg className="w-6 h-6 mx-auto opacity-60" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                            {title || "Tu Biosite"}
                                        </h2>
                                        <p className="text-xs opacity-80">Imagen no disponible</p>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center"
                            style={{ backgroundColor: themeConfig.colors.primary }}
                        >
                            <div className="text-white text-center p-4">
                                <h2 className="text-base font-bold" style={{ fontFamily: themeConfig.fonts.primary }}>
                                    {title || "Tu Biosite"}
                                </h2>
                                <p className="text-xs opacity-80">Imagen de portada</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Avatar and Profile Info */}
            <div className="relative pb-8">
                {isExposedRoute && (
                    <div className="flex justify-center -mt-12 relative z-10 mb-4">
                        {validAvatarImage ? (
                            <div className="relative">
                                {imageLoadStates.avatar === 'loading' && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full border-3 border-white w-16 h-16"
                                         style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                             style={{ borderColor: themeConfig.colors.primary }}></div>
                                    </div>
                                )}
                                <img
                                    src={validAvatarImage}
                                    alt="Avatar"
                                    className="w-44 h-44 rounded-full border-3 border-white object-cover shadow-lg"
                                    onLoadStart={() => handleImageLoadStart('avatar')}
                                    onLoad={() => handleImageLoad('avatar')}
                                    onError={() => handleImageError('avatar', biosite.avatarImage)}
                                    style={{
                                        display: imageLoadStates.avatar === 'error' ? 'none' : 'block'
                                    }}
                                />
                                {imageLoadStates.avatar === 'error' && (
                                    <img
                                        src={defaultAvatar}
                                        alt="Avatar placeholder"
                                        className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                                    />
                                )}
                            </div>
                        ) : (
                            <img
                                src={defaultAvatar}
                                alt="Avatar placeholder"
                                className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                            />
                        )}
                    </div>
                )}

                {!isExposedRoute && (
                    <div className="flex justify-center -mt-24 relative z-10 mb-4">
                        {validAvatarImage ? (
                            <div className="relative">
                                {imageLoadStates.avatar === 'loading' && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full border-3 border-white w-16 h-16"
                                         style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                             style={{ borderColor: themeConfig.colors.primary }}></div>
                                    </div>
                                )}
                                <img
                                    src={validAvatarImage}
                                    alt="Avatar"
                                    className="w-24 h-24 rounded-full border-3 border-white object-cover shadow-lg"
                                    onLoadStart={() => handleImageLoadStart('avatar')}
                                    onLoad={() => handleImageLoad('avatar')}
                                    onError={() => handleImageError('avatar', biosite.avatarImage)}
                                    style={{
                                        display: imageLoadStates.avatar === 'error' ? 'none' : 'block'
                                    }}
                                />
                                {imageLoadStates.avatar === 'error' && (
                                    <img
                                        src={defaultAvatar}
                                        alt="Avatar placeholder"
                                        className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                                    />
                                )}
                            </div>
                        ) : (
                            <img
                                src={defaultAvatar}
                                alt="Avatar placeholder"
                                className="w-16 h-16 rounded-full border-3 border-white object-cover shadow-lg"
                            />
                        )}
                    </div>
                )}

                <div className="text-center px-4 mb-4">
                    <h1 className="text-lg font-bold leading-tight"
                        style={{
                            color: themeConfig.colors.text,
                            fontFamily: themeConfig.fonts.primary || themeConfig.fonts.secondary
                        }}>
                        {title || user?.name || "Tu nombre aquí"}
                    </h1>

                    <p className="text-sm mt-2 px-2 leading-relaxed"
                       style={{
                           color: themeConfig.colors.text,
                           opacity: 0.8,
                           fontFamily: themeConfig.fonts.secondary || themeConfig.fonts.primary
                       }}>
                        {description}
                    </p>
                </div>

                {/* Social Links */}
                {realSocialLinks.length > 0 && (
                    <div className="px-4 mb-4">
                        <div className="flex justify-center items-center gap-3 flex-wrap">
                            {realSocialLinks.map((link) => {
                                const platform = findPlatformForLink(link);

                                return (
                                    <a
                                        key={link.id}
                                        href={isExposedRoute ? link.url : undefined}
                                        target={isExposedRoute ? "_blank" : undefined}
                                        rel={isExposedRoute ? "noopener noreferrer" : undefined}
                                        onClick={isExposedRoute ? undefined : handleSocialClick}
                                        className={`w-5 h-5 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
                                        style={{
                                            backgroundColor: 'gray',
                                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                        }}
                                    >
                                        {platform?.icon ? (
                                            <img
                                                src={platform.icon}
                                                alt={link.label}
                                                className="w-4 h-4 filter brightness-0 invert"
                                            />
                                        ) : (
                                            <span className="text-white text-sm">🔗</span>
                                        )}
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Regular Links */}
                {regularLinksData.length > 0 && (
                    <div className="px-4 pb-8 space-y-2">
                        {regularLinksData.map(link => (
                            <a
                                key={link.id}
                                href={isExposedRoute ? link.url : undefined}
                                target={isExposedRoute ? "_blank" : undefined}
                                rel={isExposedRoute ? "noopener noreferrer" : undefined}
                                onClick={isExposedRoute ? undefined : handleLinksClick}
                                className={`  p-3 rounded-lg  text-center transition-all shadow-md flex flex-wrap duration-200  ${!isExposedRoute ? 'cursor-pointer' : ''}`}
                                style={{
                                    transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                                }}
                            >
                                {link.image && (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                        <img
                                            key={link.id}
                                            src={link.image}
                                            alt={link.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                {!link.image && (
                                    <span className="text-xs mr-2">🔗</span>
                                )}
                                <div className="grid grid-cols-1 gap-1">
                                    <div className="flex items-center">
                                        <span className="font-medium text-xs truncate"
                                              style={{
                                                  color: themeConfig.colors.text,
                                                  fontFamily: themeConfig.fonts.primary
                                              }}>
                                            {link.title}
                                        </span>
                                    </div>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};