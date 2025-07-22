import apiService from '../service/apiService';
import type {BiositeTheme, BiositeThemeConfig} from "../interfaces/Biosite.ts";
import {themesApi} from "../constants/EndpointsRoutes.ts";
import type { CreateCustomThemeRequest,CityTheme,ThemeCategory,FontOption} from '../interfaces/Themes.ts'

export const themeService = {
    // Obtener todos los temas
    getAllThemes: () => apiService.getAll<BiositeTheme[]>(themesApi),

    // Obtener tema por ID
    getThemeById: (id: string) => apiService.getById<BiositeTheme>(themesApi, id),

    // Crear nuevo tema
    createTheme: (themeData: CreateCustomThemeRequest) =>
        apiService.create<CreateCustomThemeRequest, BiositeTheme>(themesApi, themeData),

    // Actualizar tema
    updateTheme: (id: string, themeData: Partial<CreateCustomThemeRequest>) =>
        apiService.update<Partial<CreateCustomThemeRequest>>(themesApi, id, themeData),

    // Eliminar tema
    deleteTheme: (id: string) => apiService.delete(themesApi, id),

    // Obtener categorías de temas
    getThemeCategories: () => apiService.getAll<ThemeCategory[]>(`${themesApi}/categories`),

    // Obtener temas de ciudades
    getCityThemes: () => apiService.getAll<CityTheme[]>(`${themesApi}/cities`),

    // Obtener opciones de fuentes
    getFontOptions: () => apiService.getAll<FontOption[]>(`${themesApi}/fonts`),

    // Crear tema desde preset de ciudad
    createFromCityPreset: (cityName: string) =>
        apiService.create<{}, BiositeTheme>(`${themesApi}/cities/${cityName}`, {}),

    // Crear tema personalizado
    createCustomTheme: (config: BiositeThemeConfig) =>
        apiService.create<{ config: BiositeThemeConfig }, BiositeTheme>(`${themesApi}/custom`, { config })
};
