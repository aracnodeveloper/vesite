import type { FC, ReactNode } from "react";
import "./phonePreview.css";

const PhonePreview: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <div className="phone-frame">
            <div className="phone-screen">{children}</div>
        </div>
    );
};

export default PhonePreview;
