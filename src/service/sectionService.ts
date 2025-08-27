import apiService from './apiService';
import type {Section, UpdateSectionDto,CreateSectionDto} from '../interfaces/sections.ts'


export interface ReorderSectionDto {
    links: { id: string; orderIndex: number }[];
}

const sectionService = {
    // Crear nueva sección
    createSection: async (data: CreateSectionDto): Promise<Section> => {
        return apiService.create<CreateSectionDto, Section>('/section', data);
    },

    // Obtener todas las secciones
    getAllSections: async (): Promise<Section[]> => {
        return apiService.getAll<Section[]>('/section');
    },

    // Obtener sección por ID
    getSectionById: async (id: string): Promise<Section> => {
        return apiService.getById<Section>('/section', id);
    },

    // Actualizar sección


    // Eliminar sección
    deleteSection: async (id: string): Promise<void> => {
        return apiService.delete('/section', id);
    },



    // Obtener secciones por biosite ID
    getSectionsByBiositeId: async (biositeId: string): Promise<Section[]> => {
        return apiService.getAll<Section[]>(`/section/biosite/${biositeId}`);
    },

    // Obtener secciones por usuario ID
    getSectionsByUserId: async (userId: string): Promise<Section[]> => {
        return apiService.getAll<Section[]>(`/section/user/${userId}`);
    }
};

export default sectionService;