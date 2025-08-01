import type {BiositeThemeConfig} from "../../interfaces/Biosite.ts";

export const LoadingComponent = ({ themeConfig }: { themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full p-5 flex items-center justify-center"
         style={{
             backgroundColor: themeConfig.colors.background,
             fontFamily: themeConfig.fonts.primary
         }}>
        <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2"
                 style={{ borderColor: themeConfig.colors.primary }}></div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                Cargando...
            </p>
        </div>
    </div>
);

export const ErrorComponent = ({ error, themeConfig }: { error: string, themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full flex items-center justify-center"
         style={{ backgroundColor: themeConfig.colors.background }}>
        <div className="text-center p-4">
            <div className="mb-2" style={{ color: '#ef4444' }}>
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            </div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                {error}
            </p>
        </div>
    </div>
);

const DEFAULT_BACKGROUND = "https://visitaecuador.com/bio-api/img/image-1753208386348-229952436.jpeg";

export const NoBiositeComponent = ({ themeConfig }: { themeConfig: BiositeThemeConfig }) => (
    <div className="w-full h-full flex items-center justify-center"
         style={{ backgroundColor: themeConfig.colors.background }}>
        <div className="text-center p-4">
            <div className="mb-2" style={{ color: themeConfig.colors.text, opacity: 0.6 }}>
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" clipRule="evenodd" />
                </svg>
            </div>
            <p className="text-sm" style={{ color: themeConfig.colors.text }}>
                No hay biosite disponible
            </p>
        </div>
    </div>
);

export const BackgroundSection = ({
                                      isExposedRoute,
                                      validBackgroundImage,
                                      imageLoadStates,
                                      handleImageLoadStart,
                                      handleImageLoad,
                                      handleImageError,
                                      biosite,
                                      themeConfig,
                                      handleImageClick
                                  }: any) => (
    <div className={`relative w-full flex-shrink-0 ${isExposedRoute ? 'h-96' : 'h-48'} ${!isExposedRoute ? 'cursor-pointer' : ''}`}
         onClick={handleImageClick}>
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
                    className={`w-full object-cover ${isExposedRoute ? 'h-full' : 'h-full'}`}
                    onLoadStart={() => handleImageLoadStart('background')}
                    onLoad={() => handleImageLoad('background')}
                    onError={() => handleImageError('background', biosite.backgroundImage)}
                    style={{
                        display: imageLoadStates.background === 'error' ? 'none' : 'block',
                        clipPath: 'ellipse(100% 80% at 50% 0%)',
                    }}
                />
                {imageLoadStates.background === 'error' && (
                    <div
                        className="w-full h-full flex items-center justify-center"
                        style={{
                            backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >

                    </div>
                )}
            </>
        ) : (
            <div
                className="w-full h-full flex items-center justify-center"
                style={{
                    backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    clipPath: 'ellipse(100% 80% at 50% 0%)',
                }}
            >

            </div>
        )}
    </div>
);

export const AvatarSection = ({
                                  isExposedRoute,
                                  validAvatarImage,
                                  imageLoadStates,
                                  handleImageLoadStart,
                                  handleImageLoad,
                                  handleImageError,
                                  biosite,
                                  themeConfig,
                                  defaultAvatar,
                                  handleImageClick
                              }: any) => (

    <div className={`flex justify-center ${isExposedRoute ? '-mt-44' : '-mt-24'} relative z-10 mb-4 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
         onClick={handleImageClick}>
        {validAvatarImage ? (
            <div className="relative">
                {imageLoadStates.avatar === 'loading' && (
                    <div className={`absolute inset-0 flex items-center justify-center rounded-full border-3 border-white ${isExposedRoute ? 'w-16 h-16' : 'w-16 h-16'}`}
                         style={{ backgroundColor: themeConfig.colors.profileBackground }}>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                             style={{ borderColor: themeConfig.colors.primary }}></div>
                    </div>
                )}
                <img
                    src={validAvatarImage }
                    alt="Avatar"
                    className={`${isExposedRoute ? 'w-44 h-44' : 'w-24 h-24'} rounded-full border-3 border-white object-cover shadow-lg`}
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
                className="w-20 h-20 rounded-full border-3 border-white object-cover shadow-lg mt-5"
            />
        )}

    </div>
);

// Template 2: Layout con dos imágenes cuadradas
export const TwoSquareImagesSection = ({
                                           isExposedRoute,
                                           validBackgroundImage,
                                           validAvatarImage,
                                           imageLoadStates,
                                           handleImageLoadStart,
                                           handleImageLoad,
                                           handleImageError,
                                           biosite,
                                           themeConfig,
                                           defaultAvatar,
                                           handleImageClick
                                       }: any) => (
    <div className="flex justify-center items-center gap-4 px-4 mb-6 mt-6">
        {/* Primera imagen cuadrada (Avatar) */}
        <div className={`relative ${!isExposedRoute ? 'cursor-pointer' : ''}`}
             onClick={handleImageClick}>
            {validAvatarImage ? (
                <>
                    {imageLoadStates.avatar === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg w-32 h-32">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                 style={{ borderColor: themeConfig.colors.primary }}></div>
                        </div>
                    )}
                    <img
                        src={validAvatarImage}
                        alt="Avatar"
                        className="w-32 h-32 rounded-lg object-cover shadow-lg"
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
                            className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        />
                    )}
                </>
            ) : (
                <img
                    src={defaultAvatar}
                    alt="Avatar placeholder"
                    className="w-32 h-32 rounded-lg object-cover shadow-lg"
                />
            )}

        </div>

        {/* Segunda imagen cuadrada (Background) */}
        <div className="relative">
            {validBackgroundImage ? (
                <>
                    {imageLoadStates.background === 'loading' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 rounded-lg w-32 h-32">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2"
                                 style={{ borderColor: themeConfig.colors.primary }}></div>
                        </div>
                    )}
                    <img
                        src={validBackgroundImage}
                        alt="Background"
                        className="w-32 h-32 rounded-lg object-cover shadow-lg"
                        onLoadStart={() => handleImageLoadStart('background')}
                        onLoad={() => handleImageLoad('background')}
                        onError={() => handleImageError('background', biosite.backgroundImage)}
                        style={{
                            display: imageLoadStates.background === 'error' ? 'none' : 'block'
                        }}
                    />
                    {imageLoadStates.background === 'error' && (
                        <div className="w-32 h-32 rounded-lg flex items-center justify-center shadow-lg"
                             style={{
                                 backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                                 backgroundSize: 'cover',
                                 backgroundPosition: 'center',
                                 backgroundRepeat: 'no-repeat'
                             }}>
                            <div className="text-white text-center p-2 bg-black bg-opacity-50 rounded">
                                <svg className="w-6 h-6 mx-auto opacity-60 mb-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                                <p className="text-xs opacity-80">No disponible</p>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="w-32 h-32 rounded-lg flex items-center justify-center shadow-lg"
                     style={{
                         backgroundImage: `url(${DEFAULT_BACKGROUND})`,
                         backgroundSize: 'cover',
                         backgroundPosition: 'center',
                         backgroundRepeat: 'no-repeat'
                     }}>
                    <div className="text-white text-center p-2 bg-black bg-opacity-50 rounded">
                        <svg className="w-6 h-6 mx-auto opacity-60 mb-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs opacity-80">Portada</p>
                    </div>
                </div>
            )}
        </div>
    </div>
);

export const UserInfoSection = ({ biosite, user, description, themeConfig, isExposedRoute, handleUserInfoClick }: any) => (
    <div className={`text-center px-4 mb-4 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
         onClick={handleUserInfoClick}>
        <h1 className="text-lg font-bold leading-tight"
            style={{
                color: themeConfig.colors.text,
                fontFamily: themeConfig.fonts.primary || themeConfig.fonts.secondary
            }}>
            {biosite.title || user?.name || "Tu nombre aquí"}
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
);

export const SocialLinksSection = ({
                                       realSocialLinks,
                                       isExposedRoute,
                                       findPlatformForLink,
                                       handleSocialClick,
                                       themeConfig,
                                       handleSocialLinkClick // Nueva prop para manejar clics con analytics
                                   }: any) => (
    realSocialLinks.length > 0 && (
        <div className="px-4 mb-4">
            <div className="flex justify-center items-center gap-3 flex-wrap">
                {realSocialLinks.map((link: any) => {
                    const platform = findPlatformForLink(link);

                    return isExposedRoute ? (
                        // En vista pública, usar handleSocialLinkClick si está disponible
                        <button
                            key={link.id}
                            onClick={() => handleSocialLinkClick ? handleSocialLinkClick(link.id, link.url) : window.open(link.url, '_blank')}
                            className="w-5 h-5 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                            style={{
                                transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                            }}
                        >
                            {platform?.icon ? (
                                <img
                                    src={platform.icon}
                                    alt={link.label}
                                    className="w-4 h-4 filter text-black"
                                    style={{color:'black'}}
                                />
                            ) : (
                                <span className="text-white text-sm">🔗</span>
                            )}
                        </button>
                    ) : (
                        // En modo preview, usar el handler original
                        <a
                            key={link.id}
                            href={undefined}
                            onClick={handleSocialClick}
                            className="w-5 h-5 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                            style={{
                                transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                            }}
                        >
                            {platform?.icon ? (
                                <img
                                    src={platform.icon}
                                    alt={link.label}
                                    className="w-4 h-4 filter text-black"
                                    style={{color:'black'}}
                                />
                            ) : (
                                <span className="text-white text-sm">🔗</span>
                            )}
                        </a>
                    );
                })}
            </div>
        </div>
    )
);

const placeholderLinkImage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23f3f4f6' rx='6'/%3E%3Cpath d='M10 10h20v20H10z' fill='%23d1d5db'/%3E%3Ccircle cx='16' cy='16' r='3' fill='%239ca3af'/%3E%3Cpath d='M12 28l8-6 8 6H12z' fill='%239ca3af'/%3E%3C/svg%3E";



export const RegularLinksSection = ({
                                        regularLinksData,
                                        isExposedRoute,
                                        handleLinksClick,
                                        themeConfig,
                                        handleLinkClick // Nueva prop para manejar clics con analytics
                                    }: any) => (
    regularLinksData.length > 0 && (
        <div className="px-4 pb-8 space-y-2">
            {regularLinksData.map((link: any) => {

                const handleClick = (e: React.MouseEvent) => {
                    e.preventDefault();
                    if (isExposedRoute && handleLinkClick) {
                        // En vista pública con analytics
                        handleLinkClick(link.id, link.url);
                    } else if (isExposedRoute) {
                        // En vista pública sin analytics
                        window.open(link.url, '_blank');
                    } else {
                        // En modo preview
                        handleLinksClick && handleLinksClick();
                    }
                };

                return isExposedRoute ? (
                    <button
                        key={link.id}
                        onClick={handleClick}
                        className="w-full p-2 rounded-lg bg-white text-center shadow-lg transition-all flex flex-wrap duration-200 hover:shadow-md cursor-pointer"
                        style={{
                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                        }}
                    >
                        {link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={link.image}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {!link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={placeholderLinkImage}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center">
                                <span className="font-medium text-xs truncate">
                                    {link.title}
                                </span>
                            </div>
                        </div>
                    </button>
                ) : (
                    <a
                        key={link.id}
                        href={undefined}
                        onClick={handleLinksClick}
                        className="w-full p-2 rounded-lg bg-white text-center shadow-lg transition-all flex flex-wrap duration-200 hover:shadow-md cursor-pointer"
                        style={{
                            transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                        }}
                    >
                        {link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    key={link.id}
                                    src={link.image}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        {!link.image && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden mr-2 flex-shrink-0">
                                <img
                                    src={placeholderLinkImage}
                                    alt={link.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-1 gap-1">
                            <div className="flex items-center">
                                <span className="font-medium text-xs truncate">
                                    {link.title}
                                </span>
                            </div>
                        </div>
                    </a>
                );
            })}
        </div>
    )
);