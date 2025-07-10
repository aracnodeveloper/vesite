import { useState, useEffect } from 'react';
import apiService from '../service/apiService';
import { themesApi } from '../constants/EndpointsRoutes';
import type { BiositeTheme, BiositeThemeConfig } from '../interfaces/Biosite';

export interface ThemeCategory {
    id: string;
    name: string;
    themes: BiositeTheme[];
}

export interface FontOption {
    name: string;
    value: string;
    family: string;
}

export interface CityTheme {
    cityName: string;
    config: BiositeThemeConfig;
    previewUrl?: string;
}

export interface CreateCustomThemeRequest {
    name: string;
    description?: string;
    config: BiositeThemeConfig;
}

export const useThemes = () => {
    const [themes, setThemes] = useState<BiositeTheme[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchThemes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getAll<BiositeTheme[]>(themesApi);
            setThemes(data);
        } catch (err) {
            setError('Error al cargar los temas');
            console.error('Error fetching themes:', err);
        } finally {
            setLoading(false);
        }
    };

    const getThemeById = async (id: string): Promise<BiositeTheme | null> => {
        try {
            return await apiService.getById<BiositeTheme>(themesApi, id);
        } catch (err) {
            console.error('Error fetching theme by id:', err);
            return null;
        }
    };

    const createTheme = async (themeData: CreateCustomThemeRequest): Promise<BiositeTheme | null> => {
        try {
            setLoading(true);
            const newTheme = await apiService.create<CreateCustomThemeRequest, BiositeTheme>(
                themesApi,
                themeData
            );
            setThemes(prev => [...prev, newTheme]);
            return newTheme;
        } catch (err) {
            setError('Error al crear el tema');
            console.error('Error creating theme:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateTheme = async (id: string, themeData: Partial<CreateCustomThemeRequest>): Promise<BiositeTheme | null> => {
        try {
            setLoading(true);
            const updatedTheme = await apiService.update<Partial<CreateCustomThemeRequest>>(
                themesApi,
                id,
                themeData
            );
            setThemes(prev => prev.map(theme => theme.id === id ? updatedTheme : theme));
            return updatedTheme;
        } catch (err) {
            setError('Error al actualizar el tema');
            console.error('Error updating theme:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteTheme = async (id: string): Promise<boolean> => {
        try {
            setLoading(true);
            await apiService.delete(themesApi, id);
            setThemes(prev => prev.filter(theme => theme.id !== id));
            return true;
        } catch (err) {
            setError('Error al eliminar el tema');
            console.error('Error deleting theme:', err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThemes();
    }, []);

    return {
        themes,
        loading,
        error,
        fetchThemes,
        getThemeById,
        createTheme,
        updateTheme,
        deleteTheme
    };
};

// hooks/useThemeCategories.ts
export const useThemeCategories = () => {
    const [categories, setCategories] = useState<ThemeCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getAll<ThemeCategory[]>(`${themesApi}/categories`);
            setCategories(data);
        } catch (err) {
            setError('Error al cargar las categorías');
            console.error('Error fetching categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    return {
        categories,
        loading,
        error,
        fetchCategories
    };
};

// hooks/useCityThemes.ts
export const useCityThemes = () => {
    const [cityThemes, setCityThemes] = useState<CityTheme[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCityThemes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getAll<CityTheme[]>(`${themesApi}/cities`);
            setCityThemes(data);
        } catch (err) {
            setError('Error al cargar los temas de ciudades');
            console.error('Error fetching city themes:', err);
        } finally {
            setLoading(false);
        }
    };

    const createFromCityPreset = async (cityName: string): Promise<BiositeTheme | null> => {
        try {
            setLoading(true);
            const newTheme = await apiService.create<{}, BiositeTheme>(
                `${themesApi}/cities/${cityName}`,
                {}
            );
            return newTheme;
        } catch (err) {
            setError('Error al crear tema desde preset de ciudad');
            console.error('Error creating from city preset:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCityThemes();
    }, []);

    return {
        cityThemes,
        loading,
        error,
        fetchCityThemes,
        createFromCityPreset
    };
};

// hooks/useFontOptions.ts
export const useFontOptions = () => {
    const [fontOptions, setFontOptions] = useState<FontOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFontOptions = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiService.getAll<FontOption[]>(`${themesApi}/fonts`);
            setFontOptions(data);
        } catch (err) {
            setError('Error al cargar las opciones de fuentes');
            console.error('Error fetching font options:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFontOptions();
    }, []);

    return {
        fontOptions,
        loading,
        error,
        fetchFontOptions
    };
};

// hooks/useCustomTheme.ts
export const useCustomTheme = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createCustomTheme = async (config: BiositeThemeConfig): Promise<BiositeTheme | null> => {
        try {
            setLoading(true);
            setError(null);
            const newTheme = await apiService.create<{ config: BiositeThemeConfig }, BiositeTheme>(
                `${themesApi}/custom`,
                { config }
            );
            return newTheme;
        } catch (err) {
            setError('Error al crear tema personalizado');
            console.error('Error creating custom theme:', err);
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        createCustomTheme,
        loading,
        error
    };
};
