/**
 * Evento global que se emite cuando el editor guarda un cambio visible en el
 * biosite (links, perfil, estilos, secciones, galería, imágenes...). El
 * preview del teléfono lo escucha para volver a cargar sus datos.
 */
export const BIOSITE_CHANGED_EVENT = "vesite:biosite-changed";

export const notifyBiositeChanged = () => {
    window.dispatchEvent(new Event(BIOSITE_CHANGED_EVENT));
};

export const onBiositeChanged = (listener: () => void): (() => void) => {
    window.addEventListener(BIOSITE_CHANGED_EVENT, listener);
    return () => window.removeEventListener(BIOSITE_CHANGED_EVENT, listener);
};

/** Espera a que termine una escritura y, si fue bien, avisa del cambio. */
export const withBiositeChange = async <T>(request: Promise<T>): Promise<T> => {
    const result = await request;
    notifyBiositeChanged();
    return result;
};
