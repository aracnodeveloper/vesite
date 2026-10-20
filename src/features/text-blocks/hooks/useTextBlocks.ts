// hooks/useTextBlocks.ts

import { useState, useCallback } from 'react';
import type { TextBlock, CreateTextBlockDto, UpdateTextBlockDto } from '../types/textBlocks';
import { textBlockService } from '../services/textBlockService';

export const useTextBlocks = () => {
    const [blocks, setBlocks] = useState<TextBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener todos los bloques por biositeId
    const getBlocksByBiosite = useCallback(async (biositeId: string): Promise<TextBlock[]> => {
        try {
            setLoading(true);
            setError(null);

            const allBlocks = await textBlockService.getByBiosite(biositeId);

            setBlocks(allBlocks);
            return allBlocks;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al obtener bloques';
            setError(errorMsg);
            console.error('Error fetching text blocks:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Crear un nuevo bloque
    const createBlock = useCallback(async (blockData: CreateTextBlockDto): Promise<TextBlock> => {
        try {
            setLoading(true);
            setError(null);

            const newBlock = await textBlockService.create(blockData);

            setBlocks(prev => [...prev, newBlock].sort((a, b) =>
                (a.orderIndex || 0) - (b.orderIndex || 0)
            ));

            return newBlock;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al crear bloque';
            setError(errorMsg);
            console.error('Error creating text block:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Actualizar un bloque existente
    const updateBlock = useCallback(async (
        blockId: string,
        updateData: UpdateTextBlockDto
    ): Promise<TextBlock> => {
        try {
            setLoading(true);
            setError(null);

            const updatedBlock = await textBlockService.update(blockId, updateData);

            setBlocks(prev => prev.map(block =>
                block.id === blockId ? updatedBlock : block
            ));

            return updatedBlock;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al actualizar bloque';
            setError(errorMsg);
            console.error('Error updating text block:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Eliminar un bloque
    const deleteBlock = useCallback(async (blockId: string): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            await textBlockService.remove(blockId);

            setBlocks(prev => prev.filter(block => block.id !== blockId));
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al eliminar bloque';
            setError(errorMsg);
            console.error('Error deleting text block:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Subir imagen para un bloque
    const uploadBlockImage = useCallback(async (
        blockId: string,
        imageFile: File | Blob
    ): Promise<string> => {
        try {
            setLoading(true);
            setError(null);

            const imageUrl = await textBlockService.uploadImage(blockId, imageFile);

            // Actualizar el bloque local con la nueva URL
            setBlocks(prev => prev.map(block =>
                block.id === blockId ? { ...block, image: imageUrl } : block
            ));

            return imageUrl;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error al subir imagen';
            setError(errorMsg);
            console.error('Error uploading block image:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Limpiar error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        blocks,
        loading,
        error,
        getBlocksByBiosite,
        createBlock,
        updateBlock,
        deleteBlock,
        uploadBlockImage,
        clearError,
    };
};