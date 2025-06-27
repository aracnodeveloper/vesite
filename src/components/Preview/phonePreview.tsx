import type { FC, ReactNode } from "react";
import "./phonePreview.css";

interface PhonePreviewProps {
    children: ReactNode;
    className?: string;
    title?: string;
}

const PhonePreview: FC<PhonePreviewProps> = ({
                                                 children,
                                                 className = "",
                                                 title = "Vista previa móvil"
                                             }) => {
    return (
        <div className={`phone-frame ${className}`} role="region" aria-label={title}>
            <div className="phone-container">
                <div className="phone-screen">
                    <div className="phone-content">
                        <div className="biosite-wrapper">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PhonePreview;
