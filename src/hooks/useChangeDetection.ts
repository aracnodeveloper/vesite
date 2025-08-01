// hooks/useChangeDetection.ts
import { useState, useEffect, useRef } from 'react';
import { usePreview } from '../context/PreviewContext.tsx';
import {useUser} from "./useUser.ts";

export const useChangeDetection = () => {
    const { biosite, socialLinks, regularLinks, appLinks } = usePreview();
    const {user} = useUser();
    const [hasChanges, setHasChanges] = useState(false);
    const [lastSavedState, setLastSavedState] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    // Función para generar hash del estado actual
    const generateStateHash = () => {
        if (!biosite) return null;

        const currentState = {
            biosite: {
                id: biosite.id,
                title: biosite.title,
                slug: biosite.slug,
                avatarImage: biosite.avatarImage,
                backgroundImage: biosite.backgroundImage,
                colors: biosite.colors,
                fonts: biosite.fonts,
                theme: biosite.theme,
                isActive: biosite.isActive,
                updatedAt: biosite.updatedAt
            },
            socialLinks: socialLinks.map(link => ({
                id: link.id,
                label: link.label,
                url: link.url,
                icon: link.icon,
                color: link.color,
                isActive: link.isActive
            })),
            regularLinks: regularLinks.map(link => ({
                id: link.id,
                title: link.title,
                url: link.url,
                orderIndex: link.orderIndex,
                isActive: link.isActive
            })),
            appLinks: appLinks.map(link => ({
                id: link.id,
                store: link.store,
                url: link.url,
                isActive: link.isActive
            }))
        };

        return JSON.stringify(currentState);
    };

    // Inicializar el estado guardado
    useEffect(() => {
        if (biosite && isInitialMount.current) {
            const currentHash = generateStateHash();
            setLastSavedState(currentHash);
            setHasChanges(false);
            isInitialMount.current = false;
        }
    }, [biosite]);

    // Detectar cambios
    useEffect(() => {
        if (biosite && !isInitialMount.current) {
            const currentHash = generateStateHash();
            const changesDetected = currentHash !== lastSavedState;
            setHasChanges(changesDetected);
        }
    }, [biosite, socialLinks, regularLinks, appLinks, lastSavedState]);

    // Función para marcar como guardado
    const markAsSaved = () => {
        const currentHash = generateStateHash();
        setLastSavedState(currentHash);
        setHasChanges(false);
    };

    // Función para forzar actualización
    const forceUpdate = () => {
        setHasChanges(true);
    };

    // Función para resetear estado
    const resetChangeDetection = () => {
        const currentHash = generateStateHash();
        setLastSavedState(currentHash);
        setHasChanges(false);
    };

    return {
        hasChanges,
        markAsSaved,
        forceUpdate,
        resetChangeDetection
    };
};
