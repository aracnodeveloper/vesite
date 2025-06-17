import  {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
} from "react";
import type { ReactNode } from "react";
import { debounce, isEqual } from "lodash";
import Cookies from "js-cookie";
import { useFetchBiosite } from "../hooks/useFetchBiosite";
import type { BiositeFull } from "../interfaces/Biosite";
import type { BiositeUpdateDto } from "../interfaces/Biosite";

interface PreviewContextType {
    data: BiositeFull;
    setData: <K extends keyof BiositeFull>(key: K, value: BiositeFull[K]) => void;
}

const PreviewContext = createContext<PreviewContextType | null>(null);

export const usePreview = () => {
    const context = useContext(PreviewContext);
    if (!context) {
        throw new Error("usePreview debe usarse dentro de PreviewProvider");
    }
    return context;
};

const defaultBiosite: BiositeFull = {
    id: "",
    ownerId: "",
    title: "",
    slug: "",
    themeId: "0",
    colors: JSON.stringify({ primary: "#000000", secondary: "#000000" }),
    fonts: "Inter",
    avatarImage: "",
    backgroundImage: "",
    videoUrl: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isActive: true,
    links: [],
    owner: {
        id: "",
        email: "",
        password: "",
        role: "USER",
        name: null,
        description: null,
        site: null,
        avatarUrl: null,
        parentId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
    },
};

export const PreviewProvider = ({ children }: { children: ReactNode }) => {
    const { refetch, updateBiosite } = useFetchBiosite();
    const [data, setDataState] = useState<BiositeFull>(defaultBiosite);
    const [prevData, setPrevData] = useState<BiositeFull>(defaultBiosite);

    const biositeId = Cookies.get("biositeId");
    const role = Cookies.get("role");

    const setData = useCallback(<K extends keyof BiositeFull>(key: K, value: BiositeFull[K]) => {
        setDataState((prev) => ({ ...prev, [key]: value }));
    }, []);

    useEffect(() => {
        const load = async () => {
            const res = await refetch();
            if (res) {
                setDataState(res);
                setPrevData(res);
            }
        };
        load();
    }, []);

    const sync = useCallback(
        debounce(async (current: BiositeFull) => {
            if (!biositeId || isEqual(current, prevData)) return;

            try {
                const biositePayload: BiositeUpdateDto = {
                    title: current.title,
                    slug: current.slug,
                    fonts: current.fonts,
                    avatarImage: current.avatarImage,
                    themeId: current.themeId,
                    colors: current.colors,
                    ...(role === "ADMIN" || role === "SUPER_ADMIN"
                        ? { backgroundImage: current.backgroundImage }
                        : {}),
                };

                await updateBiosite(biositePayload);
                setPrevData(current);
            } catch (err) {
                console.error("Error al guardar automáticamente:", err);
            }
        }, 800),
        [biositeId, prevData]
    );

    useEffect(() => {
        sync(data);
        return () => sync.cancel();
    }, [data]);

    return (
        <PreviewContext.Provider value={{ data, setData }}>
            {children}
        </PreviewContext.Provider>
    );
};
