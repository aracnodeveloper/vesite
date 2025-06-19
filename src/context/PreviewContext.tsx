import { createContext, useContext, useEffect, useState } from "react";
import type { BiositeFull } from "../interfaces/Biosite";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import { useAuthContext } from "../hooks/useAuthContext";

interface PreviewContextType {
    biosite: BiositeFull | null;
    updatePreview: (data: Partial<BiositeFull>) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

export const PreviewProvider = ({ children }: { children: React.ReactNode }) => {
    const { biositeId } = useAuthContext();
    const { biositeData, fetchBiosite } = useFetchBiosite(biositeId || "");
    const [biosite, setBiosite] = useState<BiositeFull | null>(null);

    useEffect(() => {
        if (!biosite) {
            fetchBiosite();
        }
    }, []);

    useEffect(() => {
        if (biositeData) {
            setBiosite(biositeData);
        }
    }, [biositeData]);

    const updatePreview = (data: Partial<BiositeFull>) => {
        setBiosite((prev) => (prev ? { ...prev, ...data } : null));
    };

    return (
        <PreviewContext.Provider value={{ biosite, updatePreview }}>
            {children}
        </PreviewContext.Provider>
    );
};

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) {
        throw new Error("usePreview debe usarse dentro de PreviewProvider");
    }
    return context;
};
