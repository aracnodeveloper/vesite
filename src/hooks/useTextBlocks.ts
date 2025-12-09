// hooks/useTextBlocks.ts

import { useState, useCallback } from 'react';
import apiService from '../service/apiService';
import api from '../service/api';
import { BlockImageApi } from '../constants/EndpointsRoutes';
import type { TextBlock, CreateTextBlockDto, UpdateTextBlockDto } from '../interfaces/textBlocks';

const TEXT_BLOCKS_ENDPOINT = '/texts-blocks';


export const useTextBlocks = () => {
    const [blocks, setBlocks] = useState<TextBlock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Obtener todos los bloques por biositeId
    const getBlocksByBiosite = useCallback(async (biositeId: string): Promise<TextBlock[]> => {
        try {
            setLoading(true);
            setError(null);

            // Primero intentar obtener todos los bloques
            const allBlocks = await apiService.getAll<TextBlock[]>(TEXT_BLOCKS_ENDPOINT);

            // Filtrar por biositeId localmente
            const filteredBlocks = allBlocks
                .filter(block => block.biositeId === biositeId && block.isActive !== false)
                .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

            setBlocks(filteredBlocks);
            return filteredBlocks;
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

            const newBlock = await apiService.create<CreateTextBlockDto, TextBlock>(
                TEXT_BLOCKS_ENDPOINT,
                blockData
            );

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

            const updatedBlock = await apiService.update<UpdateTextBlockDto>(
                TEXT_BLOCKS_ENDPOINT,
                blockId,
                updateData
            );

            setBlocks(prev => prev.map(block =>
                block.id === blockId ? updatedBlock as TextBlock : block
            ));

            return updatedBlock as TextBlock;
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

            await apiService.delete(TEXT_BLOCKS_ENDPOINT, blockId);

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

            const formData = new FormData();

            // Convertir Blob a File si es necesario
            if (imageFile instanceof Blob && !(imageFile instanceof File)) {
                const file = new File([imageFile], 'image.jpg', { type: 'image/jpeg' });
                formData.append('image', file);
            } else {
                formData.append('image', imageFile);
            }

            console.log('Uploading image to:', `${BlockImageApi}/${blockId}`);
            console.log('FormData:', formData);

            const response = await api.post(
                `${BlockImageApi}/${blockId}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            const imageUrl = response.data.data.url;

            // Actualizar el bloque local con la nueva URL
            setBlocks(prev => prev.map(block =>
                block.id === blockId ? { ...block, image: imageUrl } : block
            ));

            return imageUrl;
        } catch (err: any) {
            const errorMsg = err?.response?.data?.message || err instanceof Error ? err.message : 'Error al subir imagen';
            setError(errorMsg);
            console.error('Error uploading block image:', err);
            console.error('Error response:', err?.response?.data);
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