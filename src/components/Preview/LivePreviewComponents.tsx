import type {BiositeThemeConfig} from "../../interfaces/Biosite.ts";

import imgP from "../../../public/img/Banner.jpg"
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

// Template 1: Layout por defecto (circular con fondo completo)
export const BackgroundSection = ({
                                      isExposedRoute,
                                      validBackgroundImage,
                                      imageLoadStates,
                                      handleImageLoadStart,
                                      handleImageLoad,
                                      handleImageError,
                                      biosite,
                                      themeConfig
                                  }: any) => (
    <div className={`relative w-full flex-shrink-0 ${isExposedRoute ? 'h-96' : 'h-48'}`}>
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
                                  defaultAvatar
                              }: any) => (
    <div className={`flex justify-center ${isExposedRoute ? '-mt-44' : '-mt-24'} relative z-10 mb-4`}>
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
                                           defaultAvatar
                                       }: any) => (
    <div className="flex justify-center items-center gap-4 px-4 mb-6 mt-6">
        {/* Primera imagen cuadrada (Avatar) */}
        <div className="relative">
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

export const UserInfoSection = ({ biosite, user, description, themeConfig }: any) => (
    <div className="text-center px-4 mb-4">
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
                                       themeConfig
                                   }: any) => (
    realSocialLinks.length > 0 && (
        <div className="px-4 mb-4">
            <div className="flex justify-center items-center gap-3 flex-wrap">
                {realSocialLinks.map((link: any) => {
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
                                    className="w-4 h-4 filter text-black brightness-0 invert"
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

export const WhatsAppSection = ({
                                    whatsAppLink,
                                    whatsAppData,
                                    isExposedRoute,
                                    themeConfig
                                }: any) => {
    console.log('WhatsApp Section Debug:', {
        hasWhatsAppLink: !!whatsAppLink,
        hasWhatsAppData: !!whatsAppData,
        whatsAppData: whatsAppData,
        isExposedRoute
    });

    // Solo mostrar si hay enlace de WhatsApp y datos válidos
    if (!whatsAppLink || !whatsAppData || (!whatsAppData.phone && !whatsAppData.message)) {
        console.log('WhatsApp section not shown - missing data');
        return null;
    }

    return (
        <div className="px-4 mb-4">
            <a
                href={isExposedRoute ? whatsAppLink.url : undefined}
                target={isExposedRoute ? "_blank" : undefined}
                rel={isExposedRoute ? "noopener noreferrer" : undefined}
                className={`w-full p-3 rounded-lg text-center shadow-lg transition-all duration-200 hover:shadow-md flex items-center justify-center space-x-3 ${!isExposedRoute ? 'cursor-pointer' : ''}`}
                style={{
                    backgroundColor: '#25D366', // Color verde de WhatsApp
                    color: 'white',
                    transform: themeConfig.isAnimated ? 'scale(1)' : 'none'
                }}
                onClick={isExposedRoute ? undefined : (e) => {
                    e.preventDefault();
                    // En modo preview, abrir WhatsApp directamente
                    if (whatsAppLink.url) {
                        window.open(whatsAppLink.url, '_blank');
                    }
                }}
            >
                {/* Icono de WhatsApp */}
                <div className="flex-shrink-0">
                    <svg
                        className="w-6 h-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                </div>

                {/* Contenido del botón */}
                <div className="flex-1 text-left">
                    <div className="font-medium text-sm">
                        {whatsAppLink.label || 'WhatsApp'}
                    </div>
                    {whatsAppData.message && (
                        <div className="text-xs opacity-90 truncate">
                            {whatsAppData.message.length > 40
                                ? `${whatsAppData.message.substring(0, 40)}...`
                                : whatsAppData.message
                            }
                        </div>
                    )}
                    {whatsAppData.phone && (
                        <div className="text-xs opacity-75">
                            {whatsAppData.phone}
                        </div>
                    )}
                </div>

                {/* Flecha */}
                <div className="flex-shrink-0">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            </a>
        </div>
    );
};
export const RegularLinksSection = ({
                                        regularLinksData,
                                        isExposedRoute,
                                        handleLinksClick,
                                        themeConfig
                                    }: any) => (
    regularLinksData.length > 0 && (
        <div className="px-4 pb-8 space-y-2">
            {regularLinksData.map((link: any) => (
                <a
                    key={link.id}
                    href={isExposedRoute ? link.url : undefined}
                    target={isExposedRoute ? "_blank" : undefined}
                    rel={isExposedRoute ? "noopener noreferrer" : undefined}
                    onClick={isExposedRoute ? undefined : handleLinksClick}
                    className={`w-full p-2 rounded-lg bg-white text-center shadow-lg transition-all flex flex-wrap duration-200 hover:shadow-md ${!isExposedRoute ? 'cursor-pointer' : ''}`}
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
            ))}
        </div>
    )
);