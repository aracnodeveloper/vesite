// AppDownloadButtons.tsx (puede estar en el mismo archivo o uno separado)
export const AppDownloadButtons = () => {
    const appStoreUrl = "https://apps.apple.com/us/app/visitaecuador-com/id1385161516?ls=1";
    const googlePlayUrl = "https://play.google.com/store/apps/details?id=com.visitaEcuador&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1&pli=1";

    return (
        <div className="flex flex-wrap  lg:flex-row gap-2 w-full max-w-md  mx-auto">
            <a
                href={appStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black hover:bg-gray-800 ml-2 transition-colors flex-col  rounded-lg p-0 flex items-center space-x-1 border border-gray-600"
            >
                {/* SVG App Store */}
                <div className="flex-shrink-0">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                </div>
                <div className="flex-1 text-left">
                    <div className="text-lg font-semibold text-white">App Store</div>
                </div>
            </a>

            <a
                href={googlePlayUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-black hover:bg-gray-800 transition-colors mr-2 rounded-lg p-0 flex flex-col items-center space-x-1 border border-gray-600"
            >
                {/* SVG Google Play */}
                <div className="flex-shrink-0">
                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <defs>
                            <linearGradient id="playGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00D4FF"/>
                                <stop offset="100%" stopColor="#0080FF"/>
                            </linearGradient>
                            <linearGradient id="playGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FFCE00"/>
                                <stop offset="100%" stopColor="#FF8C00"/>
                            </linearGradient>
                            <linearGradient id="playGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF0080"/>
                                <stop offset="100%" stopColor="#FF0040"/>
                            </linearGradient>
                            <linearGradient id="playGradient4" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#40FF00"/>
                                <stop offset="100%" stopColor="#00C000"/>
                            </linearGradient>
                        </defs>
                        <path d="M3,20.5V3.5c0-0.6,0.4-1,1-1c0.2,0,0.3,0,0.4,0.1l11,8.5c0.4,0.3,0.5,0.8,0.2,1.2c-0.1,0.1-0.1,0.2-0.2,0.2l-11,8.5 C4.1,21.1,3.5,21,3.1,20.6C3,20.6,3,20.5,3,20.5z" fill="url(#playGradient1)"/>
                        <path d="M20,12L15.5,9.5l-11-8.5C4.8,0.8,5.2,0.8,5.5,1l11.5,8.9C18.3,10.6,19.3,11.3,20,12z" fill="url(#playGradient2)"/>
                        <path d="M20,12c-0.7,0.7-1.7,1.4-3,2.1L5.5,23c-0.3,0.2-0.7,0.2-1,0l11-8.5L20,12z" fill="url(#playGradient3)"/>
                        <path d="M15.5,14.5L4.5,21c-0.2,0.1-0.4,0.1-0.6,0C4.1,20.9,4.2,20.7,4.4,20.5L15.5,9.5l4.5,2.5L15.5,14.5z" fill="url(#playGradient4)"/>
                    </svg>
                </div>
                <div className="flex-1 text-left">
                    <div className="text-lg font-semibold text-white">Google Play</div>
                </div>
            </a>
        </div>
    );
};
