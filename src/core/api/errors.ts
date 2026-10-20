/**
 * Extrae el mensaje más útil de un error de axios (mensaje del backend,
 * luego el del propio error) o devuelve el texto por defecto.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
    const err = error as { response?: { data?: { message?: string } }; message?: string } | null;
    return err?.response?.data?.message || err?.message || fallback;
};
