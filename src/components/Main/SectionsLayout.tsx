import { Outlet } from "react-router-dom";
import {usePreview} from "../../context/PreviewContext.tsx";
import PhonePreview from "../Preview/phonePreview.tsx";
import LivePreviewContent from "../Preview/LivePreviewContent.tsx";

const SectionsLayout = () => {
    const {
        name,
        description,
        profileImage,
        coverImage,
        socialLinks,
        downloads,
    } = usePreview();

    return (
        <div className="flex min-h-screen">
            {/* Panel principal (izquierda) */}
            <div className="flex-1 p-6 overflow-y-auto">
                <Outlet />
            </div>

            {/* Vista previa persistente (derecha) */}
            <div className="w-[400px] p-4 border-l bg-[#fafafa] flex justify-center items-center">
                <PhonePreview>
                    <LivePreviewContent
                        name={name}
                        description={description}
                        profileImage={profileImage}
                        coverImage={coverImage}
                        socialLinks={socialLinks}
                        downloads={downloads}
                    />
                </PhonePreview>
            </div>
        </div>
    );
};

export default SectionsLayout;
