import { useState, useCallback } from "react";
import { historyService } from "../service/historyService";
import type { HistoryItem, CreateHistoryDto, UpdateHistoryDto } from "../interfaces/History";

export const useHistory = () => {
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener todo el historial de un Biosite
    const fetchHistoryByBiosite = useCallback(async (biositeId: string): Promise<HistoryItem[]> => {
        if (!biositeId) return [];

        setLoading(true);
        setError(null);

        try {
            const data = await historyService.listByBiosite(biositeId);
            setHistoryItems(data);
            return data;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error fetching history";
            setError(errorMessage);
            console.error("Error fetching history:", err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear un nuevo registro
    const createHistory = useCallback(async (data: CreateHistoryDto): Promise<HistoryItem | null> => {
        setLoading(true);
        setError(null);
        try {
            const newItem = await historyService.create(data);
            setHistoryItems(prev => [newItem, ...prev]);
            return newItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error creating history";
            setError(errorMessage);
            console.error("Error creating history:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar un registro existente
    const updateHistory = useCallback(async (id: string, data: UpdateHistoryDto): Promise<HistoryItem | null> => {
        setLoading(true);
        setError(null);
        try {
            const updatedItem = await historyService.update(id, data);
            setHistoryItems(prev => prev.map(item => item.id === id ? updatedItem : item));
            return updatedItem;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error updating history";
            setError(errorMessage);
            console.error("Error updating history:", err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar un registro (Borrado lógico en DB, lo ocultamos del UI)
    const deleteHistory = useCallback(async (id: string): Promise<boolean> => {
        setLoading(true);
        setError(null);
        try {
            await historyService.delete(id);
            setHistoryItems(prev => prev.filter(item => item.id !== id));
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error deleting history";
            setError(errorMessage);
            console.error("Error deleting history:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const getHistoryById = useCallback(async (id: string): Promise<HistoryItem | null> => {
        setLoading(true);
        setError(null);
        try {
            return await historyService.getById(id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Error fetching history";
            setError(errorMessage);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        historyItems,
        loading,
        error,
        fetchHistoryByBiosite,
        getHistoryById,
        createHistory,
        updateHistory,
        deleteHistory,
        clearError
    };
};
