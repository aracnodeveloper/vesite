import { useState, useEffect } from 'react';
import { businessCardService } from '../service/VCardService.ts';
import type { BusinessCard, UpdateBusinessCardDto } from '../types/V-Card.ts';

export const useBusinessCard = (userId?: string) => {
    const [businessCard, setBusinessCard] = useState<BusinessCard | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Crear business card
    const createBusinessCard = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const newCard = await businessCardService.createBusinessCard(userId);
            setBusinessCard(newCard);
            return newCard;
        } catch (err) {
            setError('Error al crear la business card');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Obtener business card por usuario
    const fetchBusinessCardByUserId = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const card = await businessCardService.getBusinessCardByUserId(userId);
            setBusinessCard(card);
            return card;
        } catch (err) {
            setError('Error al obtener la business card');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Obtener business card por slug
    const fetchBusinessCardBySlug = async (slug: string) => {
        setLoading(true);
        setError(null);
        try {
            const card = await businessCardService.getBusinessCardBySlug(slug);
            setBusinessCard(card);
            return card;
        } catch (err) {
            setError('Business card no encontrada');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Actualizar business card
    const updateBusinessCard = async (id: string, data: UpdateBusinessCardDto) => {
        setLoading(true);
        setError(null);
        try {
            const updatedCard = await businessCardService.updateBusinessCard(id, data);
            setBusinessCard(updatedCard);
            return updatedCard;
        } catch (err) {
            setError('Error al actualizar la business card');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const generarBusinessQR = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const getCard = await businessCardService.getBussinesCard(userId);
            setBusinessCard(getCard);
            return getCard;
        }catch (err) {
            setError('Error de capa 8');
            throw err;
        }finally {
            setLoading(false);
        }
    }


    // Regenerar código QR
    const regenerateQRCode = async (userId: string) => {
        setLoading(true);
        setError(null);
        try {
            const updatedCard = await businessCardService.regenerateQRCode(userId);
            setBusinessCard(updatedCard);
            return updatedCard;
        } catch (err) {
            setError('Error al regenerar el código QR');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Eliminar business card
    const deleteBusinessCard = async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await businessCardService.deleteBusinessCard(id);
            setBusinessCard(null);
        } catch (err) {
            setError('Error al eliminar la business card');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Cargar automáticamente la business card si se proporciona userId
    useEffect(() => {
        if (userId) {
            fetchBusinessCardByUserId(userId);
        }
    }, [userId]);

    return {
        businessCard,
        loading,
        error,
        createBusinessCard,
        fetchBusinessCardByUserId,
        fetchBusinessCardBySlug,
        updateBusinessCard,
        regenerateQRCode,
        generarBusinessQR,
        deleteBusinessCard,
        setError
    };
};